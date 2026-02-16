"use client";

import { useState } from "react";
import { fetchCompanyByInn, CompanySuggestion } from "@/lib/external-api";
import { Search, Loader2, Info } from "lucide-react";

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
            const suggestions = await fetchCompanyByInn(query);
            if (suggestions && suggestions.length > 0) {
                setResult(suggestions[0]); // Take the first best match
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                Проверка контрагента / Мой бизнес
            </h3>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Введите ИНН организации"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={loading || !query}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Найти"}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                            {result.value}
                        </h4>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {result.data.address.value}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">ИНН / КПП</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {result.data.inn} / {result.data.kpp}
                                </span>
                            </div>
                            <div>
                                <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">Статус</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${result.data.state.status === "ACTIVE"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                    {result.data.state.status === "ACTIVE" ? "Действующая" : "Недействующая"}
                                </span>
                            </div>
                            {result.data.management && (
                                <div className="md:col-span-2">
                                    <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">Руководитель</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {result.data.management.name} ({result.data.management.post})
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                            <button
                                type="button"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                onClick={() => alert("Функция проверки задолженности в разработке")}
                            >
                                <Info className="w-4 h-4" />
                                Проверить задолженности
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
