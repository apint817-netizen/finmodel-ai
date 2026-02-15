'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const serializeProject = (project: any) => ({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    aiChatHistory: (project.aiChatHistory as any) || [],
    status: project.status as 'active' | 'archived',
})

export async function getProjects() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const projects = await prisma.project.findMany({
            where: {
                userId: session.user.id,
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
        return projects.map(serializeProject)
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
        return project ? serializeProject(project) : null
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
                currency: 'RUB',
                template, // Included in schema now
                status: 'active'
            },
            include: {
                investments: true,
                revenues: true,
                expenses: true,
            }
        })
        revalidatePath('/dashboard')
        return serializeProject(project)
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
                userId: session.user.id,
            },
        })
        revalidatePath('/dashboard')
    } catch (error) {
        console.error('Failed to delete project:', error)
        throw new Error('Failed to delete project')
    }
}

// We need to update the schema first to add 'status' and 'template' columns
