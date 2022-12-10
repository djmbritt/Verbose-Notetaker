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
app.get('/post',async (req: Request, res: Response) => {
    const { title, content, authorEmail } = req.body
    const post = await prisma.recording.create({
        data: {
            title,
            content,
            published: false,
            author: { connect: { email: authorEmail } }
        }
    })
    res.json(post)
})

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