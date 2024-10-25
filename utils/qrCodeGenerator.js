const QRCode = require("qrcode");

const generateQRCode = async (url) => {
  try {
    return await QRCode.toDataURL(url);
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};

module.exports = generateQRCode;
