import { Template } from "../core/base/template.abstract";
import { TemplateData } from "./template";

export interface IRenderer {
    render(template: Template, data: TemplateData): Promise<string | Buffer>;
    getContentType(): string;
    getFileExtension(): string;
}