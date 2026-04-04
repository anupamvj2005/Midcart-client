const path = require('path');

/**
 * Multer + Cloudinary puts a full https URL in `file.path`.
 * Local disk storage: `file.filename` is the stored name; `file.path` is absolute on disk.
 */
function publicUrlForPrescriptionFile(file) {
  if (!file) return '';
  const p = file.path || '';
  if (/^https?:\/\//i.test(p)) return p;

  const base = (process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`).replace(
    /\/$/,
    ''
  );
  const name = file.filename || path.basename(p);
  return `${base}/uploads/prescriptions/${name}`;
}

module.exports = { publicUrlForPrescriptionFile };
