export interface InvestmentItem {
    id: string;
    category: string;
    amount: number;
    description?: string;
}

export interface RevenueItem {
    id: string;
    name: string;
    monthlyAmount: number;
    type: 'recurring' | 'one-time';
}

export interface ExpenseItem {
    id: string;
    name: string;
    monthlyAmount: number;
    type: 'fixed' | 'variable';
}

export interface BusinessTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    emoji: string;
    investments: Omit<InvestmentItem, 'id'>[];
    revenues: Omit<RevenueItem, 'id'>[];
    expenses: Omit<ExpenseItem, 'id'>[];
}

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
    {
        id: 'retail-clothing',
        name: 'Магазин одежды',
        description: 'Розничная торговля одеждой в торговом центре',
        category: 'Розничная торговля',
        icon: '🏪',
        emoji: '👕',
        investments: [
            { category: 'Аренда помещения', amount: 300000, description: 'Залог за аренду (3 месяца)' },
            { category: 'Ремонт', amount: 500000, description: 'Косметический ремонт и оформление' },
            { category: 'Торговое оборудование', amount: 400000, description: 'Стеллажи, вешалки, зеркала, касса' },
            { category: 'Первая партия товара', amount: 800000, description: 'Закупка коллекции одежды' },
            { category: 'Вывеска и реклама', amount: 150000, description: 'Наружная реклама и продвижение' },
        ],
        revenues: [
            { name: 'Продажа одежды', monthlyAmount: 600000, type: 'recurring' },
            { name: 'Продажа аксессуаров', monthlyAmount: 100000, type: 'recurring' },
        ],
        expenses: [
            { name: 'Аренда помещения', monthlyAmount: 100000, type: 'fixed' },
            { name: 'Зарплата продавцов', monthlyAmount: 120000, type: 'fixed' },
            { name: 'Коммунальные услуги', monthlyAmount: 15000, type: 'fixed' },
            { name: 'Закупка товара', monthlyAmount: 280000, type: 'variable' },
            { name: 'Реклама', monthlyAmount: 30000, type: 'variable' },
        ],
    },
    {
        id: 'cafe',
        name: 'Кафе',
        description: 'Уютное кафе на 30 посадочных мест',
        category: 'Общепит',
        icon: '🍕',
        emoji: '☕',
        investments: [
            { category: 'Аренда помещения', amount: 250000, description: 'Залог за аренду' },
            { category: 'Ремонт', amount: 800000, description: 'Ремонт кухни и зала' },
            { category: 'Кухонное оборудование', amount: 600000, description: 'Плита, холодильники, духовка' },
            { category: 'Мебель', amount: 300000, description: 'Столы, стулья, барная стойка' },
            { category: 'Посуда и инвентарь', amount: 100000, description: 'Тарелки, приборы, кастрюли' },
            { category: 'Лицензии и документы', amount: 50000, description: 'Разрешения и сертификаты' },
        ],
        revenues: [
            { name: 'Продажа блюд', monthlyAmount: 450000, type: 'recurring' },
            { name: 'Напитки', monthlyAmount: 180000, type: 'recurring' },
            { name: 'Десерты', monthlyAmount: 70000, type: 'recurring' },
        ],
        expenses: [
            { name: 'Аренда помещения', monthlyAmount: 80000, type: 'fixed' },
            { name: 'Зарплата персонала', monthlyAmount: 200000, type: 'fixed' },
            { name: 'Коммунальные услуги', monthlyAmount: 25000, type: 'fixed' },
            { name: 'Закупка продуктов', monthlyAmount: 210000, type: 'variable' },
            { name: 'Реклама и доставка', monthlyAmount: 40000, type: 'variable' },
        ],
    },
    {
        id: 'beauty-salon',
        name: 'Салон красоты',
        description: 'Салон красоты с 4 мастерами',
        category: 'Услуги',
        icon: '💇',
        emoji: '✂️',
        investments: [
            { category: 'Аренда помещения', amount: 200000, description: 'Залог за аренду' },
            { category: 'Ремонт', amount: 600000, description: 'Дизайнерский ремонт' },
            { category: 'Оборудование', amount: 450000, description: 'Кресла, мойки, сушуары' },
            { category: 'Мебель', amount: 150000, description: 'Зеркала, стеллажи, ресепшн' },
            { category: 'Косметика и инструменты', amount: 200000, description: 'Первая закупка материалов' },
        ],
        revenues: [
            { name: 'Стрижки', monthlyAmount: 180000, type: 'recurring' },
            { name: 'Окрашивание', monthlyAmount: 220000, type: 'recurring' },
            { name: 'Маникюр', monthlyAmount: 150000, type: 'recurring' },
            { name: 'Уходовые процедуры', monthlyAmount: 100000, type: 'recurring' },
        ],
        expenses: [
            { name: 'Аренда помещения', monthlyAmount: 70000, type: 'fixed' },
            { name: 'Зарплата мастеров', monthlyAmount: 260000, type: 'fixed' },
            { name: 'Коммунальные услуги', monthlyAmount: 12000, type: 'fixed' },
            { name: 'Материалы и косметика', monthlyAmount: 80000, type: 'variable' },
            { name: 'Реклама', monthlyAmount: 25000, type: 'variable' },
        ],
    },
    {
        id: 'kids-center',
        name: 'Детский центр',
        description: 'Игровой центр для детей 3-12 лет',
        category: 'Развлечения',
        icon: '🎮',
        emoji: '🎪',
        investments: [
            { category: 'Аренда помещения', amount: 300000, description: 'Залог за аренду' },
            { category: 'Ремонт', amount: 500000, description: 'Безопасный ремонт для детей' },
            { category: 'Игровое оборудование', amount: 800000, description: 'Горки, батуты, лабиринты' },
            { category: 'Мебель', amount: 150000, description: 'Столы, стулья, шкафчики' },
            { category: 'Лицензии', amount: 50000, description: 'Разрешения и документы' },
        ],
        revenues: [
            { name: 'Почасовая оплата', monthlyAmount: 280000, type: 'recurring' },
            { name: 'Абонементы', monthlyAmount: 180000, type: 'recurring' },
            { name: 'Проведение праздников', monthlyAmount: 120000, type: 'recurring' },
            { name: 'Кафе', monthlyAmount: 50000, type: 'recurring' },
        ],
        expenses: [
            { name: 'Аренда помещения', monthlyAmount: 100000, type: 'fixed' },
            { name: 'Зарплата персонала', monthlyAmount: 150000, type: 'fixed' },
            { name: 'Коммунальные услуги', monthlyAmount: 30000, type: 'fixed' },
            { name: 'Расходные материалы', monthlyAmount: 40000, type: 'variable' },
            { name: 'Реклама', monthlyAmount: 35000, type: 'variable' },
        ],
    },
    {
        id: 'ecommerce',
        name: 'Интернет-магазин',
        description: 'E-commerce магазин электроники',
        category: 'E-commerce',
        icon: '🛒',
        emoji: '📱',
        investments: [
            { category: 'Разработка сайта', amount: 400000, description: 'Создание интернет-магазина' },
            { category: 'Первая партия товара', amount: 1000000, description: 'Закупка электроники' },
            { category: 'Маркетинг', amount: 200000, description: 'Запуск рекламных кампаний' },
            { category: 'Склад', amount: 150000, description: 'Аренда и оборудование склада' },
        ],
        revenues: [
            { name: 'Продажи через сайт', monthlyAmount: 800000, type: 'recurring' },
            { name: 'Маркетплейсы', monthlyAmount: 300000, type: 'recurring' },
        ],
        expenses: [
            { name: 'Хостинг и домен', monthlyAmount: 5000, type: 'fixed' },
            { name: 'Зарплата персонала', monthlyAmount: 120000, type: 'fixed' },
            { name: 'Аренда склада', monthlyAmount: 40000, type: 'fixed' },
            { name: 'Реклама', monthlyAmount: 150000, type: 'variable' },
            { name: 'Логистика', monthlyAmount: 80000, type: 'variable' },
            { name: 'Закупка товара', monthlyAmount: 440000, type: 'variable' },
        ],
    },
];

export function getTemplateById(id: string): BusinessTemplate | undefined {
    return BUSINESS_TEMPLATES.find(t => t.id === id);
}
