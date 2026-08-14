import fitz  # PyMuPDF
import cv2
import numpy as np
import base64
import os
import json
import re
import time
import requests
from pathlib import Path

# Optional imports
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


class CatalogExtractor:
    def __init__(self, config_path="config.json"):
        with open(config_path, 'r') as f:
            self.config = json.load(f)

        self.dpi = self.config.get("dpi", 300)
        self.min_image_area = self.config.get("min_image_area", 5000)
        self.max_image_area_ratio = self.config.get("max_image_area_ratio", 0.85)
        self.padding = self.config.get("padding", 10)
        self.ai_delay = self.config.get("ai_delay", 0.5)

        # Setup AI provider
        self.ai_provider = self._setup_ai()

    def _setup_ai(self):
        # Priority 1: NVIDIA NIM (free tier - 1000 req/day)
        nim_key = self.config.get("nim_api_key") or os.environ.get("NIM_API_KEY")
        if nim_key and OPENAI_AVAILABLE:
            try:
                self.nim_client = OpenAI(
                    base_url="https://integrate.api.nvidia.com/v1",
                    api_key=nim_key
                )
                self.nim_model = self.config.get("nim_model", "nvidia/vila")
                print(f"AI Provider: NVIDIA NIM ({self.nim_model}) - Free tier")
                return "nim"
            except Exception as e:
                print(f"NIM setup failed: {e}")

        # Priority 2: Ollama + LLaVA (local, free)
        ollama_url = self.config.get("ollama_url", "http://localhost:11434")
        if self._check_ollama(ollama_url):
            self.ollama_url = ollama_url
            self.ollama_model = self.config.get("ollama_model", "llava")
            print(f"AI Provider: Ollama ({self.ollama_model}) - Local/Free")
            return "ollama"

        print("AI Provider: None (OCR only)")
        print("  - For NIM: Set nim_api_key in config.json (free at build.nvidia.com)")
        print("  - For Ollama: Install from ollama.com, then run: ollama pull llava")
        return "ocr"

    def _check_ollama(self, url="http://localhost:11434"):
        try:
            resp = requests.get(f"{url}/api/tags", timeout=3)
            if resp.status_code == 200:
                models = resp.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                if any("llava" in m for m in model_names):
                    return True
                print(f"  Ollama running but no vision model found. Available: {model_names}")
                print(f"  Run: ollama pull llava")
            return False
        except:
            return False

    def pdf_to_images(self, pdf_path, output_dir="temp"):
        os.makedirs(output_dir, exist_ok=True)
        doc = fitz.open(pdf_path)
        page_images = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            mat = fitz.Matrix(self.dpi / 72, self.dpi / 72)
            pix = page.get_pixmap(matrix=mat)
            img_path = os.path.join(output_dir, f"page_{page_num + 1}.png")
            pix.save(img_path)
            page_images.append(img_path)

        doc.close()
        return page_images

    def detect_product_regions(self, image_path):
        img = cv2.imread(image_path)
        if img is None:
            return []

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        page_area = h * w

        regions = []
        regions.extend(self._detect_by_edges(gray, page_area))
        regions.extend(self._detect_by_color(img, page_area))
        regions = self._merge_overlapping(regions)
        regions = self._filter_regions(regions, page_area)

        return regions

    def _detect_by_edges(self, gray, page_area):
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 30, 100)

        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=2)

        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h

            if area < self.min_image_area:
                continue
            if area > page_area * self.max_image_area_ratio:
                continue

            aspect = w / h if h > 0 else 0
            if aspect > 5 or aspect < 0.2:
                continue

            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            if hull_area > 0:
                solidity = cv2.contourArea(contour) / hull_area
                if solidity < 0.5:
                    continue

            regions.append([x, y, x + w, y + h])

        return regions

    def _detect_by_color(self, img, page_area):
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        regions = []

        lower_bound = np.array([0, 0, 50])
        upper_bound = np.array([180, 255, 240])

        mask = cv2.inRange(hsv, lower_bound, upper_bound)
        mask = cv2.bitwise_not(mask)

        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=3)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h

            if area < self.min_image_area:
                continue
            if area > page_area * self.max_image_area_ratio:
                continue

            regions.append([x, y, x + w, y + h])

        return regions

    def _merge_overlapping(self, regions, overlap_threshold=0.3):
        if not regions:
            return []

        regions = sorted(regions, key=lambda r: (r[1], r[0]))
        merged = []
        used = set()

        for i, r1 in enumerate(regions):
            if i in used:
                continue

            current = r1[:]
            for j, r2 in enumerate(regions):
                if j <= i or j in used:
                    continue

                if self._compute_iou(current, r2) > overlap_threshold:
                    current[0] = min(current[0], r2[0])
                    current[1] = min(current[1], r2[1])
                    current[2] = max(current[2], r2[2])
                    current[3] = max(current[3], r2[3])
                    used.add(j)

            merged.append(current)
            used.add(i)

        return merged

    def _compute_iou(self, box1, box2):
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])

        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = area1 + area2 - intersection

        return intersection / union if union > 0 else 0

    def _filter_regions(self, regions, page_area):
        filtered = []
        for r in regions:
            w = r[2] - r[0]
            h = r[3] - r[1]
            area = w * h

            if area < page_area * 0.005 or area > page_area * 0.80:
                continue

            filtered.append(r)

        final = []
        for i, r1 in enumerate(filtered):
            contained = False
            for j, r2 in enumerate(filtered):
                if i != j:
                    if (r1[0] >= r2[0] and r1[1] >= r2[1] and
                        r1[2] <= r2[2] and r1[3] <= r2[3]):
                        contained = True
                        break
            if not contained:
                final.append(r1)

        return final

    def crop_region(self, image_path, region, padding=0):
        img = cv2.imread(image_path)
        h, w = img.shape[:2]

        x1 = max(0, region[0] - padding)
        y1 = max(0, region[1] - padding)
        x2 = min(w, region[2] + padding)
        y2 = min(h, region[3] + padding)

        cropped = img[y1:y2, x1:x2]
        return cropped

    def image_to_base64(self, image, max_size=512):
        # Resize image for faster API calls
        h, w = image.shape[:2]
        if max(h, w) > max_size:
            scale = max_size / max(h, w)
            image = cv2.resize(image, (int(w * scale), int(h * scale)))
        _, buffer = cv2.imencode('.png', image)
        return base64.b64encode(buffer).decode('utf-8')

    def identify_product_with_ai(self, image, context="plastic product catalog"):
        if self.ai_provider == "nim":
            return self._identify_with_nim(image, context)
        elif self.ai_provider == "ollama":
            return self._identify_with_ollama(image, context)
        return None

    def _identify_with_nim(self, image, context):
        try:
            b64_image = self.image_to_base64(image, max_size=384)

            prompt = (
                "What plastic product is this? "
                "Reply ONLY with: name=color=size "
                "Example: tiffen_box=blue=medium"
            )

            response = self.nim_client.chat.completions.create(
                model=self.nim_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/png;base64,{b64_image}"}
                            }
                        ]
                    }
                ],
                max_tokens=50,
                temperature=0.1
            )

            result_text = response.choices[0].message.content.strip().lower()
            print(f"       NIM raw response: {result_text}")

            # Parse name=color=size format
            if "=" in result_text:
                parts = result_text.split("=")
                name = parts[0].strip().replace(" ", "_") if len(parts) > 0 else "unknown_product"
                color = parts[1].strip() if len(parts) > 1 else ""
                size = parts[2].strip() if len(parts) > 2 else ""

                # Clean up
                name = re.sub(r'[^a-z0-9_]', '_', name)
                name = re.sub(r'_+', '_', name).strip('_')

                # Reject garbage/placeholder responses
                bad_names = {"name", "product", "unknown", "none", "item", "object", "id", "type", "cat", "img", "image", "pic", "photo"}
                if name and name not in bad_names and len(name) >= 3:
                    return {
                        "name": name,
                        "color": color,
                        "size": size,
                        "category": "",
                        "confidence": 0.8
                    }

            return None

        except Exception as e:
            error_str = str(e).lower()
            print(f"       NIM error: {e}")
            if "429" in error_str or "rate" in error_str or "quota" in error_str:
                print("       Rate limited, sleeping 3s...")
                time.sleep(3)
            return None

    def _identify_with_ollama(self, image, context):
        try:
            b64_image = self.image_to_base64(image)

            prompt = (
                "You are a product identification expert for Indian plastic product catalogs. "
                "Analyze this image and return a JSON object with: "
                '{"name": "product_name", "color": "color", "size": "size", '
                '"category": "category", "confidence": 0.0_to_1.0}\n'
                "Rules:\n"
                "- Use lowercase English, underscores for spaces\n"
                "- Be specific (water_bottle not bottle)\n"
                "- Empty string if not visible\n"
                "- Return ONLY valid JSON"
            )

            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "images": [b64_image],
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "num_predict": 200
                }
            }

            resp = requests.post(
                f"{self.ollama_url}/api/generate",
                json=payload,
                timeout=60
            )

            if resp.status_code != 200:
                return None

            result_text = resp.json().get("response", "").strip()

            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
                if result_text.endswith("```"):
                    result_text = result_text[:-3]

            result = json.loads(result_text.strip())

            return {
                "name": result.get("name", "unknown_product"),
                "color": result.get("color", ""),
                "size": result.get("size", ""),
                "category": result.get("category", ""),
                "confidence": result.get("confidence", 0.0)
            }

        except json.JSONDecodeError:
            return None
        except Exception as e:
            print(f"       Ollama error: {e}")
            return None

    def extract_text_ocr(self, image):
        if not TESSERACT_AVAILABLE:
            return ""

        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            text = pytesseract.image_to_string(binary, config='--psm 6')
            return text.strip()
        except:
            return ""

    def extract_text_near_region(self, image_path, region, search_direction="below", search_range=150):
        img = cv2.imread(image_path)
        h, w = img.shape[:2]

        x1, y1, x2, y2 = region

        if search_direction == "below":
            text_y1 = min(y2, h - 1)
            text_y2 = min(y2 + search_range, h)
            text_x1 = max(0, x1 - 20)
            text_x2 = min(w, x2 + 20)
        elif search_direction == "above":
            text_y1 = max(0, y1 - search_range)
            text_y2 = y1
            text_x1 = max(0, x1 - 20)
            text_x2 = min(w, x2 + 20)
        elif search_direction == "left":
            text_y1 = max(0, y1 - 20)
            text_y2 = min(h, y2 + 20)
            text_x1 = max(0, x1 - search_range)
            text_x2 = x1
        elif search_direction == "right":
            text_y1 = max(0, y1 - 20)
            text_y2 = min(h, y2 + 20)
            text_x1 = x2
            text_x2 = min(w, x2 + search_range)
        else:
            return ""

        if text_y1 >= text_y2 or text_x1 >= text_x2:
            return ""

        text_region = img[text_y1:text_y2, text_x1:text_x2]
        return self.extract_text_ocr(text_region)

    def parse_product_specs(self, text):
        text = text.strip()
        if not text:
            return {"name": "unknown_product", "color": "", "size": ""}

        text = re.sub(r'[^\w\s\-/]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()

        size_patterns = [
            r'(\d+\s*[xX×]\s*\d+\s*(?:cm|mm|inch|in)?)',
            r'(\d+\s*(?:ml|l|ltr|litre|liter|kg|g|gm|gram|oz|lb))',
            r'\b(xs|s|m|l|xl|xxl|small|medium|large|extra\s*large)\b',
            r'(\d+\s*(?:pcs|piece|pack|set|pair))',
        ]

        size = ""
        for pattern in size_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                size = match.group(1).strip()
                text = text[:match.start()] + text[match.end():]
                break

        colors = [
            'red', 'blue', 'green', 'yellow', 'black', 'white', 'orange',
            'purple', 'pink', 'brown', 'grey', 'gray', 'silver', 'gold',
            'transparent', 'clear', 'navy', 'teal', 'maroon', 'beige',
            'cream', 'olive', 'cyan', 'magenta', 'ivory', 'charcoal',
            'peach', 'coral', 'turquoise', 'lavender', 'mint', 'rust'
        ]

        color = ""
        text_lower = text.lower()
        for c in colors:
            if c in text_lower:
                color = c
                text = re.sub(r'\b' + c + r'\b', '', text, flags=re.IGNORECASE)
                break

        name = text.strip()
        name = re.sub(r'\s+', '_', name)
        name = re.sub(r'_+', '_', name)
        name = name.strip('_')

        if not name:
            name = "unknown_product"

        return {
            "name": name[:80],
            "color": color,
            "size": size
        }

    def generate_filename(self, specs, index):
        parts = [specs["name"]]
        if specs.get("color"):
            parts.append(specs["color"])
        if specs.get("size"):
            parts.append(specs["size"])

        filename = "_".join(parts)
        filename = re.sub(r'[^\w\-]', '_', filename)
        filename = re.sub(r'_+', '_', filename)
        filename = filename.strip('_')

        return f"{filename}_{index:03d}.png"

    def process_catalog(self, pdf_path, brand_name, output_dir="output"):
        print(f"\n{'='*60}")
        print(f"Processing: {pdf_path}")
        print(f"Brand: {brand_name}")
        print(f"AI: {self.ai_provider.upper()}")
        print(f"{'='*60}\n")

        brand_dir = os.path.join(output_dir, brand_name)
        os.makedirs(brand_dir, exist_ok=True)

        print("[1/4] Converting PDF to images...")
        page_images = self.pdf_to_images(pdf_path)
        print(f"       Converted {len(page_images)} pages\n")

        print("[2/4] Detecting product regions...")
        all_crops = []

        for page_img in page_images:
            regions = self.detect_product_regions(page_img)
            print(f"       {os.path.basename(page_img)}: Found {len(regions)} regions")

            for region in regions:
                cropped = self.crop_region(page_img, region, padding=self.padding)
                all_crops.append({
                    "image": cropped,
                    "region": region,
                    "source_page": page_img
                })

        print(f"\n       Total product regions found: {len(all_crops)}\n")

        print("[3/4] Identifying products and renaming...")
        saved_count = 0
        ai_used = 0
        ocr_used = 0

        for i, crop_data in enumerate(all_crops):
            specs = None

            # Try AI identification
            if self.ai_provider in ["nim", "ollama"]:
                specs = self.identify_product_with_ai(crop_data["image"])
                if specs and specs.get("name") != "unknown_product":
                    ai_used += 1
                    time.sleep(self.ai_delay)
                else:
                    specs = None

            # Fallback to OCR
            if specs is None:
                text = ""
                for direction in ["below", "above", "right", "left"]:
                    text = self.extract_text_near_region(
                        crop_data["source_page"],
                        crop_data["region"],
                        search_direction=direction
                    )
                    if text and len(text) > 2:
                        break

                specs = self.parse_product_specs(text)
                ocr_used += 1

            filename = self.generate_filename(specs, i + 1)

            save_path = os.path.join(brand_dir, filename)
            cv2.imwrite(save_path, crop_data["image"])
            saved_count += 1

            if (i + 1) % 10 == 0:
                print(f"       Processed {i + 1}/{len(all_crops)}")

        print(f"\n[4/4] Complete!")
        print(f"       Saved {saved_count} images to {brand_dir}")
        print(f"       AI identified: {ai_used}")
        print(f"       OCR fallback: {ocr_used}\n")

        for page_img in page_images:
            os.remove(page_img)

        return saved_count

    def process_all_catalogs(self):
        total_products = 0

        for catalog in self.config["catalogs"]:
            count = self.process_catalog(
                pdf_path=catalog["pdf_path"],
                brand_name=catalog["brand_name"],
                output_dir=self.config.get("output_dir", "output")
            )
            total_products += count

        print(f"\n{'='*60}")
        print(f"ALL DONE! Total products extracted: {total_products}")
        print(f"{'='*60}")

        return total_products


if __name__ == "__main__":
    extractor = CatalogExtractor("config.json")
    extractor.process_all_catalogs()
