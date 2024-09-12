const { convertNumberToCurrencyFormat } = require("../utils/formatNumber");

function createReceiptTemplate(receipt) {
  const template = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Receipt for Invoice #${receipt.invoiceId}</title>
        <style>
          body {
            font-family: "Courier New", Courier, monospace;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            text-transform: uppercase;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .details {
            margin-bottom: 20px;
          }
          .details p {
            margin: 4px 0;
            font-size: 14px;
          }
          .items, .payments {
            width: 100%;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin-bottom: 20px;
          }
          .item-header, .item-row, .payment-header, .payment-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            font-size: 14px;
            padding: 4px 0;
          }
          .item-header, .payment-header {
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            margin-bottom: 8px;
          }
          .item-row, .payment-row {
            margin-bottom: 4px;
          }
          .total {
            text-align: right;
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>Payment Receipt</h1>
            <p>Invoice #: ${receipt.invoiceId}</p>
            <p>Date: ${receipt.date}</p>
          </div>
    
          <div class="details">
            <p><strong>Customer:</strong> ${receipt.customerName}</p>
            <p><strong>Email:</strong> ${receipt.customerEmail}</p>
          </div>
    
          <div class="items">
            <div class="item-header">
              <span>Item Name</span>
              <span>Quantity</span>
              <span>Price</span>
            </div>
            ${receipt.items
              .map(
                (item) => `
            <div class="item-row">
              <span>${item.itemName}</span>
              <span>${item.quantity}</span>
              <span>$${convertNumberToCurrencyFormat(item.price)}</span>
            </div>
            `
              )
              .join("")}
          </div>

          <!-- Payments Section -->
          <div class="payments">
            <div class="payment-header">
              <span>Payment Method</span>
              <span>Payment Date</span>
              <span>Payment Amount</span>
            </div>
            ${receipt.payments
              .map(
                (payment) => `
            <div class="payment-row">
              <span>${payment.paymentMethod}</span>
              <span>${payment.date}</span>
              <span>$${convertNumberToCurrencyFormat(payment.amount)}</span>
            </div>
            `
              )
              .join("")}
          </div>
    
          <div class="total">
            <p><strong>Total Amount:</strong> $${convertNumberToCurrencyFormat(
              receipt.totalAmount
            )}</p>
            <p><strong>Total Amount Paid:</strong> $${convertNumberToCurrencyFormat(
              receipt.amountPaid
            )}</p>
            <p><strong>Balance:</strong> $${convertNumberToCurrencyFormat(
              receipt.balance
            )}</p>
          </div>
    
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>If you have any questions, contact us at support@example.com</p>
          </div>
        </div>
      </body>
    </html>
    `;
  return template;
}

module.exports = createReceiptTemplate;
