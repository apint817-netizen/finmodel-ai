"use server";

interface CompanySuggestion {
    value: string;
    unrestricted_value: string;
    data: {
        inn: string;
        kpp: string;
        ogrn: string;
        ogrn_date: number;
        hid: string;
        type: "LEGAL" | "INDIVIDUAL";
        name: {
            full_with_opf: string;
            short_with_opf: string;
            latin: string | null;
            full: string;
            short: string;
        };
        address: {
            value: string;
            unrestricted_value: string;
        };
        state: {
            status: "ACTIVE" | "LIQUIDATING" | "LIQUIDATED" | "BANKRUPT" | "REORGANIZING";
            actuality_date: number;
            registration_date: number;
            liquidation_date: number | null;
        };
        management?: {
            name: string;
            post: string;
        };
    };
}

const DADATA_API_KEY = process.env.DADATA_API_KEY || process.env.NEXT_PUBLIC_DADATA_API_KEY || "";

export async function checkCompanyByInn(query: string): Promise<{ success: boolean; data?: CompanySuggestion[]; error?: string }> {
    if (!query) return { success: false, error: "Empty query" };

    if (!DADATA_API_KEY) {
        console.error("DaData API Key is missing");
        return { success: false, error: "Ошибка конфигурации: Отсутствует API ключ DaData" };
    }

    try {
        const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Token " + DADATA_API_KEY,
            },
            body: JSON.stringify({ query: query }),
        });

        if (!response.ok) {
            throw new Error(`DaData API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data: data.suggestions || [] };
    } catch (error: any) {
        console.error("DaData fetch error:", error);
        return { success: false, error: "Ошибка при запросе к сервису данных" };
    }
}
