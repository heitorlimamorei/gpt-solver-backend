import express from "express";
import getChatRepository from "../repositories/chat.repository";
import getChatController from "../controllers/chat.controller";
import getChatService from "../services/chat.service";

const repo = getChatRepository();
const service = getChatService(repo);
const controller = getChatController(service);

const chatRouter = express.Router();

chatRouter.post("/", controller.createChat);
chatRouter.delete("/:id", controller.deleteChat);
chatRouter.get("/:id", controller.getChat);
chatRouter.get("/list/:ownerId", controller.listChats);
chatRouter.get("/:id/messages", controller.getMessages);
chatRouter.post("/:id/messages", controller.addMessage);

export default chatRouter;