import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type Scenario = 'realistic' | 'optimistic' | 'pessimistic';

interface ScenarioSelectorProps {
    value: Scenario;
    onChange: (value: Scenario) => void;
}

export function ScenarioSelector({ value, onChange }: ScenarioSelectorProps) {
    return (
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 shadow-sm">
            <button
                onClick={() => onChange('pessimistic')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === 'pessimistic'
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                title="Пессимистичный: -20% доходы, +10% расходы"
            >
                <TrendingDown className="w-4 h-4" />
                <span className="hidden md:inline">Пессимистичный</span>
            </button>
            <button
                onClick={() => onChange('realistic')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === 'realistic'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
            >
                <Minus className="w-4 h-4" />
                <span className="hidden md:inline">Реалистичный</span>
            </button>
            <button
                onClick={() => onChange('optimistic')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === 'optimistic'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                title="Оптимистичный: +20% доходы, -5% расходы"
            >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">Оптимистичный</span>
            </button>
        </div>
    );
}
