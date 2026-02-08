import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const logoPath = join(rootDir, 'public', 'logo', 'seavitae-logo.png');

async function generateFavicons() {
  console.log('Generating favicons from:', logoPath);

  // Generate favicon.ico (32x32)
  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(join(rootDir, 'public', 'favicon.ico'));
  console.log('✓ Created favicon.ico (32x32)');

  // Generate apple-touch-icon.png (180x180)
  await sharp(logoPath)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(join(rootDir, 'public', 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png (180x180)');

  // Generate icon-192.png for Android
  await sharp(logoPath)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(join(rootDir, 'public', 'icon-192.png'));
  console.log('✓ Created icon-192.png (192x192)');

  // Generate icon-512.png for Android
  await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(join(rootDir, 'public', 'icon-512.png'));
  console.log('✓ Created icon-512.png (512x512)');

  console.log('\n✅ All favicons generated successfully!');
}

generateFavicons().catch(console.error);
