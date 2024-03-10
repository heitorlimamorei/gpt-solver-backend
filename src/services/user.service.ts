import { IUserRepository } from "../repositories/user.repository";
import IUser from "../types/user";
import isValidEmail from "../utils/email";

export interface IUserService {
    Create(email: string, name: string): Promise<void>;
    Update(user: IUser): Promise<void>;
    AddTokens(id: string, tokens: number): Promise<void>;
    RemoveTokens(id: string, tokens: number): Promise<void>;
    AddChat(id: string, chatId: string): Promise<void>;
    RemoveChat(id: string, chatId: string): Promise<void>;
    Delete(id: string): Promise<void>;
    Show(id: string): Promise<IUser>;
    ShowByEmail(email: string): Promise<IUser>
}

const generateServiceError = (message: string, status: number) => {
    throw new Error(`SERVICE: ${message} - ${status}`);
};

export default function getUserService(repository: IUserRepository): IUserService {
    async function CreateUser(email: string, name: string): Promise<void> {
        if (!isValidEmail(email)) {
            generateServiceError(`INVALID EMAIL: ${email}`, 400);
        }
        await repository.Create(email, name);
    }

    async function UpdateUser(user: IUser): Promise<void> {
        if (!isValidEmail(user.email)) {
            generateServiceError(`INVALID EMAIL: ${user.email}`, 400);
        }
        await repository.Update(user);
    }

    async function DeleteUser(id: string): Promise<void> {
        await repository.Delete(id);
    }

    async function ShowUserById(id: string): Promise<IUser> {
        return repository.Show(id);
    }

    async function ShowUserByEmail(email: string): Promise<IUser> {
        if (!isValidEmail(email)) {
            generateServiceError(`INVALID EMAIL: ${email}`, 400);
        }
        return repository.ShowByEmail(email);
    }

    async function AddTokens(id: string, tokens: number): Promise<void> {
        if (tokens > 0) {
            generateServiceError(`TOKENS MUST BE > 0: ${tokens}`, 500);
        }
        await repository.UpdateField(id, (c) => ({
            field: "totalTokens",
            value: c.totalTokens + tokens
        }));
    }

    async function RemoveTokens(id: string, tokens: number): Promise<void> {
        if (tokens > 0) {
            generateServiceError(`TOKENS MUST BE > 0: ${tokens}`, 500);
        }
        await repository.UpdateField(id, (c) => ({
            field: "totalTokens",
            value: c.totalTokens - tokens
        }));
    }

    async function AddChat(id: string, chatId: string): Promise<void> {
        await repository.UpdateField(id, (c) => ({
            field: "chats",
            value: [...c.chats, chatId]
        }));
    }

    async function RemoveChat(id: string, chatId: string): Promise<void> {
        await repository.UpdateField(id, (c) => ({
            field: "chats",
            value: c.chats.filter((c) => c != chatId)
        }));
    }

    return {
        Create: CreateUser,
        Update: UpdateUser,
        AddTokens: AddTokens,
        RemoveTokens: RemoveTokens,
        AddChat: AddChat,
        RemoveChat: RemoveChat,
        Delete: DeleteUser,
        Show: ShowUserById,
        ShowByEmail: ShowUserByEmail
    }
}