import express from 'express';
import { PrismaClient } from "./generated/prisma";

const app = express();
app.use(express.json());

const PORT=3000;

app.get('/', (_, res) => {
  res.send('Hi');
});

const prisma = new PrismaClient();

app.post('/users', async(req, res) => {
    const { ci } = req.body;

    const newUser = await prisma.user.create({
      data: { ci },
    });

    return res.status(201).send(newUser);
  });

app.get('/users', async(_, res) => {
    const users = await prisma.user.findMany();
    return res.send(users);
  });


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});