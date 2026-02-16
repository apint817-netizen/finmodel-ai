"use client";

import { useState } from "react";
import { createPayment } from "@/lib/payment-gateway";
import { Loader2, CreditCard } from "lucide-react";

interface PaymentButtonProps {
    amount: number;
    description: string;
}

export function PaymentButton({ amount, description }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handlePayment() {
        setLoading(true);
        try {
            // In a real app, this would be a server action that calls the payment gateway
            // For now, we simulate the client-side flow or call a server action wrapper
            // Let's assume we alert for now as we don't have a real backend route yet
            // alert(`Переход к оплате суммы: ${amount} ₽\nНазначение: ${description}`);

            const payment = await createPayment(amount, description);
            // In a real scenario, redirect to payment.confirmation_url
            // window.location.href = payment.confirmation_url;
            alert(`Ссылка на оплату сформирована: ${payment.confirmation_url}\n(В реальности произошел бы редирект)`);
        } catch (error) {
            alert("Ошибка инициализации оплаты");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Оплатить налог
        </button>
    );
}
