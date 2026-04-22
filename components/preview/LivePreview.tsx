"use client";

import { ComponentNode } from "@/types";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

interface LivePreviewProps {
    components: ComponentNode[];
}

export default function LivePreview({ components }: LivePreviewProps) {
    const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

    const deviceWidths = {
        desktop: "w-full",
        tablet: "w-[768px]",
        mobile: "w-[375px]",
    };

    const getTypePreset = (node: ComponentNode) => {
        switch (node.type) {
            case "layout":
                return "min-h-screen bg-slate-50 px-6 py-8";
            case "page":
                return "max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6";
            case "section":
                return "bg-white border border-slate-200 rounded-xl p-5 space-y-4";
            case "component":
                return "bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3";
            case "atom":
                return "inline-flex items-center rounded-md bg-white border border-slate-300 px-3 py-1.5 text-sm text-slate-700";
            default:
                return "";
        }
    };

    const needsImage = (name: string, description: string) => {
        const text = `${name} ${description}`.toLowerCase();
        return /(image|img|photo|avatar|logo|banner|hero|thumbnail|cover)/.test(text);
    };

    /**
     * Recursively transforms a ComponentNode tree into an HTML string.
     */
    const renderNodeToHtml = (node: ComponentNode): string => {
        const classes = `${getTypePreset(node)} ${node.tailwindClasses.join(" ")}`.trim();
        const childrenHtml = node.children.map(renderNodeToHtml).join("");
        const imageBlock = needsImage(node.name, node.description)
            ? `
            <img
              src="https://picsum.photos/seed/${encodeURIComponent(node.id || node.name)}/960/520"
              alt="${node.name}"
              class="w-full h-48 object-cover rounded-lg border border-slate-200"
            />
          `
            : "";

        return `
      <div class="${classes}" title="${node.description}">
        <div class="flex items-center justify-between gap-3 mb-2">
          <h3 class="text-sm font-semibold text-slate-800">${node.name}</h3>
          <span class="text-[10px] uppercase tracking-widest text-slate-400">${node.type}</span>
        </div>
        ${imageBlock}
        ${childrenHtml || `<p class="text-sm text-slate-500">${node.description || "Generated component content."}</p>`}
      </div>
    `;
    };

    const renderedContent = components.map(renderNodeToHtml).join("");

    const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  border: "hsl(214.3 31.8% 91.4%)",
                  input: "hsl(214.3 31.8% 91.4%)",
                  ring: "hsl(215 20.2% 65.1%)",
                  background: "hsl(0 0% 100%)",
                  foreground: "hsl(222.2 84% 4.9%)",
                  primary: {
                    DEFAULT: "hsl(222.2 47.4% 11.2%)",
                    foreground: "hsl(210 40% 98%)",
                  },
                  secondary: {
                    DEFAULT: "hsl(210 40% 96.1%)",
                    foreground: "hsl(222.2 47.4% 11.2%)",
                  },
                  destructive: {
                    DEFAULT: "hsl(0 84.2% 60.2%)",
                    foreground: "hsl(210 40% 98%)",
                  },
                  muted: {
                    DEFAULT: "hsl(210 40% 96.1%)",
                    foreground: "hsl(215.4 16.3% 46.9%)",
                  },
                  accent: {
                    DEFAULT: "hsl(210 40% 96.1%)",
                    foreground: "hsl(222.2 47.4% 11.2%)",
                  },
                  popover: {
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(222.2 84% 4.9%)",
                  },
                  card: {
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(222.2 84% 4.9%)",
                  },
                },
              }
            }
          }
        </script>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          /* Hide scrollbars but allow scrolling */
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        </style>
      </head>
      <body class="bg-slate-100 min-h-screen">
        <div id="root" class="p-5 md:p-8">
          ${renderedContent || `
            <div class="flex flex-col items-center justify-center min-h-[400px] text-gray-300 font-mono">
              <p>No components to preview</p>
              <p class="text-[10px] mt-2 opacity-50">Generate a UI to see it here</p>
            </div>
          `}
        </div>
      </body>
    </html>
  `;

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setDevice("desktop")}
                        className={`p-1.5 rounded ${device === "desktop" ? "bg-gray-100 text-black" : "text-gray-400"}`}
                        title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDevice("tablet")}
                        className={`p-1.5 rounded ${device === "tablet" ? "bg-gray-100 text-black" : "text-gray-400"}`}
                        title="Tablet View"
                    >
                        <Tablet className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setDevice("mobile")}
                        className={`p-1.5 rounded ${device === "mobile" ? "bg-gray-100 text-black" : "text-gray-400"}`}
                        title="Mobile View"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    Live Preview Enabled
                </div>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex justify-center p-3">
                <div className={`${deviceWidths[device]} h-full transition-all duration-300 bg-white rounded-lg overflow-hidden border border-gray-100`}>
                    <iframe
                        srcDoc={iframeSrcDoc}
                        className="w-full h-full border-none"
                        title="Preview"
                    />
                </div>
            </div>
        </div>
    );
}
