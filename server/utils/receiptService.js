const PDFDocument = require('pdfkit');
const config = require('../config/config');
const { MONTH_NAMES } = require('./monthNames');

/**
 * Builds a PDF receipt in memory and returns it as a Buffer.
 * Only makes sense for payments with status 'paid' — callers should check
 * that before calling this.
 */
const generateReceiptPdf = ({ payment, member }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).fillColor('#1c2541').text(config.club.name, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor('#666').text('Payment Receipt', { align: 'center' });
    doc.moveDown(1.5);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#DAD2BE').stroke();
    doc.moveDown(1);

    const row = (label, value) => {
      doc
        .fontSize(11)
        .fillColor('#666')
        .text(label, 50, doc.y, { continued: true, width: 200 })
        .fillColor('#1c2541')
        .text(value, { align: 'right' });
      doc.moveDown(0.6);
    };

    row('Receipt No.', `RCPT-${String(payment.id).padStart(6, '0')}`);
    row('Member Name', member.name);
    row('Month', `${MONTH_NAMES[payment.month - 1]} ${payment.year}`);
    row('Amount Paid', `Rs. ${Number(payment.amount).toFixed(2)}`);
    row('Payment Date', payment.payment_date || '—');
    row('Transaction / Reference ID', payment.transaction_id || '—');
    row('Status', 'PAID');

    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#DAD2BE').stroke();
    doc.moveDown(1);

    doc
      .fontSize(9)
      .fillColor('#999')
      .text('This is a system-generated receipt confirming a verified payment.', { align: 'center' });

    doc.end();
  });
};

module.exports = { generateReceiptPdf };
