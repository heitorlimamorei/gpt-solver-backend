import express from "express";

import getRepo from "../repositories/subscription.repository";
import getSvc from "../services/subscription.service";
import getHandler from "../controllers/subscription.controller";

const repo = getRepo();
const service = getSvc(repo);
const handler = getHandler(service);

const subscriptionRouter = express.Router();

subscriptionRouter.post("/", handler.Create);
subscriptionRouter.delete("/:id", handler.Delete);
subscriptionRouter.get("/", handler.Show);
subscriptionRouter.get("/plans", handler.Plans);

export default subscriptionRouter;