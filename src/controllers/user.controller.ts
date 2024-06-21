import { IUserService } from "../services/user.service"
import {Request, Response, NextFunction} from "express";
import IUser, { INewUser } from "../types/user";
import { IChatService } from "../services/chat.service";
import { ISubscriptionService } from "../services/subscription.service";

export interface IUserController {
  Create(req: Request, res: Response, next: NextFunction): Promise<void>;
  CreateCmdsUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  Show(req: Request, res: Response, next: NextFunction): Promise<void>;
  GetTokensCount(req: Request, res: Response, next: NextFunction): Promise<void>;
  Charge(req: Request, res: Response, next: NextFunction): Promise<void>;
  Update(req: Request, res: Response, next: NextFunction): Promise<void>;
  Delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

interface IShowQuery {
    id?: string;
    email?: string;
    tokenscount?: string;
}

const generateHandlerError = (message: string, status: number) => {
    throw new Error(`HANDLER:${message}-${status}`);
};

export default function getUserController(service: IUserService, chatSvc: IChatService, subscriptionSvc: ISubscriptionService): IUserController {
    async function Create(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const { email, name } = req.body as INewUser;
        if (!email || !name) {
            generateHandlerError(`MALFORMED BODY: ${req.body}`, 400);
        }
        if (name.length < 3) {
            generateHandlerError(`INVALID NAME: ${name}`, 400);
        }
        const userId = await service.Create(email, name);

        await chatSvc.Create(userId, "Olá Mundo!");
        res.status(201).json({
          message: "User created successfully"
        });
      } catch (err: any) {
        next(err.message);
      }
    }
    async function CreateCmdsUser(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const { email, name } = req.body as INewUser;
        if (!email || !name) {
            generateHandlerError(`MALFORMED BODY: ${req.body}`, 400);
        }
        if (name.length < 3) {
            generateHandlerError(`INVALID NAME: ${name}`, 400);
        }
        const userId = await service.Create(email, name);

        await subscriptionSvc.Create(userId, 'fcai-demo')
        await chatSvc.Create(userId, "Olá Mundo!");

        res.status(201).json({
          message: "User created successfully"
        });
      } catch (err: any) {
        next(err.message);
      }
    }
    async function Show(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> {
        try {
            const query = req.query as IShowQuery;
            if (query?.id) {
                const user = await service.Show(query.id);
                res.status(200).json(user);
                return;
            }
            if (query?.email) {
                const user = await service.ShowByEmail(query.email);
                res.status(200).json(user);
                return;
            }
            if (query?.tokenscount && query?.id) {
                const count = await service.ShowTokensCount(query.id);
                res.status(200).json({
                    "tokensCount": count
                });
                return;
            }
            generateHandlerError(`MALFORMED REQUEST must have a query`, 400);

        } catch (err: any) {
          next(err.message);
        }
      }
      async function GetTokensCount(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> {
        try {
            const id = req.params.id as string;
            if (id) {
                const count = await service.ShowTokensCount(id);
                res.status(200).json({
                    "tokensCount": count
                });
                return;
            }
            generateHandlerError(`MALFORMED REQUEST must have a id`, 400);

        } catch (err: any) {
          next(err.message);
        }
      }
      async function Update(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> {
        try {
            const user = req.body as IUser;
            if (
              !user.email ||
              user.name ||
              user.totalTokens == undefined ||
              !user.plan ||
              user.chats == undefined
            ) {
              generateHandlerError(`MALFORMED BODY: ${req.body}`, 400);
            }
            await service.Update(user);
            res.status(201).json({
              message: "User updated successfully"
            });
          } catch (err: any) {
            next(err.message);
          }
      }
      async function Delete(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                generateHandlerError(`MALFORMED REQUEST must have an id`, 400);
            }
            await service.Delete(id);
            res.status(201).json({
              message: "User deleted successfully"
            });
          } catch (err: any) {
            next(err.message);
          }
      }
      async function Charge(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const { count } = req.body;
            if (!id) {
                generateHandlerError(`MALFORMED REQUEST must have an id`, 400);
            }
            await service.RemoveTokens(id, count);
            res.status(201).json({
              message: "User charged successfully"
            });
          } catch (err: any) {
            next(err.message);
          }
      }
    return {
        Create,
        CreateCmdsUser,
        Show,
        GetTokensCount,
        Update,
        Delete,
        Charge,
    }
}