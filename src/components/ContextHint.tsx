import { Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ContextHintProps {
    text: string;
    className?: string;
}

export function ContextHint({ text, className = '' }: ContextHintProps) {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [position, setPosition] = useState<'top' | 'bottom'>('top');

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceAbove = rect.top;

            // If less than 150px above, show below
            const newPosition = spaceAbove < 150 ? 'bottom' : 'top';
            setPosition(newPosition);

            setCoords({
                top: newPosition === 'top'
                    ? rect.top + window.scrollY - 10
                    : rect.bottom + window.scrollY + 10,
                left: rect.left + window.scrollX + rect.width / 2,
            });
        }
    }, [isVisible]);

    return (
        <>
            <div
                ref={triggerRef}
                className={`inline-flex items-center ${className}`}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                <Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
            </div>

            {isVisible && typeof document !== 'undefined' && createPortal(
                <div
                    className={`fixed z-[9999] w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 ${position === 'top' ? '-translate-y-full' : ''
                        }`}
                    style={{
                        top: coords.top,
                        left: coords.left,
                    }}
                >
                    {/* Arrow */}
                    {position === 'top' ? (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                    ) : (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900"></div>
                    )}
                    {text}
                </div>,
                document.body
            )}
        </>
    );
}
