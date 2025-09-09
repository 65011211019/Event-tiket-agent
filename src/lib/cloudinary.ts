/**
 * Cloudinary utility functions for image upload and management
 */

// Cloudinary configuration using environment variables
// Note: Vite exposes only variables prefixed with VITE_ to client-side code
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dcepm8sk3';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'event_ticket_agent';
const FOLDER = 'event_images';

/**
 * Uploads an image file to Cloudinary
 * @param file - The image file to upload
 * @returns Promise resolving to the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', FOLDER);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image to Cloudinary: ${response.status} ${response.statusText}. ${errorText}`);
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Uploads multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @returns Promise resolving to an array of secure URLs
 */
export const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw error;
  }
};

/**
 * Deletes an image from Cloudinary by its public ID
 * @param publicId - The public ID of the image to delete
 * @returns Promise resolving to the deletion result
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // Note: For unsigned uploads, direct deletion isn't typically allowed
    // This would require server-side signed deletion
    console.warn('Direct deletion from Cloudinary requires server-side implementation');
    return false;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export default {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary
};