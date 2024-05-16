const { convertNumberToCurrencyFormat } = require("./../utils/formatNumber");
function createInvoiceDetailsTemplate(invoice) {
  const template = `
        <html>
        <head>
            <title>Invoice Details</title>
            <style>
            @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");
                /* Define your CSS styles here */
                *{
                    font-family: "IBM Plex Sans", "sans-serif";
                }
                .container {
                    padding: 3%;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header h2 {
                    font-size: 24px;
                    font-weight: 500;
                    color: #074D41;
                }
                .content {
                    margin-top: 2%;
                    padding: 20px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    background-color: #fff;
                }

                .invoice-number{
                    color: #074D41;
                    font-size: 18px
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .items-box {
                    margin-top: 20px;
                }
                .item {
                    padding: 8px;
                    background-color: #074D41;
                    color: #fff;
                    border-radius: 4px;
                    margin-top: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h2>Invoice Details</h2>
                </div>
                <!-- Content -->
                <div class="content">
                    <div>
                        <h3 class="invoice-number">Invoice #${
                          invoice?.invoiceNumber
                        }</h3>
                        <p>
                            Status:
                            <span class="status-badge" style="background-color: 
                                ${
                                  invoice?.status === "paid"
                                    ? "green"
                                    : invoice?.status === "partially-paid"
                                    ? "yellow"
                                    : "red"
                                }">
                                ${invoice?.status.toUpperCase()}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p><strong>Invoice Date:</strong> ${
                          invoice?.invoiceDate
                        }</p>
                        <p><strong>Due Date:</strong> ${invoice?.dueDate}</p>
                        <p><strong>Client:</strong> ${invoice?.client?.name}</p>
                    </div>
                    <div>
                        <p><strong>Total:</strong> NGN ${convertNumberToCurrencyFormat(
                          invoice?.total
                        )}</p>
                        <p><strong>Amount Paid:</strong> NGN ${convertNumberToCurrencyFormat(
                          invoice?.amountPaid
                        )}</p>
                        <p><strong>Balance:</strong> NGN ${convertNumberToCurrencyFormat(
                          invoice?.balance
                        )}</p>
                    </div>
                    <div class="items-box">
                        <h4>Items</h4>
                        ${invoice.items
                          .map(
                            (item) => `
                            <div class="item">
                                <p>${item.itemName}</p>
                                <p>${item.quantity} x NGN ${item.price}</p>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
  return template;
}

module.exports = createInvoiceDetailsTemplate;
