#!/usr/bin/env node

/**
 * Script to upload paper-art cards to Cloudinary
 * Run with: node scripts/upload-paper-art-only.js
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

async function uploadCard(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'loteria-cards',
      resource_type: 'image',
      overwrite: true,
    });
    console.log(`✅ Uploaded: ${publicId}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to upload ${publicId}:`, error.message);
    throw error;
  }
}

async function uploadPaperArtCards() {
  const paperArtDir = path.join(__dirname, '..', 'public', 'custom-cards', 'paper-art-theme');
  
  if (!fs.existsSync(paperArtDir)) {
    console.error('❌ Paper art cards directory not found:', paperArtDir);
    return;
  }

  const files = fs.readdirSync(paperArtDir);
  const imageFiles = files.filter(file => 
    file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg')
  );

  console.log('🚀 Starting upload of paper-art cards to Cloudinary...');
  console.log(`📁 Found ${imageFiles.length} paper-art images`);

  let totalUploaded = 0;
  let totalFailed = 0;

  for (const file of imageFiles) {
    const filePath = path.join(paperArtDir, file);
    const publicId = `paper-art-theme/${file.replace(/\.(png|jpg)$/i, '')}`;
    
    try {
      await uploadCard(filePath, publicId);
      totalUploaded++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      totalFailed++;
    }
  }

  console.log('\n🎉 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${totalUploaded} images`);
  console.log(`❌ Failed uploads: ${totalFailed} images`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some uploads failed. You may want to retry those manually.');
  } else {
    console.log('\n🎊 All paper-art images uploaded successfully!');
  }
}

// Check if required environment variables are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary configuration. Please set these environment variables in .env.local:');
  console.error('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.error('   CLOUDINARY_API_KEY=your_api_key');
  console.error('   CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
}

// Run the upload
uploadPaperArtCards().catch(console.error);
