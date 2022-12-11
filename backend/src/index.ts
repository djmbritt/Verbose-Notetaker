import { PrismaClient } from '@prisma/client';
import express, { Express, Request, Response } from 'express'
import axios, {  } from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'


dotenv.config({
    debug: true
})
const prisma = new PrismaClient()
const app: Express = express()
app.use(express.json())
app.use(cors())
const port = process.env.PORT ?? 8282

app.get('/', (_req: Request, res: Response) => res.send("🔥"))

app.get('/asmtoken', async (_req: Request, res: Response) => {
    const assemblyApiTokenUrl = 'https://api.assemblyai.com/v2/realtime/token'
    try {
        const response = await axios.post(assemblyApiTokenUrl, 
            { expires_in: 3600 }, 
            { headers: { authorization: process.env.ASSEMBLY_KEY} })
        const { data } = response
        res.json(data)
    } catch (error) {
        const { response: { status, data } } = error
        res.status(status).json(data)
    }
})

// Example GET
app.get('/feed', async (_req: Request, res: Response) => {
    const posts = await prisma.recording.findMany({
        where: { published: true },
        include: { author: true }
    })
    res.json(posts)
})

// Example POST
app.post('/recording',async (req: Request, res: Response) => {
    const { content, audio, author } = req.body
    const post = await prisma.recording.create({
        data: {
            title: `New Recording: ${Date.now()}`,
            content,
            author
        }
    })

    // TODO
    const transcript = await transcribe()
    res.json({ post, transcribe })
})

// Transcribe complete audio
// How to pass specific audio?
const transcribe = async () => {

    const assemblyApiTranscriptUrl = 'https://api.assemblyai.com/v2/transcript'
    try {
        const response = await axios.post(assemblyApiTranscriptUrl, {
            headers: {
                authorization: process.env.ASSEMBLY_KEY,
                "content-type": "application/json"
            },
            body: {
                audio_url: "someurl",
                speaker_labels: true
            }
        })
        const { data } = response
        return data
    } catch (error) {
        console.error(error)
        return error
    }
}

// Add summary exmaple;
const summarize = async () => {

// const axios = require("axios");
  
const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: "YOUR-API-TOKEN",
        "content-type": "application/json",
    },
});
assembly
    .post("/transcript", {
        audio_url: "https://bit.ly/3qDXLG8",
        summarization: true,
        summary_model: "informative",
        summary_type: "bullets"
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err));

}

// Example PUT
app.put('/publish/:id', async (req: Request, res: Response) => {

    const { id }: {id?: number} = req.params
    const post = await prisma.recording.update({
        where: { id },
        data: { published: true }
    })
    res.json(post)
})

//Example DELETE
app.delete('/user/:id', async (req: Request, res: Response) => {
    const { id }: { id?: number } = req.params
    const user = await prisma.user.delete({
        where: { id }
    })
    res.json(user)
})

app.listen(port, () => console.log(`⚡️ [Server]: Running at https://localhost:${port}`))