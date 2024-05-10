import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { IChat, IChatList, IChatResp, IMessage } from "../types/chat";
import { addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import sanitilizeArrayData from "../utils/datafunctions";
import { GET } from "../utils/promises";
import { firebaseTimesStampType } from "../types/utils-types";
import { firestoreTimestampToDate, toggleDateToJson } from "../utils/dateFuncs";

const generateRepositoryError = (message: string, status: number) => {
    throw new Error(`REPOSITORY:${message}-${status}`);
};

type RoleType = "user" | "assistant" | "system";

export interface ISheetItem {
  id: string;
  name: string;
  type: number;
  description: string;
  author: string;
  date: firebaseTimesStampType;
}
  
export interface IChatRepository {
    Create(ownerId: string, name: string): Promise<IChatResp>;
    CreateChatPDF(ownerId: string, name: string): Promise<IChatResp>;
    CreateFiancialAssitant(ownerId: string, name: string, sheetId:string): Promise<IChatResp>;
    Delete(id: string): Promise<void>;
    Show(id: string): Promise<IChat>;
    ShowList(ownerId: string): Promise<IChatList[]>;
    ShowMessages(id: string): Promise<IMessage[]>;
    AddMessage(chatId: string, content: string, role: RoleType): Promise<void>;
    AddVMessage(chatId: string, content: string, role: RoleType, image_url: string): Promise<void>;
}

async function createMessageRepo(chatId: string, message: string): Promise<void> {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const messageRef = await addDoc(messagesRef, {
        role: "system",
        content: message,
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

        await createMessageRepo(docRef.id, "Olá, eu sou o GPT Solver, como posso ajudar?");

        return {id: docRef.id};
    }

    async function CreateChatPDF(ownerId: string, name: string) {
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

        await createMessageRepo(docRef.id, "Sou um assistente GPT, capaz de receber textos extraidos de arquivos PDFs e realizar as operações solicitadas pelo usuário.");

        return {id: docRef.id};
    };

    async function CreateFiancialAssitant(
      ownerId: string,
      name: string,
      sheetId: string
    ) {
      const usersRef = collection(db, "chats");

      const chat = {
        name: name,
        ownerId: ownerId,
        sheetId: sheetId,
        createdAt: new Date(),
      };

      const sheetData = await GET<ISheetItem[]>(
        `http://localhost:10000/api/v1/sheet/${sheetId}/items`
      );

      if (sheetData.status !== 200) {
        generateRepositoryError("Error when getting sheet data", 500);
      }

      if (!sheetData.data) {
        generateRepositoryError("ERROR, SHEET DATA EMPTY", 500);
      }

      const items = sheetData.data.map((item) => {
        const date = firestoreTimestampToDate(item.date);
        return {
          ...item,
          date: toggleDateToJson(date),
        };
      });

      const JSONItems = JSON.stringify(items);

      const docRef = await addDoc(usersRef, chat);

      if (!docRef.id) {
        generateRepositoryError(`ERROR WHEN CREATE CHAT`, 500);
      }

      await createMessageRepo(
        docRef.id,
        `Sou um assistente GPT, capaz de fazer análises de planilhas financeiras, e realizar as operações solicitadas pelo usuário.
        Os items da planilha atual estão no formato de JSON: ${JSONItems}.

        De respostas simples e diretas para o usuário, seguindo os exemplos: "Quanto foi o gasto no mês passado? No mês passado foram gastos R$ 12000." 
        "Quanto foi gasto com o tipo saúde no mês passado? No mês passado foram gastos R$ 13000 com saúde".
        "Quanto foi a média de gastos com alimentação ? A média de gastos com alimentação foi de R$ 1200."

        Não explique como está encontrando as respostas, somente as responda diretamentamente.

        Caso ele peça para gerar um gráfico qualquer você deve processar o JSON e retornar um JSON que relacione as informações requeridas pelo usário, como no exemplo a baixo:

        "Prompt: Gere um gráfico que relacione os tipos de gastos com as suas respectivos totais. Resposta do assistant: json:{
            "Alimentação": 12000,
            "Transporte": 13000,
            "Lazer": 14000
        }"

        Só gere respostas no formato JSON caso o usuário peça para o assistente gerar um gráifico ou uma tabela. 
        `
      );

      return { id: docRef.id };
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

    async function AddVMessage(chatId: string, content: string, role: RoleType, image_url: string): Promise<void> {
        try {
            const collectionRef = collection(db, `chats/${chatId}/messages`);
            const messagesRef = await addDoc(collectionRef, {
                role: role,
                content: content,
                createdAt: new Date(),
                image_url: image_url,
            });
           } catch (err) {
            generateRepositoryError(`CHAT WHEN CREATING MESSAGE - ID: ${chatId}`, 500);
           }
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
        AddMessage,
        AddVMessage,
        CreateChatPDF,
        CreateFiancialAssitant
    };
};