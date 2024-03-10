import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebase/config";
import IUser from "../types/user";
import sanitilizeArrayData from "../utils/datafunctions";

const generateRepositoryError = (message: string, status: number) => {
    throw new Error(`REPOSITORY:${message}-${status}`);
};

interface IUpdatedField<T>  {
    field: "totalTokens" | "chats" | "plan" | "name" | "email";
    value: T;
}

type WritterFunction<T> = (c: IUser) =>  IUpdatedField<T>;

export interface IUserRepository {
    Create(email: string, name: string): Promise<void>;
    Update(user: IUser): Promise<void>;
    UpdateField<T>(id: string, updatedField: WritterFunction<T>): Promise<void>;
    Show(id: string): Promise<IUser>;
    ShowByEmail(email: string): Promise<IUser>;
    Delete(id: string): Promise<void>;
}

export default function getUserRepository(): IUserRepository {
    async function CreateUser(email: string, name: string): Promise<void>{
        const usersRef = collection(db, "users");
        const docRef = await addDoc(usersRef, {
            email: email,
            name: name,
            totalTokens: 0,
            plan: "basic",
            chats: [],
            createdAt: new Date(),
        });
    
        if (!docRef.id) {
            generateRepositoryError(`ERROR WHEN CREATE USER`, 500);
        }
    }
    
    async function ShowUserById(id: string): Promise<IUser> {
        const usersRef = collection(db, "users");
        const docRef = await getDoc(doc(usersRef, id));
        const user = docRef.data() as IUser;
    
        if (!docRef.exists()){
            generateRepositoryError(`USER NOT FOUND - ID: ${id}`, 404);
        }
    
        return user;
    }
    
    async function ShowUserByEmail(email: string): Promise<IUser> {
        const usersRef = collection(db, "users");
        const userQ = query(usersRef, where("email", "==", email));
        const users = await getDocs(userQ);
        const user = sanitilizeArrayData<IUser>(users);
    
        if (user.length == 0){
            generateRepositoryError(`USER NOT FOUND - EMAIL: ${email}`, 404);
        }
    
        if (user.length > 1) {
            generateRepositoryError(`MORE THAN ONE USER FOUND - EMAIL: ${email}`, 500);
        }
    
        return user[0];
    }
    
    async function DeleteUser(id: string): Promise<void> {
        const docRef = doc(db, `users/${id}`);
        const userRef = await getDoc(docRef);
    
        if (!userRef.exists()){
            generateRepositoryError(`USER NOT FOUND - ID: ${id}`, 404);
        }
    
        await deleteDoc(docRef);
    }
    
    async function UpdateUser(user: IUser): Promise<void> {
        const docRef = doc(db, `users/${user.id}`);
        const userRef = await getDoc(docRef);
    
        if (!userRef.exists()){
            generateRepositoryError(`USER NOT FOUND - ID: ${user.id}`, 404);
        }
    
        await setDoc(docRef, {
            email: user.email,
            name: user.name,
            totalTokens: user.totalTokens,
            plan: user.plan,
            chats: user.chats,
        });
    }
    
    async function UpdateField<T>(id: string, w: WritterFunction<T>): Promise<void> {
        const docRef = doc(db, `users/${id}`);
        const userRef = await getDoc(docRef);


        const updatedField = w(userRef.data() as IUser);

        if (!userRef.exists()){
            generateRepositoryError(`USER NOT FOUND - ID: ${id}`, 404);
        }
    
        if (!updatedField.field) {
            generateRepositoryError(`INVALID FIELD TO BE UPDATED - ID: ${id}`, 500);
        }
    
        if (updatedField.value != null && updatedField.value != undefined) {
            generateRepositoryError(`INVALID VALUE TO BE UPDATED - ID: ${id}`, 500);
        }
    
        if (userRef.data()?.[updatedField.field] == updatedField.value) {
            generateRepositoryError(`NOTHING TO BE UPDATED - ID: ${id}`, 400);
        }
    
        await setDoc(docRef, {
            [updatedField.field]: updatedField.value,
        });
    }
    
    return {
        Create: CreateUser,
        Update: UpdateUser,
        UpdateField: UpdateField,
        Show: ShowUserById,
        ShowByEmail: ShowUserByEmail,
        Delete: DeleteUser
    };
}