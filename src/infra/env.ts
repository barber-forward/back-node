import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string().min(32),
  JWT_PUBLIC_KEY: z.string().min(32),
  PORT: z.coerce.number().optional().default(3333),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z
    .string()
    .optional()
    .default('http://localhost:3333/auth/google/callback'),
})

export type Env = z.infer<typeof envSchema>
