"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { parseBankStatement } from "@/lib/bank-parser";
import { Transaction } from "@/lib/business-logic";

interface BankUploadProps {
    onUpload: (transactions: Transaction[]) => void;
    userInn?: string;
}

export function BankUpload({ onUpload, userInn }: BankUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setError(null);

        try {
            const text = await file.text();

            // Check if it looks like a 1C file
            if (!text.includes("1CClientBankExchange")) {
                throw new Error("Неверный формат файла. Требуется файл 1C (txt).");
            }

            const transactions = parseBankStatement(text, userInn);

            if (transactions.length === 0) {
                throw new Error("В файле не найдено операций.");
            }

            // Simulate delay for effect
            await new Promise(resolve => setTimeout(resolve, 800));

            onUpload(transactions);
        } catch (err: any) {
            setError(err.message || "Ошибка при чтении файла");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
                    ${isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                    className="hidden"
                    accept=".txt"
                />

                {isProcessing ? (
                    <div className="flex flex-col items-center py-2">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                        <p className="text-sm text-slate-500">Обработка выписки...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-2">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                            Загрузить выписку из банка
                        </h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                            Перетащите файл <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">1c_to_kl.txt</code> или нажмите для выбора
                        </p>
                        <div className="text-xs text-slate-400">
                            Поддерживается: Сбербанк, Тинькофф, Точка, Альфа
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg animate-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
