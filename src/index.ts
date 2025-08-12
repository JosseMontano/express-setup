import express, { Router } from 'express';
import { Prisma, PrismaClient } from "./generated/prisma";
import rolesRoutes from './routes/roles';
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
    cors({
      credentials: true,
      origin: [ "exp://192.168.1.8:19000", "http://localhost:8081/"],
    })
  );

const PORT = 3000;

const router = Router();
router.use('/roles', rolesRoutes);
app.use(router);

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
  const users = await prisma.user.findMany({
    include: {
      roles: true,
    }
  });
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


// User Role Assignment
app.post('/users/:userId/roles', async (req, res) => {
  try {
    const { userId } = req.params
    const { roleId } = req.body

    // Convert string array to number array
    const roleIds = Array.isArray(roleId)
      ? roleId.map(id => Number(id))
      : [Number(roleId)];

    // Validate all role IDs are numbers
    if (roleIds.some(isNaN)) {
      return res.status(400).json({ error: 'Invalid role ID format' });
    }

    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        roles: {
          connect: roleIds.map(id => ({ id }))
        }
      },
      include: { roles: true }
    });


    res.json(user)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          return res.status(404).json({ error: 'User or Role not found' })
        case 'P2016':
          return res.status(400).json({ error: 'Invalid data format' })
        default:
          console.error('Prisma error:', error)
          return res.status(500).json({ error: 'Database error' })
      }
    } else if (error instanceof Error) {
      // Handle other Error instances
      console.error('Unexpected error:', error)
      return res.status(500).json({ error: error.message })
    }
    // Handle completely unknown errors
    console.error('Unknown error:', error)
    res.status(500).json({ error: 'An unknown error occurred' })
  }
})

app.delete('/users/:userId/roles/:roleId', async (req, res) => {
  try {
    const { userId, roleId } = req.params

    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: { roles: { disconnect: { id: Number(roleId) } } },
      include: { roles: true }
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error removing role' })
  }
})

// Get user roles
app.get('/users/:userId/roles', async (req, res) => {
  const { userId } = req.params
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: { roles: true }
  })

  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user.roles)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});