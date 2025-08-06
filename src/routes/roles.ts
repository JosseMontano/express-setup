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

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedRole = await prisma.role.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: 'Error updating role' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.role.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting role' });
  }
});

export default router;