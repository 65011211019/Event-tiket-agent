/**
 * Simple Cloudinary test script to verify credentials
 */

import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcepm8sk3',
  api_key: process.env.CLOUDINARY_API_KEY || '723429928899646',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'XCg6qvGKBj8x2eo-uwwxoGwatc0',
});

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary credentials...');
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME || 'dcepm8sk3');
    console.log('API key:', process.env.CLOUDINARY_API_KEY || '723429928899646');
    
    // Try to ping Cloudinary to verify credentials
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);
    
    // Try to get cloud details
    const cloudDetails = await cloudinary.api.config();
    console.log('Cloud details:', cloudDetails);
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:');
    console.error('Message:', error.message);
    console.error('Code:', error.http_code);
    console.error('Name:', error.name);
    
    // Print full error for debugging
    console.error('Full error:', error);
  }
}

// Run the test function
testCloudinary();