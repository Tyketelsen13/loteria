#!/usr/bin/env node

/**
 * Script to upload all custom cards to Cloudinary
 * Run with: node scripts/upload-cards-to-cloudinary.js
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

async function uploadAllCards() {
  const customCardsDir = path.join(__dirname, '..', 'public', 'custom-cards');
  
  if (!fs.existsSync(customCardsDir)) {
    console.error('❌ Custom cards directory not found:', customCardsDir);
    return;
  }

  const themes = fs.readdirSync(customCardsDir);
  let totalUploaded = 0;
  let totalFailed = 0;

  console.log('🚀 Starting upload to Cloudinary...');
  console.log('📁 Found themes:', themes);

  for (const theme of themes) {
    const themePath = path.join(customCardsDir, theme);
    
    if (!fs.statSync(themePath).isDirectory()) continue;

    console.log(`\n📂 Processing theme: ${theme}`);
    
    const files = fs.readdirSync(themePath);
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg')
    );

    console.log(`   Found ${imageFiles.length} images`);

    for (const file of imageFiles) {
      const filePath = path.join(themePath, file);
      const publicId = `${theme}/${file.replace(/\.(png|jpg)$/i, '')}`;
      
      try {
        await uploadCard(filePath, publicId);
        totalUploaded++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        totalFailed++;
      }
    }
  }

  console.log('\n🎉 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${totalUploaded} images`);
  console.log(`❌ Failed uploads: ${totalFailed} images`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some uploads failed. You may want to retry those manually.');
  } else {
    console.log('\n🎊 All images uploaded successfully!');
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
uploadAllCards().catch(console.error);
