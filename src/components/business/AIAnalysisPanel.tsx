"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudLightning, AlertTriangle, TrendingUp, ShieldCheck, Loader2, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Transaction } from "@/lib/business-logic";

interface AIAnalysisPanelProps {
    transactions: Transaction[];
    profile: any;
    metrics: {
        income: number;
        expense: number;
        taxToPay: number;
        profit: number;
        taxLoad: number;
    };
}

interface AnalysisResult {
    health: "good" | "warning" | "critical";
    summary: string;
    risks: { title: string; description: string }[];
    recommendations: { title: string; description: string; saving?: string }[];
    taxOptimization: string;
    error?: string;
}

const healthConfig = {
    good: { label: "Всё хорошо", color: "text-emerald-500", bg: "bg-emerald-500", icon: ShieldCheck },
    warning: { label: "Есть риски", color: "text-amber-500", bg: "bg-amber-500", icon: AlertTriangle },
    critical: { label: "Требует внимания", color: "text-red-500", bg: "bg-red-500", icon: AlertTriangle },
};

export function AIAnalysisPanel({ transactions, profile, metrics }: AIAnalysisPanelProps) {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [hasRun, setHasRun] = useState(false);

    const safeLimit = 6.0;
    const defaultHint = metrics.taxLoad > safeLimit
        ? `Налоговая нагрузка ${metrics.taxLoad}% превышает безопасный порог. Рекомендую проверить расходы.`
        : "Ваши показатели в норме. Вы можете уменьшить налог на сумму фиксированных взносов.";

    const handleAnalyze = async () => {
        setIsLoading(true);
        setHasRun(true);
        setIsExpanded(true);
        try {
            const res = await fetch("/api/business/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions, profile, metrics }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({
                health: "warning",
                summary: "Не удалось получить анализ. Проверьте подключение к AI-сервису.",
                risks: [],
                recommendations: [],
                taxOptimization: "",
                error: "connection",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const health = result ? healthConfig[result.health] ?? healthConfig.good : null;

    return (
        <div className="group relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white overflow-hidden shadow-xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <CloudLightning className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">AI-Ассистент</h3>
                    </div>
                    {hasRun && result && (
                        <button
                            onClick={() => setIsExpanded(v => !v)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {/* Default hint or loading */}
                {!hasRun && (
                    <p className="text-indigo-100 text-sm leading-relaxed mb-6">{defaultHint}</p>
                )}

                {isLoading && (
                    <div className="flex items-center gap-3 mb-6 py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                        <p className="text-indigo-100 text-sm">Анализирую ваши данные...</p>
                    </div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {result && !isLoading && isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 space-y-4 overflow-hidden"
                        >
                            {/* Health Badge + Summary */}
                            {health && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <health.icon className={`w-4 h-4 ${health.color}`} />
                                        <span className={`text-xs font-bold uppercase tracking-wider ${health.color}`}>
                                            {health.label}
                                        </span>
                                    </div>
                                    <p className="text-white/90 text-sm leading-relaxed">{result.summary}</p>
                                </div>
                            )}

                            {/* Risks */}
                            {result.risks && result.risks.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Риски
                                    </p>
                                    {result.risks.map((risk, i) => (
                                        <div key={i} className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                                            <p className="text-sm font-semibold text-white mb-0.5">{risk.title}</p>
                                            <p className="text-xs text-white/75">{risk.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recommendations */}
                            {result.recommendations && result.recommendations.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5" /> Рекомендации
                                    </p>
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-white">{rec.title}</p>
                                                {rec.saving && (
                                                    <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {rec.saving}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-white/75 mt-0.5">{rec.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tax Optimization */}
                            {result.taxOptimization && (
                                <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3">
                                    <p className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                        <Lightbulb className="w-3.5 h-3.5" /> Оптимизация налогов
                                    </p>
                                    <p className="text-xs text-white/85 leading-relaxed">{result.taxOptimization}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full py-3 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-black/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Анализирую...</>
                    ) : hasRun ? (
                        "Обновить анализ"
                    ) : (
                        "Анализ расходов"
                    )}
                </button>
            </div>
        </div>
    );
}
