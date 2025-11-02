import { Template } from "../../core/base/template.abstract";
import { TemplateData } from "../../types/template";

// Invoice template class
// This class is responsible for rendering the invoice template
export class InvoiceTemplate extends Template {
  constructor() {
    super("invoice");
  }

  getName(): string {
    return this.name;
  }

  // Get the structure of the invoice template
  getStructure(): any {
    return {
      title: "Invoice",
      header: "Invoice #{{invoiceNumber}}",
      sections: [
        {
          type: "paragraph",
          content: "Date: {{date}} | Customer: {{customerName}}",
        },
        {
          type: "table",
          title: "Items",
          dataKey: "items",
          columns: ["Name", "Quantity", "Price", "Total"],
        },
        {
          type: "paragraph",
          content: "Total Amount: ${{total}}",
        },
      ],
    };
  }

  // Validate the data
  protected validate(data: TemplateData): TemplateData {
    super.validate(data);

    if (!data.invoiceNumber) throw new Error("Invoice number is required");
    if (!data.items || !Array.isArray(data.items)) throw new Error("Items array is required");

    return data;
  }
}
