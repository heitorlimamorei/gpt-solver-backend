import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { IChat, IChatList, IChatResp, IMessage } from "../types/chat";
import { addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import sanitilizeArrayData from "../utils/datafunctions";

const generateRepositoryError = (message: string, status: number) => {
    throw new Error(`REPOSITORY:${message}-${status}`);
};

type RoleType = "user" | "assistant" | "system";

export interface IChatRepository {
    Create(ownerId: string, name: string): Promise<IChatResp>;
    Delete(id: string): Promise<void>;
    Show(id: string): Promise<IChat>;
    ShowList(ownerId: string): Promise<IChatList[]>;
    ShowMessages(id: string): Promise<IMessage[]>;
    AddMessage(chatId: string, content: string, role: RoleType): Promise<void>;
}

async function createMessageRepo(chatId: string): Promise<void> {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const messageRef = await addDoc(messagesRef, {
        role: "system",
        content: "Olá, eu sou o GPT Solver, como posso ajudar?",
        createdAt: new Date()
    });

    if (!messageRef.id) {
        generateRepositoryError(`ERROR WHEN MESSAGE CHAT`, 500);
    }
};

export default function getChatRepository(): IChatRepository {
    async function Create(ownerId: string, name: string): Promise<IChatResp>{
        const usersRef = collection(db, "chats");

        const chat = {
            name: name,
            ownerId: ownerId,
            createdAt: new Date(),
        };

        const docRef = await addDoc(usersRef, chat);
    
        if (!docRef.id) {
            generateRepositoryError(`ERROR WHEN CREATE CHAT`, 500);
        }

        await createMessageRepo(docRef.id);

        return {id: docRef.id};
    }

    async function Delete(chatId: string): Promise<void> {
       try {
        const docRef = doc(db, `chats/${chatId}`);
        await deleteDoc(docRef);
       } catch (err) {
        generateRepositoryError(`ERROR WHEN DELETE CHAT`, 500);
       }
    }

    async function Show(chatId: string): Promise<IChat> {
        const collectionRef = collection(db, "chats");
        const docRef = doc(collectionRef, chatId);
        const chatRef = await getDoc(docRef);
        const chat = { id: chatId, ...chatRef.data() } as unknown as IChat;

        if (!chatRef.exists()) {
            generateRepositoryError(`CHAT NOT FOUND - ID: ${chatId}`, 404);
        }

        return chat;        
    }

    async function ShowList(ownerId: string): Promise<IChatList[]> {
        const chatsRef = collection(db, "chats");
        const chatQ = query(chatsRef, where("ownerId", "==", ownerId))
        const querySnapshot = await getDocs(chatQ);

        const chats = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name as string,
        } as IChatList));

        return chats;
    }

    async function ShowMessages(id: string): Promise<IMessage[]> {
        const collectionRef = collection(db, `chats/${id}/messages`);
        const messagesRef = await getDocs(collectionRef);
        const messages = sanitilizeArrayData<IMessage>(messagesRef); 
        return messages;
    }

    async function AddMessage(chatId: string, content: string, role: RoleType): Promise<void> {
       try {
        const collectionRef = collection(db, `chats/${chatId}/messages`);
        const messagesRef = await addDoc(collectionRef, {
            role: role,
            content: content,
            createdAt: new Date()
        });
       } catch (err) {
        generateRepositoryError(`CHAT WHEN CREATING MESSAGE - ID: ${chatId}`, 500);
       }
    }

    return {
        Create,
        Delete,
        Show,
        ShowList,
        ShowMessages,
        AddMessage
    };
};