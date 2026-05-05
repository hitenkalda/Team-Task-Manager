const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).trim(),
  email: z.string().email().lowercase(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email().lowercase(),
  password: z.string()
});

module.exports = { registerSchema, loginSchema };
