// Cloudinary configuration for image upload and management
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Helper function to get Cloudinary URL for a card
export function getCloudinaryCardUrl(theme: string, filename: string): string {
  // Cloudinary folder structure: loteria-cards/{theme}/{filename}
  const publicId = `loteria-cards/${theme}/${filename.replace('.png', '')}`;
  
  return cloudinary.url(publicId, {
    format: 'png',
    quality: 'auto',
    fetch_format: 'auto'
  });
}
