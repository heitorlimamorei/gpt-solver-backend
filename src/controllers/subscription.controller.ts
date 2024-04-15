import {Request, Response, NextFunction} from "express";
import { ISubscriptionService } from "../services/subscription.service";

export interface ISubscriptionController {
    Create(req: Request, res: Response, next: NextFunction): Promise<void>;
    Show(req: Request, res: Response, next: NextFunction): Promise<void>;
    Delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    Plans(req: Request, res: Response, next: NextFunction): Promise<void>;
}

const generateHandlerError = (message: string, status: number) => {
    throw new Error(`HANDLER:${message}-${status}`);
};

export default function getSubscriptionController(service: ISubscriptionService): ISubscriptionController {
    async function Create(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { ownerId, type } = req.body;
            if (!ownerId || !type) {
                generateHandlerError(`MALFORMED BODY: ${req.body}`, 400);
            }
            const id = await service.Create(ownerId, type);
            res.status(201).json({ id });
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
            const query = req.query;

            if (query?.owid) {
                const subscriptions = await service.ShowByOwnerId(query.owid as string);
                res.status(200).json(subscriptions);
                return;
            } else if (query?.id) {
                const subscriptions = await service.Show(query.id as string);
                res.status(200).json(subscriptions);
                return;
            }

            res.status(400).send({error: "Malformed request (must have an id or owid)"});

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
                message: "Subscription deleted successfully"
            });
        } catch (err: any) {
            next(err.message);
        }
    }

    async function Plans(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const plans = await service.Plans();
            res.status(200).json(plans);
        } catch (err: any) {
            next(err.message);
        }
    }

    return {
        Create,
        Show,
        Delete,
        Plans
    }
}
