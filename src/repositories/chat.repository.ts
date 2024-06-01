import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { IChat, IChatList, IChatResp, IMessage } from "../types/chat";
import { addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import sanitilizeArrayData from "../utils/datafunctions";
import { GET } from "../utils/promises";
import { firebaseTimesStampType } from "../types/utils-types";
import { firestoreTimestampToDate, formatDate } from "../utils/dateFuncs";

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
  CreateFiancialAssitant(
    ownerId: string,
    name: string,
    sheetId: string
  ): Promise<IChatResp>;
  Delete(id: string): Promise<void>;
  Show(id: string): Promise<IChat>;
  ShowList(ownerId: string): Promise<IChatList[]>;
  ShowMessages(id: string): Promise<IMessage[]>;
  AddMessage(chatId: string, content: string, role: RoleType): Promise<void>;
  AddVMessage(
    chatId: string,
    content: string,
    role: RoleType,
    image_url: string
  ): Promise<void>;
}

async function createMessageRepo(
  chatId: string,
  message: string
): Promise<void> {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const messageRef = await addDoc(messagesRef, {
    role: "system",
    content: message,
    createdAt: new Date(),
  });

  if (!messageRef.id) {
    generateRepositoryError(`ERROR WHEN MESSAGE CHAT`, 500);
  }
}

