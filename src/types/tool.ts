export type ToolCategory = "Compress" | "Resize" | "Convert" | "Edit" | "Analyze" | "Generate";

export type ToolDefinition = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  /** Short format label shown on cards, e.g. "JPG → PNG" */
  glyph: string;
  supportedFormats: string[];
  relatedTools: string[];
  popular?: boolean;
  /** Short highlight shown on its card, e.g. "Popular for Applications" */
  badge?: string;
  /** "soon" tools are listed but not linked until implemented */
  status: "live" | "soon";
};
