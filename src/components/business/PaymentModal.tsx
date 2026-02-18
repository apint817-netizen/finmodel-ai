"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Download, Copy, CheckCircle, AlertCircle, Info } from "lucide-react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    taxAmount: number;
    inn?: string;
    businessName?: string;
    taxSystem?: string;
}

// КБК для ЕНС (Единый налоговый счёт) — 2024+
const KBK_ENS = "18201061201010000510";
const FNS_INN = "7707329152";
const FNS_NAME = "Управление Федерального казначейства по Тульской области (МИ ФНС России по управлению долгом)";
const BANK_ACCOUNT = "03100643000000018500";
const BANK_NAME = "ОТДЕЛЕНИЕ ТУЛА БАНКА РОССИИ//УФК по Тульской области г. Тула";
const BIC = "017003983";
const CORR_ACCOUNT = "40102810445370000059";

function buildQRString(amount: number, inn: string, purpose: string): string {
    // Стандарт ГОСТ Р 56042-2014 для QR-кодов платёжных документов
    const amountKop = Math.round(amount * 100); // в копейках
    return [
        "ST00012",
        `Name=${FNS_NAME}`,
        `PersonalAcc=${BANK_ACCOUNT}`,
        `BankName=${BANK_NAME}`,
        `BIC=${BIC}`,
        `CorrespAcc=${CORR_ACCOUNT}`,
        `Sum=${amountKop}`,
        `Purpose=${purpose}`,
        `PayeeINN=${FNS_INN}`,
        `CBC=${KBK_ENS}`,
        `PayerINN=${inn}`,
    ].join("|");
}

export function PaymentModal({ isOpen, onClose, taxAmount, inn = "", businessName = "ИП", taxSystem = "УСН" }: PaymentModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [amount, setAmount] = useState(taxAmount);
    const [payerInn, setPayerInn] = useState(inn);
    const [purpose, setPurpose] = useState(`Авансовый платёж по ${taxSystem} за ${new Date().getFullYear()} год`);
    const [qrGenerated, setQrGenerated] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setAmount(taxAmount);
        setPayerInn(inn);
    }, [taxAmount, inn, isOpen]);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            generateQR();
        }
    }, [isOpen, amount, payerInn, purpose]);

    const generateQR = async () => {
        if (!canvasRef.current) return;
        setError("");
        try {
            const qrString = buildQRString(amount, payerInn, purpose);
            await QRCode.toCanvas(canvasRef.current, qrString, {
                width: 240,
                margin: 2,
                color: { dark: "#1e293b", light: "#ffffff" },
                errorCorrectionLevel: "M",
            });
            setQrGenerated(true);
        } catch (e) {
            setError("Ошибка генерации QR-кода. Проверьте данные.");
            setQrGenerated(false);
        }
    };

    const handleCopyQR = async () => {
        const qrString = buildQRString(amount, payerInn, purpose);
        await navigator.clipboard.writeText(qrString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        if (!canvasRef.current || !qrGenerated) return;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        // Header
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 30, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("ПЛАТЁЖНОЕ ПОРУЧЕНИЕ", 105, 18, { align: "center" });

        // Body
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        const fields = [
            ["Получатель:", FNS_NAME],
            ["ИНН получателя:", FNS_INN],
            ["Банк получателя:", BANK_NAME],
            ["БИК:", BIC],
            ["Расчётный счёт:", BANK_ACCOUNT],
            ["Корр. счёт:", CORR_ACCOUNT],
            ["КБК:", KBK_ENS],
            ["ИНН плательщика:", payerInn || "—"],
            ["Назначение платежа:", purpose],
            ["Сумма:", `${amount.toLocaleString("ru-RU")} ₽`],
        ];

        let y = 42;
        fields.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.text(label, 15, y);
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(value, 120);
            doc.text(lines, 70, y);
            y += lines.length > 1 ? lines.length * 6 + 2 : 8;
        });

        // QR Code
        const qrDataUrl = canvasRef.current.toDataURL("image/png");
        doc.addImage(qrDataUrl, "PNG", 140, 42, 55, 55);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("QR-код для оплаты", 167, 100, { align: "center" });
        doc.text("через мобильный банк", 167, 105, { align: "center" });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Сформировано: ${new Date().toLocaleDateString("ru-RU")} | ${businessName}`, 105, 285, { align: "center" });

        doc.save(`payment_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const formatAmount = (val: number) =>
        val.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <QrCode className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Оплата ЕНС</h3>
                                    <p className="text-blue-100 text-sm">Единый налоговый счёт</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Сумма к уплате (₽)
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xl focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        {formatAmount(amount)} ₽ — расчётный налог
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        ИНН плательщика
                                    </label>
                                    <input
                                        type="text"
                                        value={payerInn}
                                        onChange={(e) => setPayerInn(e.target.value)}
                                        placeholder="000000000000"
                                        maxLength={12}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Назначение платежа
                                    </label>
                                    <textarea
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                {/* Recipient Info */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                                            <p><span className="font-bold">КБК:</span> {KBK_ENS}</p>
                                            <p><span className="font-bold">БИК:</span> {BIC}</p>
                                            <p><span className="font-bold">Счёт:</span> {BANK_ACCOUNT}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: QR Code */}
                            <div className="flex flex-col items-center justify-between gap-4">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
                                        <canvas ref={canvasRef} className="block" />
                                    </div>
                                    {error && (
                                        <div className="flex items-center gap-2 text-red-500 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
                                    {qrGenerated && !error && (
                                        <p className="text-xs text-slate-500 text-center">
                                            Отсканируйте QR-код в мобильном приложении банка
                                        </p>
                                    )}
                                </div>

                                <div className="w-full space-y-2">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={!qrGenerated}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                    >
                                        <Download className="w-4 h-4" />
                                        Скачать PDF
                                    </button>
                                    <button
                                        onClick={handleCopyQR}
                                        disabled={!qrGenerated}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all text-sm"
                                    >
                                        {copied ? (
                                            <><CheckCircle className="w-4 h-4 text-green-500" /> Скопировано!</>
                                        ) : (
                                            <><Copy className="w-4 h-4" /> Копировать строку QR</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
