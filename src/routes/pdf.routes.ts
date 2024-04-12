import express from 'express';
import multer from "multer";
import getPdfService from '../services/pdf.service';
import getPdfController from '../controllers/pdf.controller';

const pdfRouter = express.Router();
const pdfSvc = getPdfService();
const pdfController = getPdfController(pdfSvc);

const upload = multer({storage: multer.memoryStorage(), limits: {
    fileSize: 50 * 1024 * 1024
}});

pdfRouter.post("/text-extractor", upload.single("file"), pdfController.ExtractText);

export default pdfRouter;