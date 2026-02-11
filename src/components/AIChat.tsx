import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, Sparkles, TrendingUp, ChevronDown, Trash2, RefreshCw, Copy, Pencil, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    messages?: Message[];
    onMessagesChange?: (messages: Message[]) => void;
}

const AVAILABLE_MODELS = [
    // OpenAI
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Быстрый и экономичный' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Лучшее мышление' },

    // Gemini 3
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google', description: 'Предпросмотр Flash' },
    { id: 'gemini-3-pro-high', name: 'Gemini 3 Pro High', provider: 'Google', description: 'Лучшее мышление' },
    { id: 'gemini-3-pro-low', name: 'Gemini 3 Pro Low', provider: 'Google', description: 'Легкий и быстрый' },
    { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro (Image)', provider: 'Google', description: 'Генерация изображений (1:1)' },

    // Gemini 2.5
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', description: 'Быстрый ответ' },
    { id: 'gemini-2.5-flash-thinking', name: 'Gemini 2.5 Flash (Thinking)', provider: 'Google', description: 'Цепочка рассуждений' },

    // Gemini 2.0 & 1.5
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google', description: 'Экспериментальная версия' },
    { id: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Стабильная версия' },

    // Claude 4.5 & 4.6
    { id: 'claude-sonnet-4-5', name: 'Claude 4.5 Sonnet', provider: 'Anthropic', description: 'Кодовое мышление' },
    { id: 'claude-sonnet-4-5-thinking', name: 'Claude 4.5 Sonnet (Thinking)', provider: 'Anthropic', description: 'Цепочка рассуждений' },
    { id: 'claude-opus-4-5-thinking', name: 'Claude 4.5 Opus (Thinking)', provider: 'Anthropic', description: 'Сильнейшее мышление' },
    { id: 'claude-opus-4-6-thinking', name: 'Claude 4.6 Opus (Thinking)', provider: 'Anthropic', description: 'Сильнейшее мышление' },

    // Claude 3.5
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Стабильная версия' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'Anthropic', description: 'Быстрый и легкий' },

    // Claude 3
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Предыдущее поколение' },
];

export function AIChat({ modelData, messages: externalMessages, onMessagesChange }: AIChatProps) {
    const [internalMessages, setInternalMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '👋 Привет! Я ваш ИИ-консультант по финансовому моделированию. Задавайте вопросы о вашей модели, и я помогу с анализом, рисками и рекомендациями.',
        },
    ]);

    // Use external messages if provided, otherwise use internal
    const messages = externalMessages || internalMessages;
    const setMessages = onMessagesChange || setInternalMessages;

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
    const [showModelSelector, setShowModelSelector] = useState(false);

    // Editing state
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (editingIndex === null) {
            scrollToBottom();
        }
    }, [messages, editingIndex]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend || isLoading) return;

        const userMessage: Message = { role: 'user', content: textToSend };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages); // Use unified setter
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
            setMessages([...newMessages, assistantMessage]); // Use unified setter
        } catch (err: any) {
            console.error('Chat error:', err);
            setError(err.message || 'Не удалось получить ответ от ИИ');

            const errorMessages = [...newMessages, {
                role: 'assistant' as const,
                content: `❌ Ошибка: ${err.message}\n\n💡 Убедитесь, что Antigravity Manager запущен на http://127.0.0.1:8045`,
            }];
            setMessages(errorMessages); // Use unified setter
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMessage = (index: number) => {
        if (!confirm('Удалить это сообщение?')) return;
        const newMessages = messages.filter((_, i) => i !== index);
        setMessages(newMessages);
    };

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
        // Optional: show toast
    };

    const startEditing = (index: number, content: string) => {
        setEditingIndex(index);
        setEditValue(content);
    };

    const saveEdit = (index: number) => {
        const newMessages = [...messages];
        newMessages[index] = { ...newMessages[index], content: editValue };
        setMessages(newMessages);
        setEditingIndex(null);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditValue('');
    };

    const handleClearChat = () => {
        if (confirm('Вы уверены, что хотите очистить историю чата?')) {
            setMessages([
                {
                    role: 'assistant',
                    content: '👋 Привет! Я ваш ИИ-консультант по финансовому моделированию. Задавайте вопросы о вашей модели, и я помогу с анализом, рисками и рекомендациями.',
                },
            ]);
        }
    };

    // Simpler "Restart Analysis" logic requested by user: "request analysis again"
    const handleRestartAnalysis = () => {
        if (confirm('Начать новый анализ? Текущая история будет очищена.')) {
            setMessages([
                {
                    role: 'assistant',
                    content: '👋 Привет! Я ваш ИИ-консультант по финансовому моделированию. Задавайте вопросы о вашей модели, и я помогу с анализом, рисками и рекомендациями.',
                },
            ]);
            setTimeout(() => handleSend('Проанализируй мою финансовую модель и дай рекомендации'), 100);
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

    // Helper for message actions
    const MessageActions = ({ index, content, role }: { index: number, content: string, role: string }) => (
        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${role === 'user' ? 'mr-2' : 'ml-2'}`}>
            <button
                onClick={() => handleCopyMessage(content)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                title="Копировать"
            >
                <Copy className="w-3 h-3" />
            </button>
            <button
                onClick={() => startEditing(index, content)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                title="Редактировать"
            >
                <Pencil className="w-3 h-3" />
            </button>
            <button
                onClick={() => handleDeleteMessage(index)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                title="Удалить"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                ИИ-Консультант
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">v2.1</span>
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Онлайн</span>
                            </div>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleRestartAnalysis}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Начать новый анализ"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleClearChat}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Очистить чат"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Model Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowModelSelector(!showModelSelector)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-slate-600 dark:text-slate-400">Модель:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{currentModel.name}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">({currentModel.provider})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
                    </button>

                    {showModelSelector && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            {AVAILABLE_MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        setSelectedModel(model.id);
                                        setShowModelSelector(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                        }`}
                                >
                                    <div className="font-medium text-sm text-slate-900 dark:text-white">{model.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{model.provider} • {model.description}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Analysis Button (Only if empty or just greeting) */}
            {hasData && messages.length <= 1 && (
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
                        className={`group flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
                    >
                        {/* Actions for user - Left side */}
                        {message.role === 'user' && editingIndex !== index && (
                            <MessageActions index={index} content={message.content} role="user" />
                        )}

                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                                } w-full relative`}
                        >
                            {editingIndex === index ? (
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full p-2 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={cancelEdit}
                                            className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                            title="Отмена"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => saveEdit(index)}
                                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                            title="Сохранить"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {message.role === 'assistant' ? (
                                        <div className="text-sm prose prose-sm max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-900 dark:prose-p:text-slate-100 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-ul:text-slate-900 dark:prose-ul:text-slate-100 prose-ol:text-slate-900 dark:prose-ol:text-slate-100 prose-li:text-slate-900 dark:prose-li:text-slate-100 break-words dark:prose-invert">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Actions for assistant - Right side */}
                        {message.role === 'assistant' && editingIndex !== index && (
                            <MessageActions index={index} content={message.content} role="assistant" />
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">Анализирую...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && !isLoading && hasData && (
                <div className="mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Или выберите вопрос:</p>
                    <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => handleSend(prompt)}
                                className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No Data Warning */}
            {!hasData && messages.length === 1 && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        💡 Добавьте данные в модель, чтобы получить более точный анализ
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Напишите сообщение..."
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 dark:text-white placeholder-slate-400"
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
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Enter для отправки • Shift+Enter для новой строки
                </p>
            </div>
        </div>
    );
}
