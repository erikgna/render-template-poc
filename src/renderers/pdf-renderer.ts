import { Template } from "../core/base/template.abstract";
import { IRenderer } from "../types/renderer";
import { TemplateData } from "../types/template";
import PDFDocument from 'pdfkit';

// PDF renderer class
// This class is responsible for rendering the PDF template
export class PDFRenderer implements IRenderer {
    private readonly defaultFont = 'Helvetica'; // The default font
    private readonly defaultFontSize = 12; // The default font size
    private readonly titleFontSize = 18; // The title font size
    private readonly headerFontSize = 14; // The header font size
    private readonly margins = { top: 50, bottom: 50, left: 50, right: 50 }; // The margins

    async render(template: Template, data: TemplateData): Promise<Buffer> {
        const structure = template.getStructure(); // Get the structure of the PDF template

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margins: this.margins,
                bufferPages: true // Buffer the pages
            });

            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            try {
                this.buildPDFContent(doc, structure, data); // Build the PDF content
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
    // Build the PDF content
    private buildPDFContent(doc: PDFKit.PDFDocument, structure: any, data: TemplateData): void {
        if (structure.header) {
            // Add the header
            doc.fontSize(this.titleFontSize)
                .font(`${this.defaultFont}-Bold`)
                .text(this.interpolate(structure.header, data), {
                    align: 'center'
                })
                .moveDown(1.5);
        }

        // Render the sections
        if (structure.sections) {
            structure.sections.forEach((section: any, index: number) => {
                this.renderSection(doc, section, data);

                if (index < structure.sections.length - 1) doc.moveDown(1);
            });
        }

        // Add the page numbers
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);

            // Add the page number
            doc.fontSize(10)
                .font(this.defaultFont)
                .text(
                    `Page ${i + 1} of ${pages.count}`,
                    0,
                    doc.page.height - 50,
                    { align: 'center' }
                );
        }
    }

    // Render a section of the PDF template
    private renderSection(doc: PDFKit.PDFDocument, section: any, data: TemplateData): void {
        switch (section.type) {
            case 'table':
                this.renderTable(doc, section, data);
                break;
            case 'paragraph':
                this.renderParagraph(doc, section, data);
                break;
            case 'list':
                this.renderList(doc, section, data);
                break;
            case 'heading':
                this.renderHeading(doc, section, data);
                break;
            default:
                console.warn(`Unknown section type: ${section.type}`);
        }
    }

    // Render a heading of the PDF template
    private renderHeading(doc: PDFKit.PDFDocument, section: any, data: TemplateData): void {
        const content = this.interpolate(section.content, data); // Interpolate the content
        doc.fontSize(this.headerFontSize)
            .font(`${this.defaultFont}-Bold`)
            .text(content) // Add the content
            .font(this.defaultFont)
            .fontSize(this.defaultFontSize)
            .moveDown(0.5); // Move down by 0.5
    }

    // Render a paragraph of the PDF template
    private renderParagraph(doc: PDFKit.PDFDocument, section: any, data: TemplateData): void {
        const content = this.interpolate(section.content, data); // Interpolate the content

        doc.fontSize(this.defaultFontSize)
            .font(this.defaultFont)
            .text(content, { align: section.align || 'left', lineGap: 5 })
            .moveDown(0.5);
    }

    // Render a list of the PDF template
    private renderList(doc: PDFKit.PDFDocument, section: any, data: TemplateData): void {
        const items = this.resolveData(section.dataKey, data);

        if (!Array.isArray(items)) return;
        // Render the items
        items.forEach((item: any, index: number) => {
            const bullet = section.ordered ? `${index + 1}.` : '•';
            const text = typeof item === 'string' ? item : this.interpolate(section.template, item);

            doc.fontSize(this.defaultFontSize)
                .font(this.defaultFont)
                .text(`${bullet} ${text}`, {
                    indent: 20,
                    lineGap: 3
                });
        });

        doc.moveDown(0.5);
    }

    // Render a table of the PDF template
    private renderTable(doc: PDFKit.PDFDocument, section: any, data: TemplateData): void {
        const rows = this.resolveData(section.dataKey, data);

        if (!Array.isArray(rows) || rows.length === 0) return;

        if (section.title) {
            doc.fontSize(this.headerFontSize)
                .font(`${this.defaultFont}-Bold`)
                .text(section.title)
                .moveDown(0.5);
        }

        const columns = section.columns || Object.keys(rows[0]);
        const tableWidth = doc.page.width - this.margins.left - this.margins.right;
        const columnWidth = tableWidth / columns.length;
        const rowHeight = 25;
        const startY = doc.y;

        const tableHeight = (rows.length + 1) * rowHeight;
        if (startY + tableHeight > doc.page.height - this.margins.bottom) {
            doc.addPage();
        }

        this.drawTableRow(
            doc,
            columns,
            columns,
            doc.y,
            columnWidth,
            rowHeight,
            true
        );

        rows.forEach((row: any, index: number) => {
            const y = doc.y;

            if (y + rowHeight > doc.page.height - this.margins.bottom) {
                doc.addPage();
                this.drawTableRow(
                    doc,
                    columns,
                    columns,
                    doc.y,
                    columnWidth,
                    rowHeight,
                    true
                );
            }

            const values = columns.map((col: string) => {
                const key = col.toLowerCase().replace(/\s+/g, '_');
                return row[key] !== undefined ? String(row[key]) : '';
            });

            this.drawTableRow(
                doc,
                values,
                columns,
                doc.y,
                columnWidth,
                rowHeight,
                false
            );
        });

        doc.moveDown(1);
    }

    // Draw a table row of the PDF template
    private drawTableRow(
        doc: PDFKit.PDFDocument,
        values: string[],
        columns: string[],
        y: number,
        columnWidth: number,
        rowHeight: number,
        isHeader: boolean
    ): void {
        const x = this.margins.left;

        values.forEach((_, index) => {
            const cellX = x + (index * columnWidth);

            if (isHeader) {
                doc.rect(cellX, y, columnWidth, rowHeight)
                    .fillAndStroke('#f0f0f0', '#000000');
            } else {
                doc.rect(cellX, y, columnWidth, rowHeight)
                    .stroke('#cccccc');
            }
        });

        values.forEach((value, index) => {
            const cellX = x + (index * columnWidth);

            doc.fontSize(10)
                .font(isHeader ? `${this.defaultFont}-Bold` : this.defaultFont)
                .fillColor('#000000')
                .text(
                    value,
                    cellX + 5,
                    y + 8,
                    {
                        width: columnWidth - 10,
                        height: rowHeight,
                        ellipsis: true,
                        lineBreak: false
                    }
                );
        });

        doc.y = y + rowHeight;
    }

    private interpolate(text: string, data: TemplateData): string {
        return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
            const value = this.resolveData(key, data);
            return value !== undefined ? String(value) : match;
        });
    }

    private resolveData(key: string, data: TemplateData): any {
        return key.split('.').reduce((obj, k) => obj?.[k], data);
    }

    getContentType(): string {
        return 'application/pdf';
    }

    getFileExtension(): string {
        return 'pdf';
    }
}