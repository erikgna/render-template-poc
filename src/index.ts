import { TemplateEngine } from "./core/engine/template-engine";
import { InvoiceTemplate } from "./templats/invoice/invoice-template";

async function main() {
    const engine = new TemplateEngine();
    const invoice = new InvoiceTemplate();

    const data = {
        invoiceNumber: 'INV-2025-001',
        date: '2025-11-01',
        customerName: 'Acme Corp',
        items: [
            { name: 'Widget A', quantity: 10, price: 25.50, total: 255.00 },
            { name: 'Widget B', quantity: 5, price: 45.00, total: 225.00 },
            { name: 'Service Fee', quantity: 1, price: 100.00, total: 100.00 }
        ],
        total: 580.00
    };

    await engine.renderAndSave(
        invoice,
        data,
        ['html', 'csv', 'pdf'],
        './output/invoices/'
    );
}

main().catch(console.error);