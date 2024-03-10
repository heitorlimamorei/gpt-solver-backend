import { firebaseTimesStampType } from "./utils-types";

export default interface IUser {
    id: string;
    name: string;
    email: string;
    totalTokens: number;
    plan: string;
    chats: string[];
    createdAt: firebaseTimesStampType;
}

export interface INewUser {
    name: string;
    email: string;
}