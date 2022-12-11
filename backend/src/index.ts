import express, { Express, Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

const multer = require("multer");

dotenv.config({
  debug: true,
});
const app: Express = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT ?? 8282;

app.get("/", (_req: Request, res: Response) => res.send("🔥"));

app.get("/asmtoken", async (_req: Request, res: Response) => {
  const assemblyApiTokenUrl = "https://api.assemblyai.com/v2/realtime/token";
  try {
    const response = await axios.post(
      assemblyApiTokenUrl,
      { expires_in: 3600 },
      { headers: { authorization: process.env.ASSEMBLY_KEY } }
    );
    const { data } = response;
    res.json(data);
  } catch (error) {
    const {
      response: { status, data },
    } = error;
    res.status(status).json(data);
  }
});

app.post(
  "/summarize",
  multer().single("file"),
  async (req: any, res: Response) => {
    const assembly = axios.create({
      baseURL: "https://api.assemblyai.com/v2",
      headers: {
        authorization: process.env.ASSEMBLY_KEY,
        "content-type": "application/json",
        "transfer-encoding": "chunked",
      },
    });
    const { upload_url } = (await assembly.post("/upload", req.file.buffer))
      .data;
    let { data } = await assembly.post("/transcript", {
      audio_url: upload_url,
      summarization: true,
      summary_model: "conversational",
      summary_type: "bullets",
      speaker_labels: true,
    });
    while (["queued", "processing"].includes(data.status)) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      data = (await assembly.get(`/transcript/${data.id}`)).data;
    }
    res.json({
      text: data.text,
    });
  }
);

app.listen(port, () =>
  console.log(`⚡️ [Server]: Running at https://localhost:${port}`)
);
