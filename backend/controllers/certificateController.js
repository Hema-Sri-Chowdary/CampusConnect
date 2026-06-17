const Certificate = require('../models/Certificate');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// POST /api/certificates/generate/:registrationId
exports.generateCertificate = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('userId', 'name email')
      .populate('eventId');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });
    if (registration.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'coordinator') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (registration.status !== 'attended' && registration.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Certificate only available for attended events.' });
    }
    const existing = await Certificate.findOne({ registrationId: registration._id });
    if (existing) return res.json({ success: true, data: existing });
    const event = registration.eventId;
    const user = registration.userId;
    const certNumber = `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;
    const verificationCode = uuidv4();
    const certsDir = path.join('uploads', 'certificates');
    if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
    const filename = `${certNumber}.pdf`;
    const filePath = path.join(certsDir, filename);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f0c29');
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(3).stroke('#6C63FF');
    // Header
    doc.fillColor('#6C63FF').fontSize(36).font('Helvetica-Bold').text('CAMPUSCONNECT', 0, 60, { align: 'center' });
    doc.fillColor('#94a3b8').fontSize(14).font('Helvetica').text('College Club Event Management Platform', 0, 100, { align: 'center' });
    // Certificate of Participation
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('CERTIFICATE OF PARTICIPATION', 0, 150, { align: 'center' });
    doc.fillColor('#94a3b8').fontSize(14).text('This is to certify that', 0, 200, { align: 'center' });
    // Name
    doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold').text(user.name, 0, 225, { align: 'center' });
    doc.moveTo(200, 265).lineTo(doc.page.width - 200, 265).lineWidth(1).stroke('#6C63FF');
    // Event details
    doc.fillColor('#94a3b8').fontSize(14).font('Helvetica').text('has successfully participated in', 0, 280, { align: 'center' });
    doc.fillColor('#6C63FF').fontSize(22).font('Helvetica-Bold').text(event.title, 0, 305, { align: 'center' });
    doc.fillColor('#94a3b8').fontSize(13).font('Helvetica').text(`on ${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 0, 340, { align: 'center' });
    // Certificate number
    doc.fillColor('#64748b').fontSize(10).text(`Certificate No: ${certNumber}`, 0, 400, { align: 'center' });
    doc.end();
    await new Promise((resolve, reject) => { writeStream.on('finish', resolve); writeStream.on('error', reject); });
    const qrData = `${process.env.CLIENT_URL}/verify-certificate/${verificationCode}`;
    const qrImage = await QRCode.toDataURL(qrData);
    const certificate = await Certificate.create({
      userId: user._id, eventId: event._id, registrationId: registration._id,
      certificateNumber: certNumber, certificateUrl: `/uploads/certificates/${filename}`,
      qrVerificationCode: verificationCode
    });
    await Registration.findByIdAndUpdate(registration._id, { certificateGenerated: true, certificateId: certificate._id });
    res.json({ success: true, message: 'Certificate generated!', data: certificate });
  } catch (err) { next(err); }
};

// GET /api/certificates/my
exports.getMyCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id })
      .populate('eventId', 'title date clubId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: certs });
  } catch (err) { next(err); }
};

// GET /api/certificates/verify/:code
exports.verifyCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ qrVerificationCode: req.params.code })
      .populate('userId', 'name')
      .populate('eventId', 'title date');
    if (!cert || !cert.isValid) {
      return res.status(404).json({ success: false, message: 'Certificate not found or invalid.' });
    }
    res.json({ success: true, data: cert });
  } catch (err) { next(err); }
};

// GET /api/certificates/:id/download
exports.downloadCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    if (cert.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const filePath = path.join(process.cwd(), cert.certificateUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Certificate file not found.' });
    res.download(filePath, `certificate-${cert.certificateNumber}.pdf`);
  } catch (err) { next(err); }
};
