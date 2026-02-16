"use client";

import { useState } from "react";
// import { fetchCompanyByInn, CompanySuggestion } from "@/lib/external-api";
import { checkCompanyByInn } from "@/actions/external";
import { Search, Loader2, Info } from "lucide-react";

interface CompanyData {
    inn: string;
    kpp: string;
    state: { status: "ACTIVE" | "LIQUIDATING" | "LIQUIDATED" | "BANKRUPT" | "REORGANIZING" };
    address: { value: string };
    management?: { name: string; post: string };
}

interface CompanySuggestion {
    value: string;
    data: CompanyData;
}

export function CompanySearch() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CompanySuggestion | null>(null);
    const [error, setError] = useState("");

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await checkCompanyByInn(query);

            if (!response.success) {
                setError(response.error || "Произошла ошибка при поиске");
                return;
            }

            if (response.data && response.data.length > 0) {
                // We map the response data to our local component state structure if needed
                // Or just use it directly if they match. 
                // The server action returns CompanySuggestion[] which matches our local interface mostly.
                setResult(response.data[0] as unknown as CompanySuggestion);
            } else {
                setError("Компания с таким ИНН не найдена.");
            }
        } catch (err) {
            setError("Ошибка при поиске. Проверьте соединение.");
        } finally {
            setLoading(false);
        }
    }

    return (
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Проверка контрагента
            </h3>

            <form onSubmit={handleSearch} className="flex gap-3 mb-6 relative">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Введите ИНН организации для поиска"
                        className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !query}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Найти"}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm mb-4 border border-red-100 dark:border-red-900/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Info className="w-5 h-5" />
                    {error}
                </div>
            )}

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-2 leading-tight">
                                {result.value}
                            </h4>
                            <div className="text-slate-500 dark:text-slate-400 mb-6 flex items-start gap-2">
                                <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                                {result.data.address.value}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                    <span className="block text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Реквизиты</span>
                                    <div className="font-mono text-slate-900 dark:text-white">
                                        <span className="text-slate-500 mr-2">ИНН:</span>{result.data.inn}
                                    </div>
                                    <div className="font-mono text-slate-900 dark:text-white mt-1">
                                        <span className="text-slate-500 mr-2">КПП:</span>{result.data.kpp}
                                    </div>
                                </div>

                                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                    <span className="block text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Статус</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${result.data.state.status === "ACTIVE" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}`}></span>
                                        <span className={`font-medium ${result.data.state.status === "ACTIVE"
                                            ? "text-green-700 dark:text-green-400"
                                            : "text-red-700 dark:text-red-400"
                                            }`}>
                                            {result.data.state.status === "ACTIVE" ? "Действующая" : "Недействующая"}
                                        </span>
                                    </div>
                                </div>

                                {result.data.management && (
                                    <div className="md:col-span-2 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                        <span className="block text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Руководство</span>
                                        <span className="font-medium text-slate-900 dark:text-white text-base">
                                            {result.data.management.name}
                                        </span>
                                        <span className="ml-2 text-slate-500 text-sm">
                                            — {result.data.management.post.toLowerCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className="w-full py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors flex items-center justify-center gap-2"
                                onClick={() => alert("Функция проверки задолженности в разработке")}
                            >
                                <Info className="w-4 h-4" />
                                Проверить задолженности и суды
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
