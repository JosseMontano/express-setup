import express from 'express';
import { PrismaClient } from "./generated/prisma";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/', (_, res) => {
  res.send('Hi');
});

const prisma = new PrismaClient();

app.post('/users', async (req, res) => {
  const { ci } = req.body;

  const newUser = await prisma.user.create({
    data: { ci },
  });

  return res.status(201).send(newUser);
});

app.get('/users', async (_, res) => {
  const users = await prisma.user.findMany();
  return res.send(users);
});

app.post('/users/:userId/posts', async (req, res) => {
  try {
    const { userId } = req.params
    const { title, content } = req.body
    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId: Number(userId)
      }
    })
    res.json(post)
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  }
})

app.get('/posts', async (_, res) => {
  const posts = await prisma.post.findMany({
    include: { user: true }
  })
  res.json(posts)
})

app.put('/posts/:id', async (req, res) => {
  const { id } = req.params
  const { title, content } = req.body
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { title, content }
  })
  res.json(post)
})

app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params
  await prisma.post.delete({
    where: { id: Number(id) }
  })
  res.json({ message: 'Post deleted' })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});