import { db } from '@/app/_lib/fireBaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { title, description, imageUrl } = await request.json();

    const docRef = await addDoc(collection(db, 'posts'), {
      title,
      description,
      imageUrl,
    });

    return new Response(JSON.stringify({ id: docRef.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error saving post:", error);
    return new Response('Failed to save post', { status: 500 });
  }
}
