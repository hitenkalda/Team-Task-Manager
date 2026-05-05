const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1).trim(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional()
});

module.exports = { createTaskSchema, updateTaskSchema };
