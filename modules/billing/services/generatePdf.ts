/**
 * FILE: modules/billing/services/generatePdf.ts
 * ZONE: 🔴 Red
 * PURPOSE: Generate PDF invoices using browser print
 * EXPORTS: generateInvoicePdf
 * DEPENDS ON: None
 * CONSUMED BY: InvoiceBuilder
 * TESTS: modules/billing/tests/generatePdf.test.ts
 * LAST CHANGED: 2026-03-06 — Simplified to print-based approach
 */

// 🔴 RED ZONE — billing PDF generation, handle with care

export function generateInvoicePdf(elementId: string, filename: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #000;
            background: #fff;
          }
          * { box-sizing: border-box; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}
