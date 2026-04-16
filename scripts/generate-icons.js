#!/usr/bin/env node
/**
 * Generates branded Canada 24/7 app icons using jimp.
 * Run: node scripts/generate-icons.js
 */

const { Jimp } = require('jimp');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');

// Brand colours
const RED   = 0xD90429FF;
const WHITE = 0xFFFFFFFF;
const BLACK = 0x000000FF;
const TRANS = 0x00000000;

async function drawRoundedRect(img, x, y, w, h, r, color) {
  // Fill solid rect minus corners
  img.scan(x, y, w, h, function (px, py, idx) {
    const inCornerTL = px < x + r && py < y + r && Math.hypot(px - (x + r), py - (y + r)) > r;
    const inCornerTR = px > x + w - r && py < y + r && Math.hypot(px - (x + w - r), py - (y + r)) > r;
    const inCornerBL = px < x + r && py > y + h - r && Math.hypot(px - (x + r), py - (y + h - r)) > r;
    const inCornerBR = px > x + w - r && py > y + h - r && Math.hypot(px - (x + w - r), py - (y + h - r)) > r;
    if (!inCornerTL && !inCornerTR && !inCornerBL && !inCornerBR) {
      this.bitmap.data.writeUInt32BE(color, idx);
    }
  });
}

async function drawFilledCircle(img, cx, cy, radius, color) {
  img.scan(cx - radius, cy - radius, radius * 2, radius * 2, function (px, py, idx) {
    if (Math.hypot(px - cx, py - cy) <= radius) {
      this.bitmap.data.writeUInt32BE(color, idx);
    }
  });
}

async function drawStripe(img, size, angle, thickness, color) {
  // Diagonal stripe overlay
  img.scan(0, 0, size, size, function (px, py, idx) {
    const d = Math.abs(px * Math.sin(angle) - py * Math.cos(angle));
    if (d < thickness / 2) {
      this.bitmap.data.writeUInt32BE(color, idx);
    }
  });
}

async function generateIcon(size, outputPath) {
  const img = new Jimp({ width: size, height: size, color: RED });
  const s = size;
  const pad = Math.round(s * 0.12);

  // White square background for logo
  const boxSize = Math.round(s * 0.32);
  const boxX = Math.round(s * 0.15);
  const boxY = Math.round(s * 0.3);
  await drawRoundedRect(img, boxX, boxY, boxSize, boxSize, 0, WHITE);

  // Red dot inside white box (logo marker)
  const dotR = Math.round(boxSize * 0.28);
  await drawFilledCircle(img, boxX + Math.round(boxSize / 2), boxY + Math.round(boxSize / 2), dotR, RED);

  // Diagonal black accent stripe (decorative)
  const stripeAngle = Math.PI / 5.5;
  img.scan(0, 0, s, s, function (px, py, idx) {
    const d = (px * Math.cos(stripeAngle) + py * Math.sin(stripeAngle));
    const band = d % (s * 0.9);
    if (band > s * 0.75 && band < s * 0.75 + s * 0.025) {
      this.bitmap.data.writeUInt32BE(0x00000033, idx); // subtle black band
    }
  });

  // White horizontal bar at bottom
  const barH = Math.round(s * 0.18);
  img.scan(0, s - barH, s, barH, function (px, py, idx) {
    this.bitmap.data.writeUInt32BE(WHITE, idx);
  });

  // Red stripe through white bar
  const stripeH = Math.round(barH * 0.25);
  const stripeY = s - barH + Math.round((barH - stripeH) / 2);
  img.scan(0, stripeY, s, stripeH, function (px, py, idx) {
    this.bitmap.data.writeUInt32BE(RED, idx);
  });

  await img.write(outputPath);
  console.log(`✅ Generated ${outputPath} (${size}x${size})`);
}

async function generateAdaptiveIcon(size, outputPath) {
  // Adaptive icon: red background with white emblem, no padding (full bleed)
  const img = new Jimp({ width: size, height: size, color: RED });
  const s = size;

  // White circle in center
  const cr = Math.round(s * 0.28);
  const cx = Math.round(s / 2);
  const cy = Math.round(s / 2);
  await drawFilledCircle(img, cx, cy, cr, WHITE);

  // Red dot inside white circle
  await drawFilledCircle(img, cx, cy, Math.round(cr * 0.6), RED);

  // Small white ring
  await drawFilledCircle(img, cx, cy, Math.round(cr * 0.3), WHITE);

  await img.write(outputPath);
  console.log(`✅ Generated ${outputPath} (${size}x${size})`);
}

async function generateSplashIcon(size, outputPath) {
  // Splash icon: transparent background, red/white logo mark
  const img = new Jimp({ width: size, height: size, color: TRANS });
  const s = size;
  const cx = Math.round(s / 2);
  const cy = Math.round(s / 2);

  // Outer white circle
  await drawFilledCircle(img, cx, cy, Math.round(s * 0.46), WHITE);
  // Red ring
  await drawFilledCircle(img, cx, cy, Math.round(s * 0.38), RED);
  // White inner circle
  await drawFilledCircle(img, cx, cy, Math.round(s * 0.25), WHITE);
  // Red center dot
  await drawFilledCircle(img, cx, cy, Math.round(s * 0.12), RED);

  await img.write(outputPath);
  console.log(`✅ Generated ${outputPath} (${size}x${size})`);
}

async function main() {
  console.log('🎨 Generating Canada 24/7 app icons...\n');
  try {
    await generateIcon(1024, path.join(ASSETS, 'icon.png'));
    await generateAdaptiveIcon(1024, path.join(ASSETS, 'adaptive-icon.png'));
    await generateSplashIcon(200, path.join(ASSETS, 'splash-icon.png'));
    console.log('\n✨ All icons generated successfully!');
  } catch (err) {
    console.error('❌ Icon generation failed:', err.message);
    process.exit(1);
  }
}

main();
