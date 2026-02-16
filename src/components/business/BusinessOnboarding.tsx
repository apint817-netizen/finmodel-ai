"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Check, ChevronRight, Calculator } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingProps {
    onComplete: (data: any) => void;
}

export function BusinessOnboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        inn: "",
        taxSystem: "usn_6", // Default
    });

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            onComplete(formData);
        }
    };

    const steps = [
        { id: 1, title: "Компания", icon: Building2 },
        { id: 2, title: "Налоги", icon: Calculator },
        { id: 3, title: "Проверка", icon: Check },
    ];

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Настройка консультанта
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Давайте настроим ваш профиль, чтобы мы могли правильно считать налоги и давать советы.
                </p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-12 relative">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                {steps.map((s) => (
                    <div key={s.id} className={`flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 transition-colors ${step >= s.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 bg-white dark:bg-slate-800"}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium">{s.title}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Company Details */}
            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Название организации / ИП
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="ООО Ромашка"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            ИНН (опционально)
                        </label>
                        <input
                            type="text"
                            value={formData.inn}
                            onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                            placeholder="7700000000"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </motion.div>
            )}

            {/* Step 2: Tax System */}
            {step === 2 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Выберите систему налогообложения:
                    </label>
                    {[
                        { id: "usn_6", label: "УСН Доходы (6%)", desc: "Платите 6% со всех поступлений. Расходы не учитываются." },
                        { id: "usn_15", label: "УСН Доходы-Расходы (15%)", desc: "Платите 15% с разницы. Выгодно при большой доле расходов." },
                        { id: "patent", label: "Патент (ПСН)", desc: "Фиксированная сумма налога на год." },
                    ].map((sys) => (
                        <div
                            key={sys.id}
                            onClick={() => setFormData({ ...formData, taxSystem: sys.id })}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.taxSystem === sys.id
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                : "border-slate-200 dark:border-slate-800 hover:border-blue-300"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-slate-900 dark:text-white">{sys.label}</span>
                                {formData.taxSystem === sys.id && <Check className="w-5 h-5 text-blue-600" />}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{sys.desc}</p>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center"
                >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Всё готово!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Мы настроили ваш профиль. Теперь вы сможете отслеживать налоги и получать советы.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-left mb-6">
                        <p className="text-sm text-slate-500 mb-1">Организация</p>
                        <p className="font-medium text-slate-900 dark:text-white mb-3">{formData.name || "Без названия"}</p>
                        <p className="text-sm text-slate-500 mb-1">Налоговый режим</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {formData.taxSystem === "usn_6" ? "УСН Доходы (6%)" :
                                formData.taxSystem === "usn_15" ? "УСН Доходы-Расходы (15%)" : "Патент"}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={() => step > 1 && setStep(step - 1)}
                    disabled={step === 1}
                    className="px-6 py-3 text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-colors"
                >
                    Назад
                </button>
                <button
                    onClick={handleNext}
                    disabled={step === 1 && !formData.name}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {step === 3 ? "Начать работу" : "Далее"}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
