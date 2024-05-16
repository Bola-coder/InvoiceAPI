const puppeteer = require("puppeteer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const convertHtmlTemplateToPdf = async (htmlTemplate) => {
  // A function that converts the htmlTemplate supplied to pdf and returns the path to the pdf genarated
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setContent(htmlTemplate);

  const pdfFilePath = `temp/invoice-${uuidv4()}.pdf`;

  await page.pdf({ path: pdfFilePath, format: "A4" });

  await browser.close();

  return pdfFilePath;
};

module.exports = convertHtmlTemplateToPdf;
