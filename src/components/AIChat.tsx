'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, Sparkles, TrendingUp, ChevronDown } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatProps {
    modelData?: {
        totalInvestment: number;
        monthlyRevenue: number;
        monthlyExpenses: number;
        monthlyProfit: number;
        roi: number;
        breakevenMonths: number;
        investments: any[];
        revenues: any[];
        expenses: any[];
    };
}

const AVAILABLE_MODELS = [
    // OpenAI
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },

    // Gemini 3
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google' },
    { id: 'gemini-3-pro-high', name: 'Gemini 3 Pro High', provider: 'Google' },
    { id: 'gemini-3-pro-low', name: 'Gemini 3 Pro Low', provider: 'Google' },
    { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro (Image)', provider: 'Google' },

    // Gemini 2.5
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google' },
    { id: 'gemini-2.5-flash-thinking', name: 'Gemini 2.5 Flash (Thinking)', provider: 'Google' },

    // Gemini 2.0 & 1.5
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google' },
    { id: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro', provider: 'Google' },

    // Claude 4.5 & 4.6
    { id: 'claude-sonnet-4-5', name: 'Claude 4.5 Sonnet', provider: 'Anthropic' },
    { id: 'claude-sonnet-4-5-thinking', name: 'Claude 4.5 Sonnet (Thinking)', provider: 'Anthropic' },
    { id: 'claude-opus-4-5-thinking', name: 'Claude 4.5 Opus (Thinking)', provider: 'Anthropic' },
    { id: 'claude-opus-4-6-thinking', name: 'Claude 4.6 Opus (Thinking)', provider: 'Anthropic' },

    // Claude 3.5
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },

    // Claude 3
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic' },
];

export function AIChat({ modelData }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '👋 Привет! Я ваш ИИ-консультант по финансовому моделированию. Задавайте вопросы о вашей модели, и я помогу с анализом, рисками и рекомендациями.',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
    const [showModelSelector, setShowModelSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend || isLoading) return;

        const userMessage: Message = { role: 'user', content: textToSend };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    modelData,
                    model: selectedModel,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Ошибка сервера');
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.message,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err: any) {
            console.error('Chat error:', err);
            setError(err.message || 'Не удалось получить ответ от ИИ');

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `❌ Ошибка: ${err.message}\n\n💡 Убедитесь, что Antigravity Manager запущен на http://127.0.0.1:8045`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickPrompts = [
        'Проанализируй мою финансовую модель',
        'Какие риски ты видишь?',
        'Как улучшить рентабельность?',
        'Оцени точку безубыточности',
    ];

    const hasData = modelData && (
        modelData.investments.length > 0 ||
        modelData.revenues.length > 0 ||
        modelData.expenses.length > 0
    );

    const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">ИИ-Консультант</h3>
                            <div className="flex items-center gap-2 text-xs text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Онлайн</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Model Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowModelSelector(!showModelSelector)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-slate-600">Модель:</span>
                            <span className="font-medium text-slate-900">{currentModel.name}</span>
                            <span className="text-xs text-slate-400">({currentModel.provider})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
                    </button>

                    {showModelSelector && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            {AVAILABLE_MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        setSelectedModel(model.id);
                                        setShowModelSelector(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors ${selectedModel === model.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="font-medium text-sm text-slate-900">{model.name}</div>
                                    <div className="text-xs text-slate-500">{model.provider}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Analysis Button */}
            {hasData && messages.length === 1 && (
                <button
                    onClick={() => handleSend('Проанализируй мою финансовую модель и дай рекомендации')}
                    disabled={isLoading}
                    className="mb-4 w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Анализировать модель</span>
                </button>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-sm text-slate-600">Анализирую...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && !isLoading && hasData && (
                <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Или выберите вопрос:</p>
                    <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => handleSend(prompt)}
                                className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No Data Warning */}
            {!hasData && messages.length === 1 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                        💡 Добавьте данные в модель, чтобы получить более точный анализ
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-200 pt-4">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Напишите сообщение..."
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Enter для отправки • Shift+Enter для новой строки
                </p>
            </div>
        </div>
    );
}
