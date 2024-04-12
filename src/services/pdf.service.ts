import pdfParse from 'pdf-parse';

export interface IPdfService {
    ExtractText(file: Express.Multer.File): Promise<string>;
}

const generateServiceError = (message: string, status: number) => {
    throw new Error(`SERVICE:${message}-${status}`);
};

export default function getPdfService(): IPdfService {
    async function ExtractText(file: Express.Multer.File) {
        try {
            if (file.mimetype !== "application/pdf") {
                generateServiceError("File type must be a PDF.", 500);
            }

            const data = await pdfParse(file.buffer);
            return data.text;
        } catch (err) {
            generateServiceError("Error when parsing PDF", 500);
            return "";
        }
    }

    return {
        ExtractText
    }
}