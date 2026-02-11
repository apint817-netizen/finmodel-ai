'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, CreditCard, PieChart, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

export function DashboardPreview() {
    return (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 w-full h-full overflow-hidden flex flex-col gap-4">
            {/* Fake Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-4">
                {/* Card 1 */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded mb-1" />
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-600 rounded" />
                </div>
                {/* Card 2 */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded mb-1" />
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-600 rounded" />
                </div>
                {/* Card 3 */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                            <PieChart className="w-4 h-4" />
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded mb-1" />
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-600 rounded" />
                </div>
            </div>

            {/* Main Chart Area mockup */}
            <div className="flex-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="flex gap-2">
                        <div className="h-3 w-12 bg-slate-100 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-12 bg-slate-100 dark:bg-slate-700 rounded" />
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 flex items-end justify-between px-4 pb-0 gap-2 opacity-50">
                    {[40, 60, 45, 70, 50, 65, 80, 75, 90, 85].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="w-full bg-blue-500 rounded-t-sm opacity-80"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
