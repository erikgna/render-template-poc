import { IRenderer } from "../../types/renderer";
import { TemplateData } from "../../types/template";

// Template abstract class
// This class is responsible for rendering and validating templates
export abstract class Template {
    protected name: string; // The name of the template

    constructor(name: string) {
        this.name = name; // Set the name of the template
    }

    async render(renderer: IRenderer, data: TemplateData): Promise<string | Buffer> {
        const processedData = this.preProcess(data); // Pre-process the data
        const validatedData = this.validate(processedData); // Validate the data
        const result = await renderer.render(this, validatedData); // Render the template using the renderer
        return this.postProcess(result); // Post-process the result
    }

    // Pre-process the data
    protected preProcess(data: TemplateData): TemplateData {
        return data;
    }

    // Validate the data
    protected validate(data: TemplateData): TemplateData {
        if (!data) throw new Error('Template data cannot be null or undefined');
        return data;
    }

    // Post-process the result
    protected postProcess(result: string | Buffer): string | Buffer {
        return result;
    }

    abstract getStructure(): any;
    abstract getName(): string;
}