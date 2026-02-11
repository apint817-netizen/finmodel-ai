'use client';

import { CurrencyInput } from './CurrencyInput';
import { AmountSlider } from './AmountSlider';

interface FormattedNumberInputProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    placeholder?: string;
    showSlider?: boolean;
    showQuickButtons?: boolean;
    min?: number;
    max?: number;
}

export function FormattedNumberInput({
    value,
    onChange,
    label,
    placeholder,
    showSlider = true,
    showQuickButtons = true,
    min = 0,
    max = 1000000000,
}: FormattedNumberInputProps) {
    const quickAmounts = [100000, 500000, 1000000, 5000000];

    const formatQuickButton = (amount: number): string => {
        if (amount >= 1000000) {
            return `${amount / 1000000}M`;
        }
        return `${amount / 1000}K`;
    };

    return (
        <div className="space-y-3">
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}

            {/* Input Field */}
            <CurrencyInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                max={max}
            />

            {/* Slider */}
            {showSlider && (
                <AmountSlider value={value} onChange={onChange} />
            )}

            {/* Quick Buttons */}
            {showQuickButtons && (
                <div className="flex gap-2">
                    {quickAmounts.map((amount) => (
                        <button
                            key={amount}
                            onClick={() => onChange(amount)}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${value === amount
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {formatQuickButton(amount)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
