'use client';

import { useState, useEffect } from 'react';

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    className?: string;
}

export function CurrencyInput({
    value,
    onChange,
    placeholder = '0',
    min = 0,
    max = 1000000000,
    className = '',
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Format number with spaces as thousand separators
    const formatCurrency = (num: number): string => {
        return new Intl.NumberFormat('ru-RU').format(num);
    };

    // Parse formatted string to number
    const parseCurrency = (str: string): number => {
        const cleaned = str.replace(/\s/g, '').replace(/[^\d]/g, '');
        const parsed = parseInt(cleaned) || 0;
        return Math.min(Math.max(parsed, min), max);
    };

    // Update display value when prop value changes
    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(value > 0 ? formatCurrency(value) : '');
        }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Allow only digits and spaces
        const cleaned = input.replace(/[^\d\s]/g, '');
        setDisplayValue(cleaned);

        // Parse and update actual value
        const numValue = parseCurrency(cleaned);
        onChange(numValue);
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Show unformatted on focus for easier editing
        setDisplayValue(value > 0 ? value.toString() : '');
    };

    const handleBlur = () => {
        setIsFocused(false);
        // Format on blur
        if (value > 0) {
            setDisplayValue(formatCurrency(value));
        } else {
            setDisplayValue('');
        }
    };

    return (
        <div className="relative">
            <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 pr-8 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 ${className}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
                ₽
            </span>
        </div>
    );
}
