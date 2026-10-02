import type { ToolCategory, ToolDefinition } from "@/types/tool";

export const CATEGORIES: { name: ToolCategory; blurb: string }[] = [
  { name: "Compress", blurb: "Make files smaller" },
  { name: "Resize", blurb: "Change dimensions" },
  { name: "Convert", blurb: "Switch formats" },
  { name: "Edit", blurb: "Crop and rotate" },
  { name: "Analyze", blurb: "Inspect any image" },
  { name: "Generate", blurb: "Icons and PDFs" },
];

export const TOOLS: ToolDefinition[] = [
  { slug: "image-background-changer", name: "Passport Photo Maker & Background Changer", description: "Remove your photo's background, choose white or blue, crop to a passport-style size, and download.", category: "Edit", glyph: "White / Blue", supportedFormats: ["JPG", "PNG", "WEBP"], relatedTools: ["image-compressor", "image-resizer", "image-cropper", "image-dimensions", "jpg-to-png", "image-metadata-viewer", "image-to-pdf"], popular: true, badge: "Popular for Applications", status: "live" },
  { slug: "image-compressor", name: "Image Compressor", description: "Shrink JPG, PNG and WEBP files and see exactly how much you saved.", category: "Compress", glyph: "4.2 → 1.1 MB", supportedFormats: ["JPG", "PNG", "WEBP"], relatedTools: ["image-resizer", "jpg-to-webp", "image-dimensions"], popular: true, status: "live" },
  { slug: "image-resizer", name: "Image Resizer", description: "Set exact pixel sizes or a percentage, with a lock for aspect ratio.", category: "Resize", glyph: "1920 × 1080", supportedFormats: ["JPG", "PNG", "WEBP"], relatedTools: ["image-compressor", "image-cropper", "image-dimensions"], popular: true, status: "live" },
  { slug: "image-cropper", name: "Image Cropper", description: "Crop freehand or to a ratio like 1:1, 4:3 and 16:9. Rotate and zoom too.", category: "Edit", glyph: "16:9", supportedFormats: ["JPG", "PNG", "WEBP"], relatedTools: ["image-resizer", "favicon-generator"], popular: true, status: "live" },
  { slug: "jpg-to-png", name: "JPG to PNG", description: "Convert JPG photos to lossless PNG in one step.", category: "Convert", glyph: "JPG → PNG", supportedFormats: ["JPG", "PNG"], relatedTools: ["png-to-jpg", "png-to-webp"], popular: true, status: "live" },
  { slug: "png-to-jpg", name: "PNG to JPG", description: "Turn PNGs into smaller JPGs with a quality setting.", category: "Convert", glyph: "PNG → JPG", supportedFormats: ["PNG", "JPG"], relatedTools: ["jpg-to-png", "image-compressor"], status: "live" },
  { slug: "webp-to-jpg", name: "WEBP to JPG", description: "Open WEBP images anywhere by converting them to JPG.", category: "Convert", glyph: "WEBP → JPG", supportedFormats: ["WEBP", "JPG"], relatedTools: ["webp-to-png", "jpg-to-webp"], status: "live" },
  { slug: "jpg-to-webp", name: "JPG to WEBP", description: "Cut page weight by converting JPG to modern WEBP.", category: "Convert", glyph: "JPG → WEBP", supportedFormats: ["JPG", "WEBP"], relatedTools: ["png-to-webp", "image-compressor"], status: "live" },
  { slug: "png-to-webp", name: "PNG to WEBP", description: "Keep transparency and lose the weight.", category: "Convert", glyph: "PNG → WEBP", supportedFormats: ["PNG", "WEBP"], relatedTools: ["jpg-to-webp", "webp-to-png"], status: "live" },
  { slug: "webp-to-png", name: "WEBP to PNG", description: "Convert WEBP to PNG for editors that don't read WEBP.", category: "Convert", glyph: "WEBP → PNG", supportedFormats: ["WEBP", "PNG"], relatedTools: ["webp-to-jpg", "png-to-webp"], status: "live" },
  { slug: "heic-to-jpg", name: "HEIC to JPG", description: "Convert iPhone HEIC photos to JPG.", category: "Convert", glyph: "HEIC → JPG", supportedFormats: ["HEIC", "JPG"], relatedTools: ["jpg-to-png", "image-compressor"], popular: true, status: "live" },
  { slug: "image-to-pdf", name: "Image to PDF", description: "Combine images into one PDF. Reorder pages and set size and margins.", category: "Generate", glyph: "IMG → PDF", supportedFormats: ["JPG", "PNG", "WEBP", "PDF"], relatedTools: ["pdf-to-jpg", "image-compressor"], status: "live" },
  { slug: "pdf-to-jpg", name: "PDF to JPG", description: "Turn any page range of a PDF into JPG images.", category: "Convert", glyph: "PDF → JPG", supportedFormats: ["PDF", "JPG"], relatedTools: ["image-to-pdf", "image-compressor"], status: "live" },
  { slug: "favicon-generator", name: "Favicon Generator", description: "Make every favicon size, an ICO file and install instructions from one image.", category: "Generate", glyph: "16 32 180", supportedFormats: ["PNG", "JPG", "WEBP", "ICO"], relatedTools: ["ico-converter", "image-cropper"], status: "live" },
  { slug: "ico-converter", name: "ICO Converter", description: "Convert PNG, JPG or WEBP into a multi-size ICO file.", category: "Generate", glyph: "PNG → ICO", supportedFormats: ["PNG", "JPG", "WEBP", "ICO"], relatedTools: ["favicon-generator", "image-resizer"], status: "live" },
  { slug: "image-dimensions", name: "Image Dimensions", description: "Read width, height, aspect ratio and megapixels from any image.", category: "Analyze", glyph: "W × H", supportedFormats: ["JPG", "PNG", "WEBP", "HEIC"], relatedTools: ["image-dpi-checker", "image-resizer"], status: "live" },
  { slug: "image-dpi-checker", name: "Image DPI Checker", description: "Check DPI and the physical print size an image will produce.", category: "Analyze", glyph: "300 DPI", supportedFormats: ["JPG", "PNG"], relatedTools: ["image-dimensions", "image-metadata-viewer"], status: "live" },
  { slug: "image-color-picker", name: "Image Color Picker", description: "Pick any pixel and copy it as HEX, RGB, HSL or HSV.", category: "Analyze", glyph: "#3346FF", supportedFormats: ["JPG", "PNG", "WEBP"], relatedTools: ["image-dimensions", "image-cropper"], status: "live" },
  { slug: "image-metadata-viewer", name: "Image Metadata Viewer", description: "See the EXIF and file details stored inside an image.", category: "Analyze", glyph: "EXIF", supportedFormats: ["JPG", "PNG", "WEBP", "HEIC"], relatedTools: ["image-dimensions", "image-dpi-checker"], status: "live" },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const getRelated = (tool: ToolDefinition) =>
  tool.relatedTools.map(getTool).filter((t): t is ToolDefinition => Boolean(t));
export const toolsByCategory = (c: ToolCategory) => TOOLS.filter((t) => t.category === c);
