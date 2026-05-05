const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(1).trim(),
  description: z.string().optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().optional()
});

const addMemberSchema = z.object({
  email: z.string().email().lowercase(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
