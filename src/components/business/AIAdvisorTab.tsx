"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudLightning, Send, Loader2, AlertTriangle, ShieldCheck, TrendingUp, Lightbulb, RefreshCw, ChevronDown } from "lucide-react";
import { Transaction } from "@/lib/business-logic";
import { formatCurrency } from "@/lib/calculations";

interface AIAdvisorTabProps {
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

interface Message {
    role: "user" | "assistant";
    content: string;
    type?: "analysis" | "chat";
}

interface AnalysisResult {
    health: "good" | "warning" | "critical";
    summary: string;
    risks: { title: string; description: string }[];
    recommendations: { title: string; description: string; saving?: string }[];
    taxOptimization: string;
}

const healthConfig = {
    good: { label: "Всё хорошо", color: "text-emerald-400", icon: ShieldCheck, dot: "bg-emerald-400" },
    warning: { label: "Есть риски", color: "text-amber-400", icon: AlertTriangle, dot: "bg-amber-400" },
    critical: { label: "Требует внимания", color: "text-red-400", icon: AlertTriangle, dot: "bg-red-400" },
};

// Local rule-based proactive insights (no API needed)
function getLocalInsights(metrics: AIAdvisorTabProps["metrics"], transactions: Transaction[]): string[] {
    const insights: string[] = [];
    if (metrics.taxLoad > 6) {
        insights.push(`⚠️ Налоговая нагрузка ${metrics.taxLoad}% превышает безопасный порог 6%. Проверьте, все ли расходы учтены.`);
    }
    if (metrics.income > 0 && metrics.expense / metrics.income > 0.8) {
        insights.push(`📉 Расходы составляют ${Math.round(metrics.expense / metrics.income * 100)}% от доходов — маржа очень низкая.`);
    }
    const bigExpenses = transactions.filter(t => t.type === "expense" && t.amount > metrics.income * 0.2);
    if (bigExpenses.length > 0) {
        insights.push(`💡 Крупный расход: «${bigExpenses[0].description || bigExpenses[0].category}» (${formatCurrency(bigExpenses[0].amount)}) — более 20% от оборота.`);
    }
    if (metrics.income > 2_400_000) {
        insights.push(`🚨 Доход приближается к лимиту УСН (2.4 млн ₽). Рассмотрите переход на другой режим.`);
    }
    if (metrics.profit < 0) {
        insights.push(`🔴 Убыток за период: ${formatCurrency(Math.abs(metrics.profit))}. Необходим срочный анализ расходов.`);
    }
    if (insights.length === 0 && metrics.income > 0) {
        insights.push(`✅ Показатели в норме. Налоговая нагрузка ${metrics.taxLoad}% — в пределах безопасного диапазона.`);
    }
    return insights;
}

export function AIAdvisorTab({ transactions, profile, metrics }: AIAdvisorTabProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const localInsights = getLocalInsights(metrics, transactions);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setShowAnalysis(true);
        try {
            const res = await fetch("/api/business/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions, profile, metrics }),
            });
            const data = await res.json();
            setAnalysis(data);
        } catch {
            setAnalysis({
                health: "warning",
                summary: "Не удалось получить анализ. Проверьте подключение к AI-сервису.",
                risks: [],
                recommendations: [],
                taxOptimization: "",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const context = `Данные бизнеса: доход ${formatCurrency(metrics.income)}, расход ${formatCurrency(metrics.expense)}, налог ${formatCurrency(metrics.taxToPay)}, нагрузка ${metrics.taxLoad}%, режим: ${profile?.taxSystems?.join(", ") || profile?.taxSystem || "УСН 6%"}.`;
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: `Ты финансовый консультант для малого бизнеса в России. Контекст: ${context} Отвечай кратко, по делу, на русском.` },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: userMsg },
                    ],
                }),
            });
            const data = await res.json();
            const reply = data.message || data.content || "Не удалось получить ответ.";
            setMessages(prev => [...prev, { role: "assistant", content: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "Ошибка соединения с AI-сервисом." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const health = analysis ? (healthConfig[analysis.health] ?? healthConfig.good) : null;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-full">
            {/* Left: Analysis Panel */}
            <div className="xl:col-span-2 space-y-4">
                {/* Proactive Insights */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Быстрые инсайты
                    </h3>
                    <div className="space-y-2">
                        {localInsights.map((insight, i) => (
                            <p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{insight}</p>
                        ))}
                    </div>
                </div>

                {/* AI Deep Analysis */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-xl shadow-indigo-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <CloudLightning className="w-4 h-4" />
                            </div>
                            <span className="font-bold">Глубокий анализ</span>
                        </div>
                        {analysis && (
                            <button onClick={() => setShowAnalysis(v => !v)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronDown className={`w-4 h-4 transition-transform ${showAnalysis ? "rotate-180" : ""}`} />
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {analysis && showAnalysis && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 space-y-3 overflow-hidden"
                            >
                                {health && (
                                    <div className="bg-white/10 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-2 h-2 rounded-full ${health.dot}`} />
                                            <span className={`text-xs font-bold uppercase tracking-wider ${health.color}`}>{health.label}</span>
                                        </div>
                                        <p className="text-white/90 text-sm">{analysis.summary}</p>
                                    </div>
                                )}
                                {analysis.risks?.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Риски</p>
                                        {analysis.risks.map((r, i) => (
                                            <div key={i} className="bg-red-500/20 border border-red-400/30 rounded-lg p-2.5">
                                                <p className="text-sm font-semibold">{r.title}</p>
                                                <p className="text-xs text-white/75 mt-0.5">{r.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {analysis.recommendations?.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Рекомендации</p>
                                        {analysis.recommendations.map((r, i) => (
                                            <div key={i} className="bg-white/10 border border-white/20 rounded-lg p-2.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-semibold">{r.title}</p>
                                                    {r.saving && <span className="text-xs bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">{r.saving}</span>}
                                                </div>
                                                <p className="text-xs text-white/75 mt-0.5">{r.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {analysis.taxOptimization && (
                                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-2.5">
                                        <p className="text-xs font-bold text-amber-200 mb-1">💡 Оптимизация налогов</p>
                                        <p className="text-xs text-white/85">{analysis.taxOptimization}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Анализирую...</>
                        ) : analysis ? (
                            <><RefreshCw className="w-4 h-4" /> Обновить анализ</>
                        ) : (
                            "Запустить анализ"
                        )}
                    </button>
                </div>
            </div>

            {/* Right: Chat */}
            <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col" style={{ minHeight: 500 }}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                        <CloudLightning className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">AI-Консультант</p>
                        <p className="text-xs text-slate-400">Задайте любой вопрос о вашем бизнесе</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4">
                                <CloudLightning className="w-8 h-8 text-indigo-500" />
                            </div>
                            <p className="text-slate-500 text-sm max-w-xs">Задайте вопрос о налогах, расходах или стратегии вашего бизнеса</p>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                {["Как снизить налог?", "Анализ расходов", "Что такое ЕНС?"].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => setInput(q)}
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-indigo-600 text-white rounded-br-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                                }`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                            placeholder="Задайте вопрос..."
                            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
