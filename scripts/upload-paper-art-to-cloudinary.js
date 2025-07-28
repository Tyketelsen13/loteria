// upload-paper-art-to-cloudinary.js
// Usage: node scripts/upload-paper-art-to-cloudinary.js
// Uploads all PNGs in public/custom-cards/paper-art/ to Cloudinary under the 'paper-art' folder

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const localDir = path.join(__dirname, '../public/custom-cards/paper-art-theme');
const cloudinaryFolder = 'paper-art-theme';

async function uploadAll() {
  const files = fs.readdirSync(localDir).filter(f => f.endsWith('.png'));
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const publicId = `${cloudinaryFolder}/${file}`.replace(/\\/g, '/').replace(/\.png$/, '');
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder: 'loteria-cards',
        public_id: `${cloudinaryFolder}/${file.replace(/\.png$/, '')}`,
        overwrite: true,
        resource_type: 'image',
      });
      console.log(`Uploaded: ${file} -> ${result.secure_url}`);
    } catch (err) {
      console.error(`Failed to upload ${file}:`, err.message);
    }
  }
  console.log('All uploads complete.');
}

uploadAll();