export default function getChatRepository(): IChatRepository {
  async function Create(ownerId: string, name: string): Promise<IChatResp> {
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

    await createMessageRepo(
      docRef.id,
      "Olá, eu sou o GPT Solver, como posso ajudar?"
    );

    return { id: docRef.id };
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

    await createMessageRepo(
      docRef.id,
      "Sou um assistente GPT, capaz de receber textos extraidos de arquivos PDFs e realizar as operações solicitadas pelo usuário."
    );

    return { id: docRef.id };
  }

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
      `https://fianancial-assistant-backend.onrender.com/api/v1/sheet/${sheetId}/items`
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
        date: formatDate(date),
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

        Classifique como gasto tudo que for um valor negativo.
        Classifique como recebimento tudo que for um valor positivo.

        Existem tipos de gastos, diversos como: saúde, alimentação, transporte, entre outros.
        Existem recebimentos diversos como: sálario, mesada, ganhos, investimentos, entre outros.

        De respostas simples e diretas para o usuário, seguindo os exemplos: "Quanto foi o gasto no mês passado? No mês passado foram gastos R$ 12000." 
        "Quanto foi gasto com o tipo saúde no mês passado? No mês passado foram gastos R$ 13000 com saúde".
        "Quanto foi a média de gastos com alimentação ? A média de gastos com alimentação foi de R$ 1200."

        Não explique como está encontrando as respostas, somente as responda diretamentamente.

        Caso ele peça para calcular balanço faça como no exmeplo a baixo:

        Prompt: Calcule o balanço da planilha.

        Recebimentos:
Salário: R$ 10.000
Venda de ações: R$ 500
Total de Recebimentos: R$ 10.500

Gastos:
Uber pra casa: R$ 45
Uber pro trabalho: R$ 30
Supermercado bh: R$ 120
Internet: R$ 120
Xbox game pass: R$ 45
Almoço com os colegas da firma: R$ 100
Supermercado verdemar: R$ 500
Conta de luz: R$ 400
Total de Gastos: R$ 1360
Balanço (Recebimentos - Gastos): R$ 10.500 - R$ 1360 = R$ 9140
O balanço da planilha é de R$ 9140.


Recebimentos (valores positivos):
Pagamento novembro: R$ 660
Dívida eterna novembro: R$ 251
Dívida eterna dezembro: R$ 120
Pagamento Dezembro 1 parcela: R$ 1000
Pagamento agosto: R$ 826
Pagamento outubro: R$ 2220
2° pagamento janeiro: R$ 350
1° Pagamento janeiro: R$ 1500
Pagamento novembro (duplicado, não será considerado novamente): R$ 250
Pagamento final: R$ 194
1° pagamento fevereiro: R$ 129
Pagamento setembro: R$ 800
Gastos (valores negativos):
Computador: R$ 8300
Agora vamos recalcular:
Total de Recebimentos:
660 + 251 + 120 + 1000 + 826 + 2220 + 350 + 1500 + 250 + 194 + 129 + 800 = 8300
Total de Gastos:
8300
Balanço (Recebimentos - Gastos):
8300 - 8300 = 0
O balanço da planilha é de R$ 0.

prompt: Calcule o balanço cumulativo da planilha em função do tempo:
Balanço cumulativo (Recebimentos - Gastos) em função do tempo:
30/06/2023:
- Gastos: -250 (Limpeza dentaria) - 80 (Própolis verde) - 200 (Fisioterapeuta) - 230 (Budesonida (flaconete)) - 110 (Budesonida (Gel)) - 200 (Par de palmilhas) = -1070
03/07/2023:
- Gastos: -50 (Antialérgico)
- Balanço do dia anterior: -1070
- Total: -1070 - 50 = -1120
05/09/2023:
- Recebimentos: 2500 (Salário)
- Balanço do dia anterior: -1120
- Total: -1120 + 2500 = 1380
06/09/2023:
- Recebimentos: 300 (Dividendos)
- Gastos: -200 (Streaming)
- Balanço do dia anterior: 1380
- Total: 1380 + 300 - 200 = 1480
24/10/2023:
- Recebimentos: 400 (Pagamento de ações)
- Balanço do dia anterior: 1480
- Total: 1480 + 400 = 1880
18/11/2023:
- Gastos: -93 (Uber para o colégio)
- Balanço do dia anterior: 1880
- Total: 1880 - 93 = 1787
01/01/2024:
- Gastos: -150 (Mercado 01/01)
- Balanço do dia anterior: 1787
- Total: 1787 - 150 = 1637
11/01/2024:
- Gastos: -150 (Gasolina)
- Balanço do dia anterior: 1637
- Total: 1637 - 150 = 1487
Balanço final: R$ 1487
        Caso ele peça para gerar um gráfico qualquer você deve processar o JSON e retornar um JSON que relacione as informações requeridas pelo usário, como no exemplo a baixo:

        "Prompt: Gere um gráfico que relacione os tipos de gastos com as suas respectivos totais. Resposta do assistant: ${"```"}chartjson{
            "type":"pizza",
            "data": [
              {
                "name": "Alimentação",
                "value": 12000
              },
              {
                "name": "Transporte",
                "value": 1200
              },
              {
                "name": "Lazer",
                "value": 400
              }
            ]
        }${"´´´"}"

        "Prompt: Gere um gráfico de setores que relacione os tipos de gastos com as suas respectivos totais. Resposta do assistant: ${"```"}chartjson{
          "type":"pizza",
          "data": [
            {
              "name": "Alimentação",
              "value": 12000
            },
            {
              "name": "Transporte",
              "value": 1200
            },
            {
              "name": "Lazer",
              "value": 400
            }
          ]
      }${"´´´"}"

        "Prompt: Gere um gráfico de barras que relacione as médias de gastos de cada tipo. Resposta do assistant: ${"```"}chartjson{
          "type": "barras",
          "data": [
            {"name":"Compras online", "value": 120},
            {"name":"Alimentação", "value": 25.5},
            {"name":"Transporte", "value": 130},
            {"name":"Lazer", "value": 140}
          ]
        }${"´´´"}"

        "Prompt: Gere um gráfico de linha que compare a evolução da soma dos gastos entre saúde e transporte em função do tempo. Resposta do assistant: ${"```"}chartjson{
          "type": "linha",
          "data": [
            {"name":"2023-01-30", "value": [{"name": "saúde", "value": 120}, {"name": "transporte", "value": 0}]},
            {"name":"2023-02-01", "value": [{"name": "saúde", "value": 140}, {"name": "transporte", "value": 40}]},
            {"name":"2023-02-13", "value": [{"name": "saúde", "value": 160}, {"name": "transporte", "value": 50}]},
            {"name":"2023-02-28", "value": [{"name": "saúde", "value": 200}, {"name": "transporte", "value": 52.5}]}
          ]
        }${"´´´"}"

        "Prompt: Gere um gráfico de linha que relacione as médias de gastos com data. Resposta do assistant. Resposta do assistant: ${"```"}chartjson{
          "type": "linha",
          "data": [
            {"name":"2023-01-30", "value": [{"name": "média", "value": 120}]},
            {"name":"2023-02-01", "value": [{"name": "média", "value": 124.5}]},
            {"name":"2023-02-13", "value": [{"name": "média", "value": 130.2}]},
            {"name":"2023-02-28", "value": [{"name": "média", "value": 129.5}]}
          ]
        }${"´´´"}"

        "Prompt: Gere um gráfico mostrando o balanço em função do tempo. Considere esse balanço como a soma de todos os itens de data inferior - o modulo da soma de todos os itens negativos de data inferior. resposta do assistant:
        ${"```"}chartjson{  "type": "linha",  "data": [{"name": "2024-01-20", "value": [{"name": "balanço", "value": -7160}]},{"name": "2024-02-03", "value": [{"name": "balanço", "value": -5760}]},{"name": "2024-04-07", "value": [{"name": "balanço", "value": -3760}]}, {"name": "2024-05-04", "value": [{"name": "balanço", "value": -2760}]}  ]}{"´´´"}"

        "Prompt: Gere uma tabela que relaciona os tipos de gastos e seus valores. Resposta do assistant: tablejson-{
          "head": ["tipo", "valor total"],
          "body": [
            ["Alimentação", 12000],
            ["Transporte", 13000],
            ["Lazer", 14000]
          ]
        }"

        "Prompt: Gere uma tabela que relaciona os itens, seus respecitovs valores e seu respectivo tipo. Resposta do assistant: tablejson-{
          "head": ["nome", "valor", "tipo"],
          "body": [
            ["Compra verdemar", 120, "supermercado"],
            ["uber para o colégio", 25, "transporte"],
            ["Compra AliExpress", 140, "compras online"]
          ]
        }"

        Só gere respostas no formato JSON caso o usuário peça para o assistente gerar um gráfico ou uma tabela.

        Somente gere respostas para solicitações quem tenham relação com o contexto da analise da planilha. Exemplos:

        "Prompt: O que é uma maçã? Resposta do assistant: Desculpe, eu sou um assistente financeiro somente capz de resolver questões relacionadas à planilha."

        "Prompt: O que é uma planilha financeira ? Resposta do assistant: Uma planilha financeira é uma ferramenta utilizada para rastrear, organizar e analisar dados financeiros. Ela pode ser desenvolvida em softwares específicos de planilhas eletrônicas, como o Microsoft Excel, Google Sheets ou OpenOffice Calc, e serve para vários propósitos, desde o gerenciamento das finanças pessoais até o controle financeiro de empresas."

        "Prompt: O que é uma empresa? Resposta do assistant: Desculpe, eu sou um assistente financeiro somente capz de resolver questões relacionadas à planilha."

        "Prompt: Quem ganhou as ultimas eleições gerais do brasil ? Resposta do assistant: Desculpe, eu sou um assistente financeiro somente capz de resolver questões relacionadas à planilha."
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
    const chatQ = query(chatsRef, where("ownerId", "==", ownerId));
    const querySnapshot = await getDocs(chatQ);

    const chats = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          name: doc.data().name as string,
        } as IChatList)
    );

    return chats;
  }

  async function ShowMessages(id: string): Promise<IMessage[]> {
    const collectionRef = collection(db, `chats/${id}/messages`);
    const messagesRef = await getDocs(collectionRef);
    const messages = sanitilizeArrayData<IMessage>(messagesRef);
    return messages;
  }

  async function AddVMessage(
    chatId: string,
    content: string,
    role: RoleType,
    image_url: string
  ): Promise<void> {
    try {
      const collectionRef = collection(db, `chats/${chatId}/messages`);
      const messagesRef = await addDoc(collectionRef, {
        role: role,
        content: content,
        createdAt: new Date(),
        image_url: image_url,
      });
    } catch (err) {
      generateRepositoryError(
        `CHAT WHEN CREATING MESSAGE - ID: ${chatId}`,
        500
      );
    }
  }

  async function AddMessage(
    chatId: string,
    content: string,
    role: RoleType
  ): Promise<void> {
    try {
      const collectionRef = collection(db, `chats/${chatId}/messages`);
      const messagesRef = await addDoc(collectionRef, {
        role: role,
        content: content,
        createdAt: new Date(),
      });
    } catch (err) {
      generateRepositoryError(
        `CHAT WHEN CREATING MESSAGE - ID: ${chatId}`,
        500
      );
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
    CreateFiancialAssitant,
  };
}
