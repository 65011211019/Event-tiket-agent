# Cloudinary Upload Preset Setup Guide

Since we're encountering authentication issues with the automated script, here's a manual guide to set up the unsigned upload preset in your Cloudinary account.

## ✅ Setup Complete!

Great news! Your Cloudinary integration has been successfully configured with the following credentials:

- **Cloud Name**: `dcepm8sk3`
- **API Key**: `723429928899646`
- **API Secret**: `XCg6qvGKBj8x2eo-uwwxoGwatc0`
- **Upload Preset**: `event_ticket_agent`
- **Folder**: `event_images`

The unsigned upload preset has been created automatically, so your image uploads should now work correctly in the Admin Event Form.

## Testing the Image Upload

To test the image upload functionality:

1. Run the development server: `npm run dev`
2. Navigate to the Admin Event Form
3. Try uploading an image using the file input fields in the "รูปภาพ" section

## How It Works

The image upload process:

1. When a user selects an image file, it's sent directly to Cloudinary
2. Cloudinary processes the image and returns a secure URL
3. The URL is saved in the event data
4. Images are organized in the `event_images` folder in your Cloudinary account

## Troubleshooting

If you encounter any issues:

1. Verify that the environment variables in `.env` are correct
2. Check that the upload preset `event_ticket_agent` exists in your Cloudinary account
3. Ensure the preset is set to "Unsigned" mode
4. Confirm your Cloudinary account is active

## Security Note

For production applications, consider:
1. Using signed uploads instead of unsigned uploads for better security
2. Implementing server-side upload handling for sensitive applications
3. Adding file size and type validation

## Manual Setup (If Needed)

If you need to manually recreate the upload preset:

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Navigate to **Settings** > **Upload** tab
3. Scroll down to **Upload Presets** section
4. Click **Add upload preset**
5. Configure with:
   - **Name**: `event_ticket_agent`
   - **Signing Mode**: Unsigned
   - **Folder**: `event_images`
6. Click **Save**