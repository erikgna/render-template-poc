export interface TemplateData {
    [key: string]: any;
}

export interface RenderOptions {
    format: 'html' | 'pdf' | 'csv';
    fileName?: string;
}