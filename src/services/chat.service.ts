import { IChatRepository } from "../repositories/chat.repository";
import getUserRepository from "../repositories/user.repository";
import { IChat, IChatList, IMessage } from "../types/chat";
import { PromiseScheduler } from "../utils/promises";
import getUserService from "./user.service";

type RoleType = "user" | "assistant" | "system";

export interface IChatService {
    Create(ownerId: string, name: string): Promise<void>;
    Delete(id: string): Promise<void>;
    Show(id: string): Promise<IChat>;
    ShowList(ownerId: string): Promise<IChatList[]>;
    ShowMessages(id: string): Promise<IMessage[]>;
    AddMessage(chatId: string, content: string, role: RoleType): Promise<void>;
}

const generateServiceError = (message: string, status: number) => {
    throw new Error(`SERVICE:${message}-${status}`);
};

const userRepo = getUserRepository();
const userService = getUserService(userRepo);

function getChatService(repository: IChatRepository): IChatService {
    async function Create(ownerId: string, name: string): Promise<void> {
        const owner = await userService.Show(ownerId);

        if (!owner) {
            generateServiceError(`USER NOT FOUND: ${ownerId}`, 404);
        }

        if (name.length < 4) {
            generateServiceError(`INVALID NAME: ${name}`, 400);
        }

        const chat = await repository.Create(ownerId, name);

        await userService.AddChat(owner.id, chat.id)
    }

    async function Show(id: string): Promise<IChat> {
        const chat = await repository.Show(id);

        if (!chat) {
            generateServiceError(`CHAT NOT FOUND: ${id}`, 404);
        }

        return chat;
    }

    async function Delete(id: string): Promise<void> {
        const chat = await repository.Show(id);

        if (!chat) {
            generateServiceError(`CHAT NOT FOUND: ${id}`, 404);
        }

        await PromiseScheduler<void>([
            userService.RemoveChat(chat.ownerId, id),
            repository.Delete(id)
        ]);
    }

    async function ShowList(ownerId: string): Promise<IChatList[]> {
        return await repository.ShowList(ownerId);
    }

    async function ShowMessages(id: string): Promise<IMessage[]> {
        const messages = await repository.ShowMessages(id);

        if (messages.length == 0) {
            generateServiceError(`MESSAGES NOT FOUND: ${id}`, 404);
        }

        return messages;
    }

    async function AddMessage(chatId:string, content: string, role: RoleType): Promise<void> {
        if (!content) {
            generateServiceError(`INVALID MESSAGE: ${content}`, 400);
        }

        if (content.length < 5) {
            generateServiceError(`INVALID MESSAGE: ${content}`, 400);
        }

        if (!(role == "assistant" || role == "user")) {
            generateServiceError(`INVALID ROLE: ${role}`, 400);
        }
        
        await repository.AddMessage(chatId, content, role);
    }

    return {
        Create,
        Show,
        ShowList,
        ShowMessages,
        AddMessage,
        Delete
    };
}