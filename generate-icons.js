import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const publicDir = path.resolve('public');

const targets = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'favicon.ico', size: 32 } // Simple fallback ICO
];

async function generate() {
  console.log('Bắt đầu sinh ảnh PNG từ SVG...');
  
  if (!fs.existsSync(svgPath)) {
    console.error(`Không tìm thấy file nguồn SVG tại: ${svgPath}`);
    process.exit(1);
  }

  for (const target of targets) {
    const outputPath = path.join(publicDir, target.name);
    try {
      await sharp(svgPath)
        .resize(target.size, target.size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Đã sinh file: ${target.name} (${target.size}x${target.size})`);
    } catch (err) {
      console.error(`✗ Lỗi khi sinh file ${target.name}:`, err);
    }
  }
  
  console.log('Hoàn thành sinh toàn bộ PWA PNG Icons!');
}

generate();
