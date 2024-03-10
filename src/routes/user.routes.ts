import express from "express";
import getUserRepository from "../repositories/user.repository";
import getUserService from "../services/user.service";
import getUserController from "../controllers/user.controller";


const repository = getUserRepository();
const service = getUserService(repository);
const controller = getUserController(service);

const router = express.Router();

router.post("/", controller.Create);
router.get("/", controller.Show);
router.get("/tokenscount/:id", controller.GetTokensCount);
router.put("/", controller.Update);
router.delete("/:id", controller.Delete);

export default router;