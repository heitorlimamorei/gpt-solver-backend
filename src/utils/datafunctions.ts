import { DocumentData, QuerySnapshot } from "firebase/firestore/lite";

export default function sanitilizeArrayData<T>(data: QuerySnapshot<DocumentData, DocumentData>): T[] {
    let resp: T[] = [];
    data.docs.forEach((doc) => {
        resp.push({
          id: doc.id,
          ...doc.data(),
        } as T);
    });
    return resp;
}

export function isValidBase64Image(base64Image: string): boolean {
  try {
      if (base64Image === '' || !base64Image.startsWith('data:image/')) {
          return false;
      }

      const splitBase64Image = base64Image.split(';base64,');

      if (splitBase64Image.length > 1) {
          atob(splitBase64Image[1]); 
      } else {
          return false;
      }

  } catch (error) {
      return false;
  }
  return true;
}