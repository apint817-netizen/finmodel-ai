import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface AmountSliderProps {
    value: number;
    onChange: (value: number) => void;
    className?: string;
}

export function AmountSlider({ value, onChange, className = '' }: AmountSliderProps) {
    const [sliderConfig, setSliderConfig] = useState({ min: 0, max: 1000000, step: 10000 });
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate adaptive slider range based on current value
    useEffect(() => {
        if (value < 100000) {
            setSliderConfig({ min: 0, max: 100000, step: 1000 });
        } else if (value < 1000000) {
            setSliderConfig({ min: 0, max: 1000000, step: 10000 });
        } else if (value < 10000000) {
            setSliderConfig({ min: 0, max: 10000000, step: 50000 });
        } else {
            setSliderConfig({ min: 0, max: 100000000, step: 100000 });
        }
    }, [value]);

    const formatLabel = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 0)}K`;
        }
        return num.toString();
    };

    const percentage = ((value - sliderConfig.min) / (sliderConfig.max - sliderConfig.min)) * 100;

    // Safe access to theme only after mount to avoid hydration mismatch, or default to light equivalent
    const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');
    const trackColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 : slate-200
    const activeColor = '#3b82f6'; // blue-500

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Slider */}
            <div className="relative">
                <input
                    type="range"
                    min={sliderConfig.min}
                    max={sliderConfig.max}
                    step={sliderConfig.step}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                        background: `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${percentage}%, ${trackColor} ${percentage}%, ${trackColor} 100%)`,
                    }}
                />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{formatLabel(sliderConfig.min)}</span>
                <span>{formatLabel(sliderConfig.max / 4)}</span>
                <span>{formatLabel(sliderConfig.max / 2)}</span>
                <span>{formatLabel((sliderConfig.max * 3) / 4)}</span>
                <span>{formatLabel(sliderConfig.max)}</span>
            </div>

            <style jsx>{`
                .slider-thumb::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
                    transition: all 0.2s;
                }
                .slider-thumb::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
                }
                .slider-thumb::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
                    transition: all 0.2s;
                }
                .slider-thumb::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
                }
            `}</style>
        </div>
    );
}
