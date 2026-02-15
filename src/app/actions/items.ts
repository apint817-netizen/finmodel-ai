'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Helper to check ownership
async function checkProjectOwnership(projectId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true }
    })

    if (!project || project.userId !== session.user.id) {
        throw new Error("Forbidden or Project not found")
    }

    return session.user.id
}

// --- Investments ---

export async function addInvestment(projectId: string, data: { category: string, amount: number }) {
    await checkProjectOwnership(projectId)

    try {
        const item = await prisma.investment.create({
            data: {
                projectId,
                category: data.category,
                amount: data.amount
            }
        })
        revalidatePath(`/editor/${projectId}`)
        return item
    } catch (error) {
        console.error("Failed to add investment", error)
        throw new Error("Failed to add investment")
    }
}

export async function updateInvestment(id: string, projectId: string, data: Partial<{ category: string, amount: number }>) {
    await checkProjectOwnership(projectId)

    try {
        const item = await prisma.investment.update({
            where: { id },
            data
        })
        revalidatePath(`/editor/${projectId}`)
        return item
    } catch (error) {
        console.error("Failed to update investment", error)
        throw new Error("Failed to update investment")
    }
}

export async function deleteInvestment(id: string, projectId: string) {
    await checkProjectOwnership(projectId)

    try {
        await prisma.investment.delete({
            where: { id }
        })
        revalidatePath(`/editor/${projectId}`)
    } catch (error) {
        console.error("Failed to delete investment", error)
        throw new Error("Failed to delete investment")
    }
}

// --- Revenues ---

export async function addRevenue(projectId: string, data: { name: string, monthlyAmount: number, growthRate?: number, type?: string }) {
    await checkProjectOwnership(projectId)

    try {
        const item = await prisma.revenue.create({
            data: {
                projectId,
                name: data.name,
                monthlyAmount: data.monthlyAmount,
                growthRate: data.growthRate || 0,
                type: data.type || "recurring"
            }
        })
        revalidatePath(`/editor/${projectId}`)
        return item
    } catch (error) {
        console.error("Failed to add revenue", error)
        throw new Error("Failed to add revenue")
    }
}

export async function updateRevenue(id: string, projectId: string, data: Partial<{ name: string, monthlyAmount: number, growthRate?: number, type?: string }>) {
    await checkProjectOwnership(projectId)

    try {
        const item = await prisma.revenue.update({
            where: { id },
            data
        })
        revalidatePath(`/editor/${projectId}`)
        return item
    } catch (error) {
        console.error("Failed to update revenue", error)
        throw new Error("Failed to update revenue")
    }
}

export async function deleteRevenue(id: string, projectId: string) {
    await checkProjectOwnership(projectId)

    try {
        await prisma.revenue.delete({
            where: { id }
        })
        revalidatePath(`/editor/${projectId}`)
    } catch (error) {
        console.error("Failed to delete revenue", error)
        throw new Error("Failed to delete revenue")
    }
}

// --- Expenses ---

export async function addExpense(projectId: string, data: { name: string, monthlyAmount: number, growthRate?: number, type?: string }) {
    await checkProjectOwnership(projectId)

    try {
        const item = await prisma.expense.create({
            data: {
                projectId,
                name: data.name,
                monthlyAmount: data.monthlyAmount,
                growthRate: data.growthRate || 0,
                type: data.type || "fixed"
            }
        })
        revalidatePath(`/editor/${projectId}`)
        return item
    } catch (error) {
        console.error("Failed to add expense", error)
        throw new Error("Failed to add expense")
    }
}

export async function updateExpense(id: string, projectId: string, data: Partial<{ name: string, monthlyAmount: number, growthRate?: number, type?: string }>) {
    await checkProjectOwnership(projectId)

    try {
        const item = await prisma.expense.update({
            where: { id },
            data
        })
        revalidatePath(`/editor/${projectId}`)
        return item
    } catch (error) {
        console.error("Failed to update expense", error)
        throw new Error("Failed to update expense")
    }
}

export async function deleteExpense(id: string, projectId: string) {
    await checkProjectOwnership(projectId)

    try {
        await prisma.expense.delete({
            where: { id }
        })
        revalidatePath(`/editor/${projectId}`)
    } catch (error) {
        console.error("Failed to delete expense", error)
        throw new Error("Failed to delete expense")
    }
}

// --- Bulk Create (For AI) ---

export async function bulkCreateItems(projectId: string, data: {
    investments?: { category: string, amount: number }[],
    revenues?: { name: string, monthlyAmount: number }[],
    expenses?: { name: string, monthlyAmount: number }[],
    aiChatMessage?: string
}) {
    await checkProjectOwnership(projectId)

    try {
        // Use transaction for atomicity? Or sequential await is fine for now.
        // Prisma transaction is better.
        await prisma.$transaction(async (tx) => {
            if (data.investments?.length) {
                await tx.investment.createMany({
                    data: data.investments.map(i => ({ projectId, ...i }))
                })
            }
            if (data.revenues?.length) {
                await tx.revenue.createMany({
                    data: data.revenues.map(r => ({ projectId, ...r, growthRate: 0, type: "recurring" }))
                })
            }
            if (data.expenses?.length) {
                await tx.expense.createMany({
                    data: data.expenses.map(e => ({ projectId, ...e, growthRate: 0, type: "fixed" }))
                })
            }
            if (data.aiChatMessage) {
                // Fetch current history first? 
                // Or just set it if it's new?
                // The AI generation creates a NEW project, so history is empty.
                await tx.project.update({
                    where: { id: projectId },
                    data: { aiChatHistory: [{ role: 'assistant', content: data.aiChatMessage }] }
                })
            }
        })
        revalidatePath(`/editor/${projectId}`)
    } catch (error) {
        console.error("Failed to bulk create items", error)
        throw new Error("Failed to bulk create items")
    }
}
