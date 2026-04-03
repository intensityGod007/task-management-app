import { Response } from 'express';
import { z } from 'zod';
import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

const updateTaskSchema = createTaskSchema.partial();

export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    // Filtering & searching
    const status = req.query.status as TaskStatus | undefined;
    const priority = req.query.priority as Priority | undefined;
    const search = req.query.search as string | undefined;

    const where: {
      userId: string;
      status?: TaskStatus;
      priority?: Priority;
      title?: { contains: string; mode: 'insensitive' };
    } = { userId };

    if (status && Object.values(TaskStatus).includes(status)) {
      where.status = status;
    }

    if (priority && Object.values(Priority).includes(priority)) {
      where.priority = priority;
    }

    if (search && search.trim()) {
      where.title = { contains: search.trim(), mode: 'insensitive' };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const task = await prisma.task.findFirst({ where: { id, userId } });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const result = createTaskSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation error', errors: result.error.flatten().fieldErrors });
      return;
    }

    const { title, description, status, priority, dueDate } = result.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status ?? TaskStatus.PENDING,
        priority: priority ?? Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const result = updateTaskSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation error', errors: result.error.flatten().fieldErrors });
      return;
    }

    const { title, description, status, priority, dueDate } = result.data;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const newStatus =
      existing.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

    const task = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });

    res.json(task);
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
