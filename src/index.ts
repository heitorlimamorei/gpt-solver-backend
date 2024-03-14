import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from 'dotenv';
import userRouter from "./routes/user.routes";
import chatRouter from "./routes/chat.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json())
app.use("/v1/user", userRouter);
app.use("/v1/chat", chatRouter);

app.use((err:Error, req: Request, res: Response) => {
    if (err.message) {
        const erro = err.message.split("-");
        const status = parseInt(erro[1]);
        const message = erro[0];
        console.error(err.stack);
        res.status(status).json({
            message: message
        });
    }
})
app.listen(process.env.PORT, () => console.log('listening on port ' + process.env.PORT));