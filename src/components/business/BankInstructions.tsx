"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink, HelpCircle } from "lucide-react";

type BankId = 'sber' | 'tinkoff' | 'tochka' | 'rsb' | 'alfa';

interface Instruction {
    id: BankId;
    name: string;
    color: string;
    steps: string[];
    link?: string;
}

const INSTRUCTIONS: Instruction[] = [
    {
        id: 'sber',
        name: 'СберБизнес',
        color: 'bg-green-600',
        steps: [
            "Зайдите в раздел «Выписки и отчеты» на главной",
            "Нажмите кнопку «Скачать» (справа вверху)",
            "Выберите «Выписка по счету» или «1С»",
            "В форме выберите период и формат «1C (txt)»",
            "Важно: Кодировка должна быть «Windows (1251)»",
            "Нажмите «Скачать» и загрузите файл сюда"
        ],
        link: "https://sbi.sberbank.ru:9443/ic/dcb/"
    },
    {
        id: 'tinkoff',
        name: 'Т-Бизнес',
        color: 'bg-yellow-500',
        steps: [
            "Перейдите в «Счета и платежи»",
            "Нажмите на иконку скачивания (стрелка вниз)",
            "Выберите «Выписка в 1С»",
            "Скачайте файл (.txt) и перетащите его сюда"
        ],
        link: "https://business.tbank.ru/"
    },
    {
        id: 'tochka',
        name: 'Точка',
        color: 'bg-purple-600',
        steps: [
            "Откройте раздел «Выписка»",
            "Нажмите кнопку «Экспорт»",
            "Выберите формат «1С» (.txt)",
            "Сохраните файл"
        ],
        link: "https://enter.tochka.com/"
    },
    {
        id: 'rsb',
        name: 'Русский Стандарт',
        color: 'bg-rose-700',
        steps: [
            "Зайдите в Интернет-банк",
            "Раздел «Счета» → «Выписка»",
            "Выберите период и нажмите «Экспорт»",
            "Выберите формат «1C Client Bank» (txt)",
            "Скачайте файл"
        ],
        link: "https://online.rsb.ru/"
    },
    {
        id: 'alfa',
        name: 'Альфа-Бизнес',
        color: 'bg-red-600',
        steps: [
            "Выписка → Скачать",
            "Выберите формат «1С»",
            "Период: за всё время или квартал",
            "Скачайте файл"
        ],
        link: "https://link.alfabank.ru/"
    }
];

export function BankInstructions() {
    const [selectedBank, setSelectedBank] = useState<BankId | null>(null);

    return (
        <div className="mt-6 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Как получить выписку?</h3>
            </div>

            {!selectedBank ? (
                <div className="grid grid-cols-2 gap-3">
                    {INSTRUCTIONS.map((bank) => (
                        <button
                            key={bank.id}
                            onClick={() => setSelectedBank(bank.id)}
                            className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-left group"
                        >
                            <div className={`w-3 h-3 rounded-full ${bank.color} shrink-0`} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                                {bank.name}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <button
                        onClick={() => setSelectedBank(null)}
                        className="text-xs text-slate-500 hover:text-blue-600 mb-3 flex items-center gap-1"
                    >
                        ← Выбрать другой банк
                    </button>

                    {INSTRUCTIONS.map((bank) => {
                        if (bank.id !== selectedBank) return null;
                        return (
                            <div key={bank.id}>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${bank.color}`} />
                                        {bank.name}
                                    </h4>
                                    {bank.link && (
                                        <a
                                            href={bank.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            Войти в банк <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                                <ol className="space-y-2 relative border-l-2 border-slate-200 dark:border-slate-700 ml-2 pl-4">
                                    {bank.steps.map((step, idx) => (
                                        <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 relative">
                                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-slate-50 dark:ring-slate-900" />
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
