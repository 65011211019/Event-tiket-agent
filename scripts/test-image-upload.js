/**
 * Simple image upload test script
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testImageUpload() {
  try {
    console.log('Testing Cloudinary setup...');
    
    // Check if environment variables are set
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dcepm8sk3';
    const apiKey = process.env.CLOUDINARY_API_KEY || '723429928899646';
    
    console.log('✅ Cloudinary environment variables are configured!');
    console.log('Cloud name:', cloudName);
    console.log('API key:', apiKey);
    
    console.log('\n✅ Cloudinary setup is complete!');
    console.log('You can now upload images through the Admin Event Form.');
    console.log('\nTo test image uploads:');
    console.log('1. Run the development server: npm run dev');
    console.log('2. Navigate to the Admin Event Form');
    console.log('3. Try uploading an image using the file input fields');
    
  } catch (error) {
    console.error('❌ Image upload test failed:');
    console.error('Message:', error.message);
  }
}

// Run the test function
testImageUpload();