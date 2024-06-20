import express from "express";
import getChatRepository from "../repositories/chat.repository";
import getChatController from "../controllers/chat.controller";
import getChatService from "../services/chat.service";
import getUserService from "../services/user.service";
import getUserRepository from "../repositories/user.repository";

const repo = getChatRepository();
const userRepo = getUserRepository();

const userService = getUserService(userRepo);
const service = getChatService(repo, userService);

const controller = getChatController(service);

const chatRouter = express.Router();

chatRouter.post("/", controller.createChat);
chatRouter.post("/chatpdf", controller.createChatPDF);
chatRouter.post("/fiancial-assistant", controller.createFiancialAssitant)
chatRouter.delete("/:id", controller.deleteChat);
chatRouter.get("/:id", controller.getChat);
chatRouter.get("/list/:ownerId", controller.listChats);
chatRouter.get("/:id/messages", controller.getMessages);
chatRouter.post("/:id/messages", controller.addMessage);

export default chatRouter;