import { CSVRenderer } from "../renderers/csv-renderer";
import { HTMLRenderer } from "../renderers/html-renderer";
import { PDFRenderer } from "../renderers/pdf-renderer";
import { IRenderer } from "../types/renderer";

// Renderer factory class
// This class is responsible for creating and managing renderers
// Factory pattern decides what specific object to return based on input or logic
export class RendererFactory {
    // The renderers map
    private static renderers: Map<string, IRenderer> = new Map<string, IRenderer>([
        ['html', new HTMLRenderer()],
        ['pdf', new PDFRenderer()],
        ['csv', new CSVRenderer()]
    ]);

    // Get the renderer for the given format
    static getRenderer(format: string): IRenderer {
        const renderer = this.renderers.get(format.toLowerCase());
        if (!renderer) throw new Error(`Unsupported format: ${format}`);
        return renderer;
    }

    // Register a new renderer for the given format
    static registerRenderer(format: string, renderer: IRenderer): void {
        this.renderers.set(format.toLowerCase(), renderer);
    }
}