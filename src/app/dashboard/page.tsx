import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserButton } from "@/components/UserButton";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

export default async function DashboardPage() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">FinModel AI</h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Инструменты для вашего бизнеса
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {session?.user?.name ? `${session.user.name}, выберите` : "Выберите"} необходимый инструмент для работы с финансами и стратегией компании
                    </p>
                </div>

                <ToolsGrid />
            </main>
        </div>
    );
}
