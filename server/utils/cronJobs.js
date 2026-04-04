const Product = require('../models/Product');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const checkExpiryAlerts = async () => {
  try {
    const thirtyDays = new Date(+new Date() + 30 * 24 * 60 * 60 * 1000);
    const expiring = await Product.find({
      isActive: true,
      expiryDate: { $lte: thirtyDays, $gte: new Date() },
    }).select('name expiryDate stock');

    const lowStock = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] },
    }).select('name stock');

    if (expiring.length === 0 && lowStock.length === 0) return;

    const html = `
      <h2>📊 SmartPharma Daily Inventory Alert</h2>
      ${expiring.length > 0 ? `
        <h3>⚠️ Near Expiry Products (${expiring.length})</h3>
        <ul>${expiring.map(p => `<li>${p.name} — Expires: ${p.expiryDate?.toDateString()} | Stock: ${p.stock.quantity}</li>`).join('')}</ul>
      ` : ''}
      ${lowStock.length > 0 ? `
        <h3>🔴 Low Stock Products (${lowStock.length})</h3>
        <ul>${lowStock.map(p => `<li>${p.name} — Stock: ${p.stock.quantity} (threshold: ${p.stock.lowStockThreshold})</li>`).join('')}</ul>
      ` : ''}
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🚨 SmartPharma Alert — ${new Date().toDateString()}`,
      html,
    });

    console.log('✅ Expiry/stock alert email sent');
  } catch (err) {
    console.error('❌ Cron job error:', err.message);
  }
};

module.exports = { checkExpiryAlerts };
