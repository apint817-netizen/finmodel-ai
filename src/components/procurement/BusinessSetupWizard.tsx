"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, MapPin, Wallet, ArrowRight, ArrowLeft, Loader2, Sparkles, Building2, Lightbulb } from "lucide-react";

interface BusinessSetupWizardProps {
    onComplete: (data: { businessDescription: string; city: string; budget: number }) => void;
}

const EXAMPLE_BUSINESSES = [
    { icon: "🎮", label: "Игровой клуб на 15 ПК" },
    { icon: "💈", label: "Барбершоп на 3 кресла" },
    { icon: "☕", label: "Кофейня формата to-go" },
    { icon: "🧘", label: "Йога-студия" },
    { icon: "🏋️", label: "Фитнес-зал" },
    { icon: "🍕", label: "Пиццерия с доставкой" },
    { icon: "🧹", label: "Клининговая компания" },
    { icon: "📸", label: "Фотостудия" },
];

export function BusinessSetupWizard({ onComplete }: BusinessSetupWizardProps) {
    const [step, setStep] = useState(1);
    const [description, setDescription] = useState("");
    const [city, setCity] = useState("Москва");
    const [budget, setBudget] = useState("");
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) return;
        setIsLoadingAI(true);
        // Small delay for UX polish
        await new Promise((r) => setTimeout(r, 300));
        onComplete({
            businessDescription: description.trim(),
            city: city.trim() || "Москва",
            budget: parseInt(budget.replace(/\D/g, "")) || 0,
        });
    };

    const formatBudget = (val: string) => {
        const num = val.replace(/\D/g, "");
        if (!num) return "";
        return parseInt(num).toLocaleString("ru-RU");
    };

    const steps = [
        { id: 1, label: "Бизнес", icon: Building2 },
        { id: 2, label: "Детали", icon: MapPin },
        { id: 3, label: "Запуск", icon: Rocket },
    ];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-lg shadow-amber-500/25">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    AI Бизнес-Закупщик
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Расскажите, что хотите открыть, и AI подберёт всё необходимое
                </p>
            </motion.div>

            {/* Step Indicator */}
            <div className="flex justify-center gap-3 mb-10">
                {steps.map((s) => {
                    const StepIcon = s.icon;
                    const isActive = s.id === step;
                    const isDone = s.id < step;
                    return (
                        <div key={s.id} className="flex flex-col items-center gap-2">
                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                                ${isActive
                                    ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 scale-110"
                                    : isDone
                                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                }
                            `}>
                                <StepIcon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-medium ${isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                Опишите бизнес, который хотите открыть
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Например: Игровой клуб на 15 компьютеров с зоной PlayStation, баром и комнатой для VR..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-base"
                            />

                            {/* Quick Examples */}
                            <div className="mt-5">
                                <p className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1.5">
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    Или выберите из примеров:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {EXAMPLE_BUSINESSES.map((ex) => (
                                        <button
                                            key={ex.label}
                                            onClick={() => setDescription(ex.label)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-sm border transition-all duration-200
                                                ${description === ex.label
                                                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700"
                                                }
                                            `}
                                        >
                                            {ex.icon} {ex.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!description.trim()}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                            >
                                Далее
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1.5 text-amber-500" />
                                    Город
                                </label>
                                <input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Москва"
                                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <Wallet className="w-4 h-4 inline mr-1.5 text-amber-500" />
                                    Бюджет (необязательно)
                                </label>
                                <div className="relative">
                                    <input
                                        value={budget}
                                        onChange={(e) => setBudget(formatBudget(e.target.value))}
                                        placeholder="3 000 000"
                                        className="w-full p-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₽</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">AI подберёт варианты под ваш бюджет</p>
                            </div>

                            {/* Summary */}
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-1">Ваш бизнес:</p>
                                <p className="text-sm text-amber-700 dark:text-amber-400">{description}</p>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep(1)}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Назад
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                            >
                                Далее
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-lg shadow-amber-500/25">
                                <Rocket className="w-8 h-8 text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                Готово к запуску!
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                AI проанализирует ваш бизнес и составит полный чек-лист необходимых закупок с конкретными товарами и ценами
                            </p>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Бизнес</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{description}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Город</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{city || "Москва"}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Бюджет</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {budget ? budget + " ₽" : "Не ограничен"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep(2)}
                                disabled={isLoadingAI}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Назад
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoadingAI}
                                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-70"
                            >
                                {isLoadingAI ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        AI анализирует...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Сгенерировать чек-лист
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
