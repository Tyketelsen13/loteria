#!/usr/bin/env node

/**
 * Script to upload specific updated cards to Cloudinary
 * Run with: node scripts/upload-updated-cards.js
 */

const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadCard(filePath, publicId, description) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'loteria-cards',
      resource_type: 'image',
      overwrite: true,
    });
    console.log(`✅ Uploaded ${description}: ${publicId}`);
    console.log(`   URL: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to upload ${description}:`, error.message);
    throw error;
  }
}

async function uploadUpdatedCards() {
  console.log('🚀 Starting upload of updated el-arpa cards...');

  const cardsToUpload = [
    {
      localPath: path.join(__dirname, '..', 'public', 'cards', 'el-arpa.png'),
      publicId: 'traditional/el-arpa',
      description: 'Traditional el-arpa card'
    },
    {
      localPath: path.join(__dirname, '..', 'public', 'custom-cards', 'horror-theme', 'el-arpa-horror.png'),
      publicId: 'horror-theme/el-arpa-horror',
      description: 'Horror-themed el-arpa card'
    }
  ];

  let totalUploaded = 0;
  let totalFailed = 0;

  for (const card of cardsToUpload) {
    try {
      // Check if file exists
      if (!fs.existsSync(card.localPath)) {
        console.error(`❌ File not found: ${card.localPath}`);
        totalFailed++;
        continue;
      }

      await uploadCard(card.localPath, card.publicId, card.description);
      totalUploaded++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      totalFailed++;
    }
  }

  console.log('\n🎉 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${totalUploaded} cards`);
  console.log(`❌ Failed uploads: ${totalFailed} cards`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some uploads failed. Please check the errors above.');
  } else {
    console.log('\n🎊 All updated el-arpa cards uploaded successfully!');
    console.log('\nThe updated cards should now be available on your production site.');
  }
}

// Check if required environment variables are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary configuration. Please check your .env.local file.');
  process.exit(1);
}

// Run the upload
uploadUpdatedCards().catch(console.error);
