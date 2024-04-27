import { IChatRepository } from "../repositories/chat.repository";
import getUserRepository from "../repositories/user.repository";
import { IChat, IChatList, IMessage } from "../types/chat";
import { isValidBase64Image } from "../utils/datafunctions";
import { PromiseScheduler } from "../utils/promises";
import getUserService from "./user.service";

export type RoleType = "user" | "assistant" | "system";

export interface IChatService {
    CreateChatPDF(ownerId: string, name: string): Promise<string>;
    Create(ownerId: string, name: string): Promise<string>;
    Delete(id: string): Promise<void>;
    Show(id: string): Promise<IChat>;
    ShowList(ownerId: string): Promise<IChatList[]>;
    ShowMessages(id: string): Promise<IMessage[]>;
    AddMessage(chatId: string, content: string, role: RoleType): Promise<void>;
    AddVMessage(chatId:string, content: string, role: RoleType, image_url: string): Promise<void>;
}

const generateServiceError = (message: string, status: number) => {
    throw new Error(`SERVICE:${message}-${status}`);
};

const userRepo = getUserRepository();
const userService = getUserService(userRepo);

function getChatService(repository: IChatRepository): IChatService {
    async function CreateChatPDF(ownerId: string, name: string): Promise<string> {
        const owner = await userService.Show(ownerId);

        if (!owner) {
            generateServiceError(`USER NOT FOUND: ${ownerId}`, 404);
        }

        if (name.length < 4) {
            generateServiceError(`INVALID NAME: ${name}`, 400);
        }

        const chat = await repository.CreateChatPDF(ownerId, name);

        await userService.AddChat(owner.id, chat.id)
        return chat.id;
    }

    async function Create(ownerId: string, name: string): Promise<string> {
        const owner = await userService.Show(ownerId);

        if (!owner) {
            generateServiceError(`USER NOT FOUND: ${ownerId}`, 404);
        }

        if (name.length < 4) {
            generateServiceError(`INVALID NAME: ${name}`, 400);
        }

        const chat = await repository.Create(ownerId, name);

        await userService.AddChat(owner.id, chat.id)
        return chat.id;
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

    async function AddVMessage(chatId:string, content: string, role: RoleType, image_url: string): Promise<void> {
        if (!content) {
            generateServiceError(`INVALID MESSAGE: ${content}`, 400);
        }

        if (content.length < 5) {
            generateServiceError(`INVALID MESSAGE: ${content}`, 400);
        }

        if (role != "user") {
            generateServiceError(`INVALID ROLE: ${role}`, 400);
        }

        if (!isValidBase64Image(image_url)) {
            generateServiceError(`INVALID IMAGE: ${role}`, 400);
        }
        await repository.AddVMessage(chatId, content, role, image_url);
    }

    return {
        CreateChatPDF,
        Create,
        Show,
        ShowList,
        ShowMessages,
        AddMessage,
        Delete,
        AddVMessage
    };
}

export default getChatService;