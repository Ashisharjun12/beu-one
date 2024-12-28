import { Client, Storage, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Add CORS headers
client.headers['X-Appwrite-Response-Format'] = '1.0.0';
client.headers['Access-Control-Allow-Origin'] = '*';

const storage = new Storage(client);

// Function to upload PDF and get URLs
export const uploadPDF = async (file: File) => {
  try {
    const response = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      ID.unique(),
      file
    );
    
    const fileId = response.$id;
    const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view`;
    
    return { fileId, fileUrl };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

// Helper function to generate file link from file ID
export const generateFileLink = (fileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
};

// Function to delete PDF from Appwrite
export const deletePDF = async (fileId: string) => {
  try {
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