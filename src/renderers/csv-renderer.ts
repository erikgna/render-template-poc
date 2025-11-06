import { Template } from "../templats/template";
import { IRenderer } from "../types/renderer";
import { TemplateData } from "../types/template";

// CSV renderer class
// This class is responsible for rendering the CSV template
export class CSVRenderer implements IRenderer {
    // Render the CSV template
    async render(template: Template, data: TemplateData): Promise<string> {
        const structure = template.getStructure(); // Get the structure of the CSV template
        return this.buildCSV(structure, data);
    }

    // Build the CSV template
    private buildCSV(structure: any, data: TemplateData): string {
        let csv = '';

        if (structure.header) csv += `# ${this.interpolate(structure.header, data)}\n`; // Interpolate the header

        if (structure.sections) {
            structure.sections.forEach((section: any, index: number) => {
                if (index > 0) csv += '\n'; // Add a new line if it's not the first section
                csv += this.renderSection(section, data); // Render the section
            });
        }

        return csv;
    }

    private renderSection(section: any, data: TemplateData): string {
        let csv = '';

        if (section.type === 'table') {
            if (section.title) csv += `# ${section.title}\n`; // Add the title if it exists
            csv += section.columns.join(',') + '\n'; // Add the columns
            const rows = this.resolveData(section.dataKey, data); // Resolve the data for the section
            if (Array.isArray(rows)) { // If the rows are an array
                rows.forEach((row: any) => {
                    const values = section.columns.map((col: string) => {
                        const value = row[col.toLowerCase()] || ''; // Get the value for the column
                        return this.escapeCSV(String(value)); // Escape the value
                    });
                    csv += values.join(',') + '\n'; // Add the values to the CSV
                });
            }
        } else if (section.type === 'paragraph') {
            csv += `# ${this.interpolate(section.content, data)}\n`; // Add the content if it's a paragraph
        }

        return csv;
    }

    private escapeCSV(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) return `"${value.replace(/"/g, '""')}"`; // Escape the value if it contains a comma, double quote, or new line
        return value;
    }

    private interpolate(text: string, data: TemplateData): string {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match); // Interpolate the text
    }

    private resolveData(key: string, data: TemplateData): any {
        return key.split('.').reduce((obj, k) => obj?.[k], data); // Reduce the data for the key
    }

    getContentType(): string {
        return 'text/csv';
    }

    getFileExtension(): string {
        return 'csv';
    }
}