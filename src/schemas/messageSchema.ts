import {z} from 'zod'

export const messageSchema = z.object({
    content: z
    .string()
    .min(10, {message: 'Content must be atleast 10 characters'})
    .max(400, {message: 'Content must be no more than 400 characters'})
})