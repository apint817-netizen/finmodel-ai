import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, Sparkles, TrendingUp, ChevronDown, Trash2, RefreshCw, Copy, Pencil, Check, X, Minimize2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

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
    onAction?: (action: string, data: any) => void;
}

const AVAILABLE_MODELS = [
    // Google Gemini (Supported)
    { id: 'gemini-1.5-flash', name: 'Google Gemini (Auto)', provider: 'Google', description: 'Автоматический выбор (Flash/Pro)' },
];

export function AIChat({ modelData, messages: externalMessages, onMessagesChange, onAction }: AIChatProps) {
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
    const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
    const [showModelSelector, setShowModelSelector] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [aiMode, setAiMode] = useState<'analysis' | 'editing'>('analysis');

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
    }, [messages, editingIndex, isLoading]);

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
                    mode: aiMode, // Pass the selected mode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.details || data.error || 'Ошибка сервера');
                (error as any).data = data; // Attach full data for debug info
                throw error;
            }

            let assistantContent = data.message;

            // Check for actions (handle multiple actions)
            const actionRegex = /\[ACTION_REQUIRED\]([\s\S]*?)\[\/ACTION_REQUIRED\]/g;
            let match;

            while ((match = actionRegex.exec(assistantContent)) !== null) {
                if (onAction) {
                    try {
                        const actionJson = JSON.parse(match[1]);
                        onAction(actionJson.action, actionJson.data);
                    } catch (e) {
                        console.error('Failed to execute AI action:', e);
                    }
                }
            }

            // Remove all action blocks from the message
            assistantContent = assistantContent.replace(actionRegex, '').trim();

            const assistantMessage: Message = {
                role: 'assistant',
                content: assistantContent || 'Действие выполнено.',
            };
            setMessages([...newMessages, assistantMessage]); // Use unified setter
        } catch (err: any) {
            console.error('Chat error:', err);

            // Try to parse debug info if it exists in the error message or object
            let errorContent = `❌ Ошибка: ${err.message}`;

            // If we have detailed info from the server (passed via exception or data)
            if (err.data?.debug || err.data?.hint) {
                errorContent += `\n\n💡 ${err.data.hint || 'Проверьте соединение'}`;

                if (err.data.debug) {
                    errorContent += `\n\n🔧 Debug Info:\nProvider: ${err.data.debug.provider}\nKey: ${err.data.debug.keyStatus}\nModel: ${err.data.debug.model}\nURL: ${err.data.debug.baseURL}`;
                }
            } else {
                // Fallback hint
                errorContent += `\n\n💡 Убедитесь, что настройки корректны.`;
            }

            setError(err.message || 'Не удалось получить ответ от ИИ');

            const errorMessages = [...newMessages, {
                role: 'assistant' as const,
                content: errorContent,
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
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title="Копировать"
            >
                <Copy className="w-3 h-3" />
            </button>
            <button
                onClick={() => startEditing(index, content)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title="Редактировать"
            >
                <Pencil className="w-3 h-3" />
            </button>
            <button
                onClick={() => handleDeleteMessage(index)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title="Удалить"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-slate-900 transition-all duration-300 ${isMinimized ? 'h-[60px]' : ''}`}>
            {/* Header */}
            <div className="flex-none mb-0 px-1 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                                ИИ-Консультант
                                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">v2.1</span>
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="font-medium">Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="md:hidden p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
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

                {/* Model Selector - Only show if not minimized */}
                {!isMinimized && (
                    <div className="space-y-2">
                        {/* Mode Selector */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setAiMode('analysis')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${aiMode === 'analysis'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <TrendingUp className="w-3.5 h-3.5" />
                                Анализ
                            </button>
                            <button
                                onClick={() => setAiMode('editing')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${aiMode === 'editing'
                                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Редактор
                            </button>
                        </div>

                        {/* Model Selector Dropdown Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => setShowModelSelector(!showModelSelector)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-xs"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 dark:text-slate-400">Модель:</span>
                                    <span className="font-medium text-slate-900 dark:text-white truncate">{currentModel.name}</span>
                                </div>
                                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showModelSelector && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden"
                                    >
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
                                                <div className="font-medium text-xs text-slate-900 dark:text-white">{model.name}</div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{model.description}</div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area - Hidden if minimized */}
            {!isMinimized && (
                <>
                    {/* Quick Analysis Button (Only if empty or just greeting) */}
                    {hasData && messages.length <= 1 && (
                        <div className="px-2 mt-2">
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => handleSend('Проанализируй мою финансовую модель и дай рекомендации')}
                                disabled={isLoading}
                                className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md group"
                            >
                                <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-sm">Анализировать модель</span>
                            </motion.button>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-4 scroll-smooth">
                        <AnimatePresence initial={false}>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`group flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
                                >
                                    {/* Actions for user - Left side */}
                                    {message.role === 'user' && editingIndex !== index && (
                                        <div className="hidden sm:block">
                                            <MessageActions index={index} content={message.content} role="user" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                                            } w-full relative`}
                                    >
                                        {/* Mobile Actions Trigger (Hold or Tap) - Could be added here, currently sticking to desktop hover for simplicity but ensuring visibility */}

                                        {editingIndex === index ? (
                                            <div className="flex flex-col gap-2">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full p-2 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={cancelEdit} className="p-1 text-slate-500 hover:bg-slate-200 rounded"><X className="w-4 h-4" /></button>
                                                    <button onClick={() => saveEdit(index)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {message.role === 'assistant' ? (
                                                    <div className="text-sm prose prose-sm max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-900 dark:prose-p:text-slate-100 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-ul:text-slate-900 dark:prose-ul:text-slate-100 prose-ol:text-slate-900 dark:prose-ol:text-slate-100 prose-li:text-slate-900 dark:prose-li:text-slate-100 break-words dark:prose-invert leading-relaxed">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Actions for assistant - Right side */}
                                    {message.role === 'assistant' && editingIndex !== index && (
                                        <div className="hidden sm:block">
                                            <MessageActions index={index} content={message.content} role="assistant" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-3 shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">Анализирую данные...</span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    {messages.length === 1 && !isLoading && hasData && (
                        <div className="px-2 mb-2">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 ml-1">Быстрые вопросы</p>
                            <div className="flex flex-wrap gap-2">
                                {quickPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSend(prompt)}
                                        className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors whitespace-nowrap"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Data Warning */}
                    {!hasData && messages.length === 1 && (
                        <div className="mx-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>Добавьте данные в модель для анализа</span>
                            </p>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mx-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                        </motion.div>
                    )}

                    {/* Input */}
                    <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex gap-2 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Спросите о вашей модели..."
                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 dark:text-white placeholder-slate-400 text-sm shadow-sm"
                                rows={1}
                                disabled={isLoading}
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="w-11 h-11 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-blue-500/20"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 text-center">
                            ИИ может ошибаться. Проверяйте важные данные.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
