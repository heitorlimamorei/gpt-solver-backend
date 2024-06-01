import { firebaseTimesStampType } from "./utils-types";

export interface IChat {
    ownerId: string;
    name: string;
    createdAt: firebaseTimesStampType;
}

export interface INewFiancialAssistant {
    ownerId: string;
    name: string;
    sheetId: string;
    createdAt: firebaseTimesStampType;
}


export interface IMessage {
    id?: string;
    createdAt?: firebaseTimesStampType;
    role: "system" | "assistant" | "user"
    content: string;
    image_url?: string;
}

export interface IChatList {
    id: string;
    name: string;
}

export interface IChatResp {
    id: string;
}