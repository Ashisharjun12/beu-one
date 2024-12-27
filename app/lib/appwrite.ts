import { Client, Storage, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const storage = new Storage(client);

// Function to upload PDF and get URLs
export const uploadPDF = async (file: File) => {
  try {
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Invalid file type. Please upload a PDF file.');
    }

    const response = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      ID.unique(),
      file
    );

    if (!response.$id) {
      throw new Error('Failed to upload file to Appwrite');
    }

    return response.$id;
  } catch (error: any) {
    console.error('Appwrite upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};

// Helper function to generate file link from file ID
export const generateFileLink = (fileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
};

// Function to delete PDF from Appwrite
export const deletePDF = async (fileId: string) => {
  try {
    const storage = new Storage(client);
    await storage.deleteFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      fileId
    );
    return true;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
}; 