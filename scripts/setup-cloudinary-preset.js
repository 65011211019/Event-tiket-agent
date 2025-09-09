/**
 * Cloudinary Upload Preset Setup Script
 * 
 * This script helps create an unsigned upload preset in Cloudinary for the event ticket agent application.
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

async function createUnsignedPreset() {
  try {
    console.log('Setting up Cloudinary unsigned upload preset...');
    console.log('Using cloud name:', process.env.CLOUDINARY_CLOUD_NAME || 'dcepm8sk3');
    
    // Create an unsigned upload preset
    const result = await cloudinary.api.create_upload_preset({
      name: 'event_ticket_agent',
      unsigned: true,
      folder: 'event_images'
    });

    console.log('✅ Successfully created upload preset!');
    console.log('Preset Name:', result.name);
    console.log('Preset Settings:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating upload preset:');
    console.error('Message:', error.message);
    console.error('Code:', error.http_code);
    console.error('Name:', error.name);
    
    // Print full error for debugging
    console.error('Full error:', error);
  }
}

// Run the setup function
createUnsignedPreset();