import { Info } from 'lucide-react';
import { useState } from 'react';

interface ContextHintProps {
    text: string;
    className?: string;
}

export function ContextHint({ text, className = '' }: ContextHintProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help transition-colors" />

            {isVisible && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                    {/* Arrow (now pointing up) */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900"></div>
                    {text}
                </div>
            )}
        </div>
    );
}
