'use client';

import { useRouter } from 'next/navigation';
import { Plus, BarChart3, Coffee, Scissors, Gamepad2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useProjectStore } from '@/lib/store';

const templates = [
    { id: 'gaming', name: 'Игровая комната', icon: Gamepad2, color: 'from-purple-500 to-purple-600' },
    { id: 'retail', name: 'Розничная торговля', icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
    { id: 'food', name: 'Кафе / Ресторан', icon: Coffee, color: 'from-orange-500 to-orange-600' },
    { id: 'services', name: 'Услуги', icon: Scissors, color: 'from-green-500 to-green-600' },
];

export default function DashboardPage() {
    const router = useRouter();
    const { projects, createProject } = useProjectStore();

    const handleCreateProject = (templateId: string) => {
        const template = templates.find((t) => t.id === templateId);
        if (!template) return;

        const project = createProject(`Новый проект: ${template.name}`, templateId);
        router.push(`/editor/${project.id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <header className="border-b border-slate-200/50 backdrop-blur-sm bg-white/70">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            FinModel AI
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                            Мои проекты
                        </button>
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-700">
                            У
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Добро пожаловать! 👋</h1>
                    <p className="text-lg text-slate-600">
                        {projects.length === 0
                            ? 'Создайте свою первую финансовую модель'
                            : `У вас ${projects.length} ${projects.length === 1 ? 'проект' : 'проектов'}`}
                    </p>
                </div>

                {/* My Projects */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">Мои проекты</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Existing Projects */}
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/editor/${project.id}`}
                                className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(project.updatedAt).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {project.investments.length} инвестиций • {project.revenues.length} доходов
                                </p>
                            </Link>
                        ))}

                        {/* New Project Card */}
                        <button
                            onClick={() => handleCreateProject('gaming')}
                            className="group p-8 bg-white border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center min-h-[200px]"
                        >
                            <div className="w-16 h-16 bg-slate-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                                <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <span className="text-lg font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                                Новый проект
                            </span>
                        </button>

                        {/* Empty state */}
                        {projects.length === 0 && (
                            <div className="md:col-span-2 flex items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className="text-center">
                                    <p className="text-slate-500 mb-2">У вас пока нет проектов</p>
                                    <p className="text-sm text-slate-400">Выберите шаблон ниже, чтобы начать</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Templates */}
                <section>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6">Создать из шаблона</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {templates.map((template) => {
                            const Icon = template.icon;
                            return (
                                <button
                                    key={template.id}
                                    onClick={() => handleCreateProject(template.id)}
                                    className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all"
                                >
                                    <div
                                        className={`w-14 h-14 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                                    >
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                                    <p className="text-sm text-slate-500">Готовый шаблон</p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* AI Assistant Preview */}
                <section className="mt-16">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">ИИ-Ассистент готов помочь</h3>
                                <p className="text-blue-100 mb-4">
                                    Создайте проект, и я помогу вам с расчётами, анализом рисков и рекомендациями
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm backdrop-blur-sm">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span>Antigravity Manager подключен</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
