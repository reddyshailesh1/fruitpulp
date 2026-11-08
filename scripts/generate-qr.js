const path = require('path');
const fs = require('fs');

let QRCode;
try {
  QRCode = require('qrcode');
} catch (e) {
  try {
    QRCode = require(path.join(__dirname, '..', 'backend', 'node_modules', 'qrcode'));
  } catch (err) {
    console.error('Could not load qrcode module. Run: cd backend && npm install qrcode');
    process.exit(1);
  }
}

// Target URL: Default deployed URL or CLI argument
const targetUrl = process.argv[2] || 'https://orange-pulp-juice.netlify.app';
const outputDir = path.join(__dirname, '..', 'frontend', 'public');
const pngPath = path.join(outputDir, 'orange-pulp-qr.png');
const svgPath = path.join(outputDir, 'orange-pulp-qr.svg');

async function generateQR() {
  console.log('🍊 Generating Orange Pulp Juice Point QR Code...');
  console.log(`🔗 Target URL: ${targetUrl}`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. High-Resolution PNG for Stall Printouts
  await QRCode.toFile(pngPath, targetUrl, {
    color: {
      dark: '#D96516', // Deep Orange
      light: '#FFF9F0', // Warm Cream background
    },
    width: 800,
    margin: 2,
    errorCorrectionLevel: 'H',
  });
  console.log(`✅ Saved High-Res PNG to: ${pngPath}`);

  // 2. Vector SVG for Posters & Banners
  const svgString = await QRCode.toString(targetUrl, {
    type: 'svg',
    color: {
      dark: '#F28C28',
      light: '#FFFFFF',
    },
    margin: 2,
    errorCorrectionLevel: 'H',
  });
  fs.writeFileSync(svgPath, svgString);
  console.log(`✅ Saved Vector SVG to: ${svgPath}`);

  // 3. Terminal QR Code for quick smartphone test scan right now!
  console.log('\n📱 SCAN DIRECTLY FROM YOUR PHONE TERMINAL:\n');
  const terminalQR = await QRCode.toString(targetUrl, { type: 'terminal', small: true });
  console.log(terminalQR);
  console.log('\n🎉 Ready for stall counter display!');
}

generateQR().catch((err) => {
  console.error('Failed to generate QR code:', err);
  process.exit(1);
});
