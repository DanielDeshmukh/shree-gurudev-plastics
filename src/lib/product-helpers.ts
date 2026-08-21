export function parseColor(rawColor: string, productName: string): string {
  let c = rawColor || "Other";
  const prefix = productName.toLowerCase().trim();
  const prefixHyphen = prefix.replace(/\s+/g, "-");
  if (c.toLowerCase().startsWith(prefix + " ")) {
    c = c.substring(prefix.length + 1);
  } else if (c.toLowerCase().startsWith(prefixHyphen + " ")) {
    c = c.substring(prefixHyphen.length + 1);
  } else if (c.toLowerCase().startsWith(prefixHyphen + "-")) {
    c = c.substring(prefixHyphen.length + 1);
  }
  c = c.replace(/\s+\d+$/, "").trim();
  return c || "Other";
}

export function matchesProduct(rawColor: string, productName: string): boolean {
  const prefix = productName.toLowerCase().trim();
  const prefixHyphen = prefix.replace(/\s+/g, "-");
  const c = (rawColor || "").toLowerCase();
  return c.startsWith(prefix + " ") || c.startsWith(prefixHyphen + " ") || c.startsWith(prefixHyphen + "-");
}

export function getColorNames(images: { color: string | null }[], productName: string): string[] {
  return [...new Set(
    images
      .map(img => parseColor(img.color || "", productName))
      .filter(c => c !== "Other")
  )];
}
