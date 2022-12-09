import { PrismaClient } from '@prisma/client';
import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'


dotenv.config()
const prisma = new PrismaClient()
const app: Express = express()
const port = process.env.PORT ?? 8282

app.get('/', (_req: Request, res: Response) => res.send("🔥"))

// Example GET
app.get('/feed', async (_req: Request, res: Response) => {
    const posts = await prisma.post.findMany({
        where: { published: true },
        include: { author: true }
    })
    res.json(posts)
})

// Example POST
app.get('/post',async (req: Request, res: Response) => {
    const { title, content, authorEmail } = req.body
    const post = await prisma.post.create({
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
    const { id } = req.params
    const post = await prisma.post.update({
        where: { id },
        data: { published: true }
    })
    res.json(post)
})


//Example DELETE
app.delete('/user/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const user = await prisma.user.delete({
        where: { id }
    })
    res.json(user)
})

app.listen(port, () => console.log(`⚡️ [Server]: Running at https://localhost:${port}`))