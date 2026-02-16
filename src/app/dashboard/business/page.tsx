import { getBusinessSummary } from "@/actions/business";
import { FinancialHealthWidget } from "@/components/business/FinancialHealthWidget";
import { TaxCalendar } from "@/components/business/TaxCalendar";
import { TransactionList } from "@/components/business/TransactionList";
import { CompanySearch } from "@/components/business/CompanySearch";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

// This is a dynamic page that might need project ID from params or query
// For now, assuming we land here and pick a project or use the last active one
// Or we can list projects. 
// Given the prompt "Business Consultant", let's assume it's a specific project view.
// But the path is /dashboard/business. Maybe we show a list of business projects or create one.

export default async function BusinessDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/signin");

    // Find the first "business" project or create one/prompt to create
    const project = await prisma.project.findFirst({
        where: {
            userId: session.user.id,
            type: "business" // Only business projects
        },
        orderBy: { updatedAt: 'desc' }
    });

    if (!project) {
        // If no business project, visualization might need a "Create" state
        // For MVP, we render a placeholder or empty state
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Бизнес-Консультант</h1>
                <p className="mb-4 text-gray-600 dark:text-gray-400">У вас пока нет активных бизнес-проектов.</p>
                {/* Button to create would go here */}
            </div>
        );
    }

    const summary = await getBusinessSummary(project.id);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {project.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Панель управления бизнесом
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Settings button, etc. */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <CompanySearch />
                    <FinancialHealthWidget
                        netProfit={summary.netProfit}
                        totalIncome={summary.totalIncome}
                        totalExpense={summary.totalExpense}
                    />
                </div>
                <div>
                    <TaxCalendar taxLiability={summary.taxLiability} />
                </div>
            </div>

            <div>
                <TransactionList projectId={project.id} transactions={summary.project.transactions} />
            </div>
        </div>
    );
}
