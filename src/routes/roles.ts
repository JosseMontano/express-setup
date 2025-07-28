import { Router } from 'express';
import { PrismaClient } from "../generated/prisma";

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    const role = await prisma.role.create({ data: { name } })
    res.json(role)
  } catch (error) {
    res.status(500).json({ error: 'Error creating role' })
  }
})

router.get('/', async (_, res) => {
  const roles = await prisma.role.findMany()
  res.json(roles)
})

export default router;