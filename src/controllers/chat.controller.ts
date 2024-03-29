import { Request, Response, NextFunction } from "express";
import { IChatService, RoleType } from "../services/chat.service";
import { IChat, IMessage } from "../types/chat";

interface IMessageRBody extends IMessage {
    chatId: string;
}

export interface IChatController {
    createChat(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteChat(req: Request, res: Response, next: NextFunction): Promise<void>;
    getChat(req: Request, res: Response, next: NextFunction): Promise<void>;
    listChats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    addMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
}

const generateHandlerError = (message: string, status: number) => {
    throw new Error(`HANDLER:${message}-${status}`);
};

function getChatController(chatService: IChatService): IChatController {
    async function createChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { ownerId, name }: IChat = req.body;

            if (!ownerId || typeof ownerId !== "string" || !name || typeof name !== "string" || name.length < 4) {
                generateHandlerError("Invalid ownerId or name", 400);
            }

            const id = await chatService.Create(ownerId, name);
            res.status(201).json({ id });
        } catch (error: any) {
            next(error.message);
        }
    }

    async function deleteChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id || typeof id !== "string") {
                generateHandlerError("Invalid chatId", 400);
            }

            await chatService.Delete(id);
            res.sendStatus(204);
        } catch (error: any) {
            next(error.message);
        }
    }

    async function getChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id || typeof id !== "string") {
                generateHandlerError("Invalid chatId", 400);
            }

            const chat = await chatService.Show(id);
            res.status(200).json(chat);
        } catch (error: any) {
            next(error.message);
        }
    }

    async function listChats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ownerId: string = req.params.ownerId;

            if (!ownerId || typeof ownerId !== "string") {
                generateHandlerError("Invalid ownerId", 400);
            }

            const chatList = await chatService.ShowList(ownerId);
            res.status(200).json(chatList);
        } catch (error: any) {
            next(error.message);
        }
    }

    async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id || typeof id !== "string") {
                generateHandlerError("Invalid chatId", 400);
            }

            const messages = await chatService.ShowMessages(id);
            res.status(200).json(messages);
        } catch (error: any) {
            next(error.message);
        }
    }

    async function addMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { chatId, content, role }: IMessageRBody = req.body;

            if (!chatId || typeof chatId !== "string" || !content || typeof content !== "string" || content.length < 5 || !role || !["system", "assistant", "user"].includes(role)) {
                generateHandlerError("Invalid chatId, content, or role", 400);
            }
            
            if (req.body?.image_url) {
                await chatService.AddVMessage(chatId, content, role as RoleType, req.body.image_url);
                
            } else {
                await chatService.AddMessage(chatId, content, role as RoleType);
            }
          
            res.sendStatus(201);
        } catch (error: any) {
            next(error.message);
        }
    }

    return {
        createChat,
        deleteChat,
        getChat,
        listChats,
        getMessages,
        addMessage,
    };
}

export default getChatController;
