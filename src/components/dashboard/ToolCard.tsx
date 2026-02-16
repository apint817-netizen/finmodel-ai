"use client";

import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ToolCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    status: "active" | "beta" | "coming_soon" | "new";
    color?: string;
}

export function ToolCard({ title, description, icon: Icon, href, status, color = "blue" }: ToolCardProps) {
    const isComingSoon = status === "coming_soon";

    // Status badges configuration
    const statusBadges = {
        active: null,
        beta: (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                Beta
            </span>
        ),
        coming_soon: (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-full">
                Скоро
            </span>
        ),
        new: (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                New
            </span>
        ),
    };

    const content = (
        <div className={`
            relative group h-full p-6 rounded-2xl border transition-all duration-300
            ${isComingSoon
                ? "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 opacity-75 cursor-not-allowed"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
            }
        `}>
            {/* Background Gradient Effect */}
            {!isComingSoon && (
                <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
            )}

            <div className="relative flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {statusBadges[status]}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
                    {description}
                </p>

                <div className="flex items-center text-sm font-medium text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform">
                    {isComingSoon ? (
                        <span className="text-slate-400">В разработке</span>
                    ) : (
                        <>
                            Открыть инструмент
                            <ArrowRight className="w-4 h-4 ml-2 text-blue-500" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    if (isComingSoon) {
        return <div>{content}</div>;
    }

    return (
        <Link href={href} className="block h-full">
            {content}
        </Link>
    );
}
