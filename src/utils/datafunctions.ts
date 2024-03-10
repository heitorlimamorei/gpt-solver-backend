import { DocumentData, QuerySnapshot } from "firebase/firestore/lite";

type resp <T> = T[];

export default function sanitilizeArrayData<T>(data: QuerySnapshot<DocumentData, DocumentData>): resp<T> {
    let resp: resp<T> = [];
    data.docs.forEach((doc) => {
        resp.push({
          id: doc.id,
          ...doc.data(),
        } as T);
    });
    return resp;
}