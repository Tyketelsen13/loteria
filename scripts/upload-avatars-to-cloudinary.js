#!/usr/bin/env node

/**
 * Script to upload all existing avatars to Cloudinary
 * Run with: node scripts/upload-avatars-to-cloudinary.js
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

async function uploadAvatar(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'avatars',
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

async function uploadAllAvatars() {
  const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');
  
  if (!fs.existsSync(avatarsDir)) {
    console.log('📁 No avatars directory found. Creating it...');
    fs.mkdirSync(avatarsDir, { recursive: true });
    return;
  }

  const files = fs.readdirSync(avatarsDir);
  const avatarFiles = files.filter(file => 
    file.toLowerCase().endsWith('.png') || 
    file.toLowerCase().endsWith('.jpg') ||
    file.toLowerCase().endsWith('.jpeg')
  );

  if (avatarFiles.length === 0) {
    console.log('📁 No avatar files found to upload.');
    return;
  }

  let totalUploaded = 0;
  let totalFailed = 0;

  console.log('🚀 Starting avatar upload to Cloudinary...');
  console.log(`📁 Found ${avatarFiles.length} avatar files`);

  for (const file of avatarFiles) {
    const filePath = path.join(avatarsDir, file);
    const publicId = file.replace(/\.(png|jpg|jpeg)$/i, ''); // Remove extension for public_id
    
    try {
      await uploadAvatar(filePath, publicId);
      totalUploaded++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      totalFailed++;
    }
  }

  console.log('\n🎉 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${totalUploaded} avatars`);
  console.log(`❌ Failed uploads: ${totalFailed} avatars`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some uploads failed. You may want to retry those manually.');
  } else {
    console.log('\n🎊 All avatars uploaded successfully!');
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
uploadAllAvatars().catch(console.error);
