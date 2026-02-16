export interface CompanySuggestion {
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

const DADATA_API_KEY = process.env.NEXT_PUBLIC_DADATA_API_KEY || "";
// Note: For client-side requests we might need a proxy or server action to hide the key if it's not restricted by domain.
// But DaData has a specific client-side API key usually. For now assuming server-side action or proxy.

export async function fetchCompanyByInn(query: string): Promise<CompanySuggestion[]> {
    if (!query) return [];

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
        return data.suggestions || [];
    } catch (error) {
        console.error("DaData fetch error:", error);
        return [];
    }
}
