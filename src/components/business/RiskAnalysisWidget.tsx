"use client";

import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskAnalysisProps {
    reliability: "high" | "medium" | "low";
    risks: string[];
    visible: boolean;
}

export function RiskAnalysisWidget({ reliability, risks, visible }: RiskAnalysisProps) {
    if (!visible) return null;

    return (
        <div className="mt-6 animate-in slide-in-from-top-4 duration-500">
            <div className={`p-5 rounded-2xl border ${reliability === 'high'
                    ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30'
                    : reliability === 'medium'
                        ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'
                        : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'
                }`}>
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${reliability === 'high' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            reliability === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {reliability === 'high' ? <ShieldCheck className="w-6 h-6" /> :
                            reliability === 'medium' ? <Shield className="w-6 h-6" /> :
                                <ShieldAlert className="w-6 h-6" />}
                    </div>

                    <div className="flex-1">
                        <h4 className={`text-lg font-bold mb-1 ${reliability === 'high' ? 'text-emerald-900 dark:text-emerald-100' :
                                reliability === 'medium' ? 'text-amber-900 dark:text-amber-100' :
                                    'text-red-900 dark:text-red-100'
                            }`}>
                            {reliability === 'high' ? 'Высокая надежность' :
                                reliability === 'medium' ? 'Средние риски' :
                                    'Высокий риск!'}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Результат экспресс-проверки по открытым источникам
                        </p>

                        <div className="space-y-2">
                            {risks.map((risk, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm font-medium">
                                    <div className={`w-1.5 h-1.5 rounded-full ${risk.includes("не обнаружено") ? "bg-emerald-500" : "bg-red-500"
                                        }`}></div>
                                    <span className="text-slate-700 dark:text-slate-300">{risk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
