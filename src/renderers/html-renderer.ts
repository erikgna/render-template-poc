import { Template } from "../core/base/template.abstract";
import { IRenderer } from "../types/renderer";
import { TemplateData } from "../types/template";

// HTML renderer class
// This class is responsible for rendering the HTML template
export class HTMLRenderer implements IRenderer {
    // Render the HTML template
    async render(template: Template, data: TemplateData): Promise<string> {
        const structure = template.getStructure(); // Get the structure of the HTML template
        return this.buildHTML(structure, data);
    }

    // Build the HTML template
    private buildHTML(structure: any, data: TemplateData): string {
        let html = '<!DOCTYPE html>\n<html>\n<head>\n';
        html += `<title>${structure.title || 'Document'}</title>\n`; // Add the title if it exists
        html += '<style>\n';
        html += `body { font-family: Arial, sans-serif; margin: 20px; }\n`;
        html += `table { border-collapse: collapse; width: 100%; }\n`; // Add the table styles
        html += `th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n`; // Add the table cell styles
        html += `th { background-color: #4CAF50; color: white; }\n`; // Add the table header styles
        html += `</style>\n</head>\n<body>\n`;

        if (structure.header) html += `<h1>${this.interpolate(structure.header, data)}</h1>\n`; // Add the header if it exists
        if (structure.sections) structure.sections.forEach((section: any) => html += this.renderSection(section, data)); // Render the sections

        html += '</body>\n</html>';
        return html; // Return the HTML template
    }

    // Render a section of the HTML template
    private renderSection(section: any, data: TemplateData): string {
        let html = '';

        if (section.type === 'table') {
            html += '<table>\n<thead>\n<tr>\n'; // Add the table header
            section.columns.forEach((col: string) => {
                html += `<th>${col}</th>\n`; // Add the column header
            });
            html += '</tr>\n</thead>\n<tbody>\n'; // Add the table body

            const rows = this.resolveData(section.dataKey, data);
            if (Array.isArray(rows)) {
                rows.forEach((row: any) => {
                    html += '<tr>\n'; // Add the table row
                    section.columns.forEach((col: string) => {
                        html += `<td>${row[col.toLowerCase()] || ''}</td>\n`; // Add the table cell
                    });
                    html += '</tr>\n'; // Add the table row
                });
            }

            html += '</tbody>\n</table>\n'; // Add the table footer
        } else if (section.type === 'paragraph') {
            html += `<p>${this.interpolate(section.content, data)}</p>\n`; // Add the paragraph
        }

        return html;
    }

    private interpolate(text: string, data: TemplateData): string {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match); // Interpolate the text
    }

    private resolveData(key: string, data: TemplateData): any {
        return key.split('.').reduce((obj, k) => obj?.[k], data); // Reduce the data for the key
    }

    getContentType(): string {
        return 'text/html';
    }

    getFileExtension(): string {
        return 'html';
    }
}