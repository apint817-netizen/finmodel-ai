"use client";

import { useState } from "react";
import { BusinessSetupWizard } from "@/components/procurement/BusinessSetupWizard";
import { ProcurementDashboard } from "@/components/procurement/ProcurementDashboard";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { BusinessChecklist } from "@/lib/procurement";

export default function ProcurementPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [checklist, setChecklist] = useState<BusinessChecklist | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSetupComplete = async (data: {
        businessDescription: string;
        city: string;
        budget: number;
    }) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/procurement/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            setChecklist(result as BusinessChecklist);
        } catch {
            setError("Не удалось подключиться к AI. Проверьте настройки.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setChecklist(null);
        setError(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">AI анализирует ваш бизнес...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Составляем чек-лист закупок</p>
                </div>
            </div>
        );
    }

    if (!checklist) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Назад
                    </Link>

                    {error && (
                        <div className="max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <BusinessSetupWizard onComplete={handleSetupComplete} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Бизнес-Закупщик</h1>
                </div>

                <ProcurementDashboard initialChecklist={checklist} onReset={handleReset} />
            </div>
        </div>
    );
}
