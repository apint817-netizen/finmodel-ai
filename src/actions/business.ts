"use server";

import { auth } from "@/auth"; // Assuming auth is configured
import prisma from "@/lib/prisma"; // Assuming prisma client instance
import { revalidatePath } from "next/cache";
import { calculateTaxLiability, TaxSystem } from "@/lib/tax-engine";

export async function addTransaction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const projectId = formData.get("projectId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const date = new Date(formData.get("date") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string; // "income" | "expense"
    const status = formData.get("status") as string;

    // Verify project ownership
    const project = await prisma.project.findUnique({
        where: { id: projectId, userId: session.user.id },
    });

    if (!project) throw new Error("Project not found");

    await prisma.transaction.create({
        data: {
            projectId,
            amount,
            date,
            category,
            description,
            type,
            status,
        },
    });

    revalidatePath(`/dashboard/business/${projectId}`);
    return { success: true };
}

export async function getBusinessSummary(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const project = await prisma.project.findUnique({
        where: { id: projectId, userId: session.user.id },
        include: {
            transactions: true,
        }
    });

    if (!project) throw new Error("Project not found");

    const now = new Date();
    const currentYear = now.getFullYear();
    // Simple logic: Calculate for current year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const taxResult = calculateTaxLiability(
        project.transactions,
        project.taxSystem as TaxSystem,
        startOfYear,
        endOfYear
    );

    const totalIncome = project.transactions
        .filter(t => t.type === "income" && t.status === "paid")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = project.transactions
        .filter(t => t.type === "expense" && t.status === "paid")
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        project,
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        taxLiability: taxResult,
    };
}

export async function createBusinessProject() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const project = await prisma.project.create({
        data: {
            userId: session.user.id,
            name: "Мой Бизнес",
            type: "business",
            taxSystem: "usn_6",
            status: "active",
            currency: "RUB",
        }
    });

    return project;
}
