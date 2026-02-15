'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function registerUser(prevState: any, formData: FormData) {
    const validatedFields = RegisterSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Register.',
        }
    }

    const { name, email, password } = validatedFields.data

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return {
                message: 'Email already in use.',
            }
        }

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })
    } catch (error) {
        console.error('Registration Error:', error);
        return {
            message: 'Database Error: Failed to Create User.',
        }
    }

    redirect('/login')
}
