import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import ISubscription from "../types/subscription";
import sanitilizeArrayData from "../utils/datafunctions";

const generateRepositoryError = (message: string, status: number) => {
    throw new Error(`REPOSITORY:${message}-${status}`);
};

interface ISubscriptionRepo {
    Create(subscription: ISubscription): Promise<string>;
    Delete(id: string): Promise<void>;
    Show(id: string): Promise<ISubscription>;
    ShowByUserId(userId: string): Promise<ISubscription[]>;
}


export default function getSubscriptionRepository(): ISubscriptionRepo {
    async function Create(subscription: ISubscription): Promise<string>{
        const collectionRef = collection(db, "subscriptions");
        const docRef = await addDoc(collectionRef, subscription);
        if (!docRef.id) {
            generateRepositoryError(`ERROR WHEN CREATE SUBSCRIPTION`, 500);
        }

        return docRef.id;
    }

    async function Delete(id: string): Promise<void>{
        const docRef = doc(db, `subscriptions/${id}`);
        const userRef = await getDoc(docRef);
    
        if (!userRef.exists()){
            generateRepositoryError(`USER NOT FOUND - ID: ${id}`, 404);
        }
        
        await deleteDoc(docRef)
    }

    async function Show(id: string): Promise<ISubscription> {
        const docRef = doc(db, `subscriptions/${id}`);
        const userRef = await getDoc(docRef);

        if (!userRef.exists()){
            generateRepositoryError(`USER NOT FOUND - ID: ${id}`, 404);
        }

        return {id: userRef.id, ...userRef.data()} as ISubscription;
    }

    async function ShowByUserId(userId: string): Promise<ISubscription[]> {
        const collectionRef = collection(db, "subscriptions");
        const q = query(collectionRef, where('endDate', '>', Timestamp.now()));

        const subscriptions = await getDocs(q);
        
        const sanitizedData = sanitilizeArrayData<ISubscription[]>(subscriptions);

        if (sanitilizeArrayData.length == 0){
            generateRepositoryError(`SUBSCRIPTIONS NOT FOUND - ID: ${userId}`, 404);
        }

        return sanitizedData as unknown as ISubscription[];
    }

    return {
        Create,
        Delete,
        Show,
        ShowByUserId
    }
}