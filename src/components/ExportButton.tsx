'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Loader2, CheckCircle, ChevronDown, FileText } from 'lucide-react';
import { exportToExcel, uploadToGoogleSheets } from '@/utils/excelExport';
import { exportToPDF } from '@/utils/pdfExport';

interface ExportButtonProps {
    project: {
        id: string;
        name: string;
        investments: Array<{ id: string; category: string; amount: number; description?: string }>;
        revenues: Array<{ id: string; name: string; monthlyAmount: number; type: string }>;
        expenses: Array<{ id: string; name: string; monthlyAmount: number; type: string }>;
    };
    aiMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function ExportButton({ project, aiMessages = [] }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleExport = async (type: 'excel' | 'sheets' | 'pdf') => {
        try {
            setIsExporting(true);
            setShowDropdown(false);

            await new Promise(resolve => setTimeout(resolve, 500));

            if (type === 'excel') {
                exportToExcel(project, aiMessages);
            } else if (type === 'sheets') {
                await uploadToGoogleSheets(project, aiMessages);
            } else if (type === 'pdf') {
                await exportToPDF(project);
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Export error:', error);
            alert('Ошибка при экспорте файла');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-1">
                <button
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-l-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Экспорт...
                        </>
                    ) : showSuccess ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Готово!
                        </>
                    ) : (
                        <>
                            <FileSpreadsheet className="w-4 h-4" />
                            <span className="hidden md:inline">Экспорт</span>
                        </>
                    )}
                </button>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={isExporting}
                    className="px-2 py-2 bg-emerald-600 text-white rounded-r-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-emerald-500"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {showDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg whitespace-nowrap z-10 overflow-hidden">
                    <button
                        onClick={() => handleExport('excel')}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm text-slate-900 dark:text-white"
                    >
                        <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Скачать Excel</span>
                    </button>
                    <button
                        onClick={() => handleExport('sheets')}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm border-t border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span>Открыть в Google Sheets</span>
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm border-t border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                        <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span>Скачать PDF</span>
                    </button>
                </div>
            )}

            {showSuccess && (
                <div className="absolute top-full mt-2 right-0 bg-green-50 border border-green-200 rounded-lg px-3 py-2 shadow-lg whitespace-nowrap z-10">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Файл успешно экспортирован
                    </p>
                </div>
            )}
        </div>
    );
}
