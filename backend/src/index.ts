import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express()
const port = process.env.PORT ?? 8282

app.get('/', (req: Request, res: Response) => res.send("🔥"))

app.listen(port, () => console.log(`⚡️ [Server]: Running at https://localhost:${port}`))