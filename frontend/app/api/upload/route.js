import { uploadImage } from '@/app/_utils/uploadImages';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response('No file uploaded', { status: 400 });
    }

    const downloadURL = await uploadImage(file);
    if (downloadURL) {
      return new Response(JSON.stringify({ url: downloadURL }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response('Failed to upload image', { status: 500 });
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
