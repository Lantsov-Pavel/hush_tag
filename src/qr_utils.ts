import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import jsQR from 'jsqr';

// Function to generate QR code BMP image
export async function generateQRCode(address: string, zkAppAddressStr: string) {
    try {
      const qrCodeData = await QRCode.toBuffer(address);
      const imgDir = 'img';
      if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir);
      }
      const filePath = path.format({
        dir: imgDir,
        name: zkAppAddressStr,
        ext: '.bmp'
      });
      fs.writeFileSync(filePath, qrCodeData);
      console.log('QR code generated and saved as', filePath);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  }

// Function to read string from QR code BMP image
export async function readQRCode(filePath: string) {
    try {
      console.log('Reading image from:', filePath);
      const imageBuffer = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
      const { data, info } = imageBuffer;
      const clampedArray = new Uint8ClampedArray(data.buffer);
      const code = jsQR(clampedArray, info.width, info.height);
      if (code) {
        console.log('QR code value:', code.data);
        return code.data;
      } else {
        console.error('Failed to read QR code');
        return '';
      }
    } catch (err) {
      console.error('Failed to read image:', err);
      return '';
    }
  }