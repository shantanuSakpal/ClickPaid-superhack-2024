import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/fireBaseConfig";
import { collection, addDoc } from 'firebase/firestore';
import { db } from "../lib/fireBaseConfig"; 
export const uploadImage = async (file) => {
  if (!file) return null;

  const storageRef = ref(storage, `images/${file.name}`);
  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};



export const saveSettings = async (formState, images) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...formState,
      images,
    });
    console.log("Post saved successfully with ID:", docRef.id);
    return docRef.id; // Return the document ID if needed
  } catch (error) {
    console.error("Error saving post:", error);
    throw new Error("Could not save post."); // Throw an error to handle in the calling function
  }
};