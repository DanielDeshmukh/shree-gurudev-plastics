# Catalog Product Image Extractor

Extract individual product images from PDF catalogs, identify them using AI or OCR, and rename automatically based on product specs (name, color, size).

## Features

- PDF to high-resolution image conversion
- Automatic product region detection (contour + color segmentation)
- AI-powered product identification (Free options: Google Gemini / Ollama LLaVA)
- OCR fallback when AI is unavailable
- Automatic naming: `{product_name}_{color}_{size}_{index}.png`
- Brand-wise organized output directories
- Manual rename utility for corrections
- Batch rename via CSV

## AI Options (Both Free)

| Option | Cost | Setup |
|--------|------|-------|
| **Google Gemini** | Free (15 req/min) | Get API key from aistudio.google.com |
| **Ollama + LLaVA** | Free (local) | Install from ollama.com, run `ollama pull llava` |
| **OCR Only** | Free | Install Tesseract |

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup AI Provider (Choose One)

#### Option A: Google Gemini (Recommended - Easiest)

1. Go to https://aistudio.google.com/apikey
2. Create free API key
3. Add to `config.json`:
```json
{
  "gemini_api_key": "your-key-here"
}
```

#### Option B: Ollama + LLaVA (Fully Local/Offline)

1. Download from https://ollama.com
2. Install and run Ollama
3. Pull vision model:
```bash
ollama pull llava
```
4. Script auto-detects Ollama running locally

#### Option C: OCR Only (No AI)

Install Tesseract OCR:

**Windows:** Download from https://github.com/UB-Mannheim/tesseract/wiki

**Linux:**
```bash
sudo apt install tesseract-ocr
```

**Mac:**
```bash
brew install tesseract
```

### 3. Place PDF Catalogs

Put your PDF files in the `catalogs/` folder.

### 4. Update Config

Edit `config.json` with your brand names:

```json
{
  "catalogs": [
    {
      "pdf_path": "catalogs/brand_a.pdf",
      "brand_name": "brand_a"
    },
    {
      "pdf_path": "catalogs/brand_b.pdf",
      "brand_name": "brand_b"
    }
  ]
}
```

## Usage

### Run Extractor

```bash
python ai_extractor.py
```

Script auto-detects available AI provider in this order:
1. Gemini (if API key provided)
2. Ollama (if running locally)
3. OCR only (fallback)

### Output Structure

```
output/
├── brand_a/
│   ├── water_bottle_blue_1l_001.png
│   ├── storage_container_red_large_002.png
│   └── ...
├── brand_b/
│   └── ...
└── brand_c/
    └── ...
```

## Manual Rename

### List all brands
```bash
python manual_rename.py list
```

### Interactive rename mode
```bash
python manual_rename.py rename brand_a
```

### Export file list to CSV
```bash
python manual_rename.py csv brand_a
```

### Generate rename template CSV
```bash
python manual_rename.py template brand_a
```

Edit the CSV with correct names, then batch rename:
```bash
python manual_rename.py batch brand_a brand_a_rename_template.csv
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `dpi` | 300 | PDF render resolution (higher = better quality, slower) |
| `min_image_area` | 5000 | Minimum pixel area to detect as product |
| `max_image_area_ratio` | 0.85 | Max ratio of product area to page area |
| `padding` | 10 | Pixel padding around detected regions |
| `gemini_api_key` | "" | Google Gemini API key (free at aistudio.google.com) |
| `ollama_url` | http://localhost:11434 | Ollama server URL |
| `ollama_model` | llava | Ollama vision model |
| `ai_delay` | 0.5 | Delay between AI calls (rate limiting) |

## Troubleshooting

### Products not detected
- Increase `dpi` to 400
- Decrease `min_image_area`
- Check if PDF is text-based (scanned PDFs may need preprocessing)

### Wrong product names
- Use manual rename utility
- Check OCR text extraction accuracy
- Ensure AI API key is valid

### Tesseract not found (Windows)
Set the path in `extractor.py`:
```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### Gemini API error
- Check API key is correct
- Free tier: 15 requests/minute, 1M tokens/day
- Wait and retry if rate limited

### Ollama not detecting LLaVA
- Ensure Ollama is running (`ollama serve`)
- Check model installed: `ollama list`
- Pull model: `ollama pull llava`

## File Structure

```
catalog_extractor/
├── ai_extractor.py      # Main script (Gemini/Ollama/OCR)
├── extractor.py         # Basic extractor (OCR only)
├── manual_rename.py     # Manual rename utility
├── config.json          # Configuration file
├── requirements.txt     # Python dependencies
├── catalogs/            # Place PDF catalogs here
├── output/              # Extracted images saved here
└── temp/                # Temporary files (auto-cleaned)
```
