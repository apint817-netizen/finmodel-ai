// Simulating a payment gateway integration
// In reality, this would use an SDK like Yookassa or Tinkoff

export async function createPayment(amount: number, description: string) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        id: "pay_" + Math.random().toString(36).substr(2, 9),
        status: "pending",
        confirmation_url: "https://example.com/pay_mock", // In real app, this is where user is redirected
        amount: {
            value: amount.toFixed(2),
            currency: "RUB",
        },
        description,
    };
}

export async function generateQrCode(paymentId: string) {
    // Placeholder for QR generation logic
    // Could return a URL to a generated QR image
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${paymentId}`;
}
