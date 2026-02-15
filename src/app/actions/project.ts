'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProjects() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const projects = await prisma.project.findMany({
            where: {
                userId: session.user.id,
                status: 'active' // Filter by active by default? Or return all? 
                // Store filters by active/archived. Let's return all for now to let client filter?
                // Or maybe the dashboard only needs active?
                // The dashboard filters client side. Let's return all.
            },
            include: {
                investments: true,
                revenues: true,
                expenses: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })
        return projects
    } catch (error) {
        console.error('Failed to fetch projects:', error)
        return []
    }
}

export async function getProject(id: string) {
    const session = await auth()
    if (!session?.user?.id) return null

    try {
        const project = await prisma.project.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                investments: true,
                revenues: true,
                expenses: true,
            },
        })
        return project
    } catch (error) {
        console.error('Failed to fetch project:', error)
        return null
    }
}

export async function createProject(name: string, template: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    try {
        const project = await prisma.project.create({
            data: {
                userId: session.user.id,
                name,
                currency: 'RUB', // Default
                // template field is missing in schema, we might need to store it in description or add a column
                // For now, let's just store it in description or ignore it if it's just for UI init.
                // Actually, let's update schema to add 'template' and 'status' to match store.ts
            },
            include: {
                investments: true,
                revenues: true,
                expenses: true,
            }
        })
        revalidatePath('/dashboard')
        return project
    } catch (error) {
        console.error('Failed to create project:', error)
        throw new Error('Failed to create project')
    }
}

export async function deleteProject(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    try {
        await prisma.project.delete({
            where: {
                id,
                userId: session.user.id, // Security: Ensure user owns project
            },
        })
        revalidatePath('/dashboard')
    } catch (error) {
        console.error('Failed to delete project:', error)
        throw new Error('Failed to delete project')
    }
}

// We need to update the schema first to add 'status' and 'template' columns
