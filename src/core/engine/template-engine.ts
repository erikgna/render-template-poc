import { RendererFactory } from "../../services/renderer.service";
import { TemplateData, RenderOptions } from "../../types/template";
import { Template } from "../base/template.abstract";
import * as fs from 'fs/promises';
import * as path from 'path';

// This class is responsible for rendering and saving templates
export class TemplateEngine {
    async render(template: Template, data: TemplateData, options: RenderOptions): Promise<{ content: string | Buffer; contentType: string; fileName: string }> {
        const renderer = RendererFactory.getRenderer(options.format); // Get the renderer for the given format
        const content = await template.render(renderer, data); // Render the template using the renderer
        const fileName = options.fileName || `${template.getName()}.${renderer.getFileExtension()}`; // Get the file name for the rendered template

        return {
            content,
            contentType: renderer.getContentType(),
            fileName
        };
    }

    async save(
        template: Template,
        data: TemplateData,
        options: RenderOptions & { outputPath: string }
    ): Promise<{ filePath: string; fileName: string; size: number }> {
        const result = await this.render(template, data, options); // Render the template using the renderer

        const outputDir = path.dirname(options.outputPath); // Get the output directory for the rendered template
        await fs.mkdir(outputDir, { recursive: true }); // Create the output directory if it doesn't exist

        const filePath = options.outputPath.endsWith(path.sep) ||
            !path.extname(options.outputPath)
            ? path.join(options.outputPath, result.fileName)
            : options.outputPath; // Join the output path with the file name if the output path doesn't end with a separator or doesn't have an extension

        await fs.writeFile(filePath, result.content); // Write the content to the file
        const stats = await fs.stat(filePath); // Get the stats of the file

        return {
            filePath: path.resolve(filePath),
            fileName: result.fileName,
            size: stats.size
        };
    }

    async renderAndSave(
        template: Template,
        data: TemplateData,
        formats: Array<'html' | 'pdf' | 'csv'>,
        outputPath: string
    ): Promise<Array<{
        format: string;
        filePath: string;
        fileName: string;
        size: number
    }>> {
        const results = await Promise.all(
            formats.map(async (format) => {
                const saveResult = await this.save(template, data, { format, outputPath });
                return { format, ...saveResult };
            })
        ); // Render the template using the renderer and save the result to the file

        return results;
    }

}