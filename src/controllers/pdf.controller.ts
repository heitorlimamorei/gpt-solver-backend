import {Request, Response, NextFunction} from "express";
import { IPdfService } from "../services/pdf.service";

interface IPdfController {
    ExtractText(req: Request, res: Response, next: NextFunction): Promise<void>;
}

const generateHandlerError = (message: string, status: number) => {
    throw new Error(`HANDLER:${message}-${status}`);
};

export default function getPdfController(service: IPdfService): IPdfController {
    async function ExtractText(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const file = req.file;
            
            if (!file) {
                generateHandlerError(`MALFORMED BODY: must have a pdf file`, 400);
                return;
            }

            const text = await service.ExtractText(file);
            res.status(200).json(text);
        } catch (err: any) {
            next(err.message);
        }
    }

    return {
        ExtractText
    }
}
