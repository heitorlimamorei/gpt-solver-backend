import express from "express";
import getUserRepository from "../repositories/user.repository";
import getUserService from "../services/user.service";
import getUserController from "../controllers/user.controller";
import getChatRepository from "../repositories/chat.repository";
import getChatService from "../services/chat.service";
import getSubscriptionRepository from "../repositories/subscription.repository";
import getSubscriptionService from "../services/subscription.service";


const repository = getUserRepository();
const service = getUserService(repository);
const chatRepo = getChatRepository();
const chatSvc = getChatService(chatRepo, service);
const subscriptionRepo = getSubscriptionRepository();
const subscriptionSvc = getSubscriptionService(subscriptionRepo);

const controller = getUserController(service, chatSvc, subscriptionSvc);

const router = express.Router();

router.post("/", controller.Create);
router.post("/cmdsuser", controller.CreateCmdsUser);
router.get("/", controller.Show);
router.get("/tokenscount/:id", controller.GetTokensCount);
router.put("/", controller.Update);
router.post("/:id/charge", controller.Charge)
router.delete("/:id", controller.Delete);

export default router;