const PDFDocument = require('pdfkit');

function generateODPDF(application) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text('On Duty (OD) Letter', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`To Whom It May Concern,`);
    doc.moveDown();
    doc.text(`This is to certify that ${application.student_name} (Application ID: ${application.id}) has been approved for internship at ${application.company_name} from ${new Date(application.start_date).toLocaleDateString()} to ${new Date(application.end_date).toLocaleDateString()}.`);
    doc.moveDown();
    doc.text(`Regards,`);
    doc.text(`Internship Cell / HOD`);
    doc.end();
  });
}

module.exports = { generateODPDF };
