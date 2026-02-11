import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Project {
    name: string;
    investments: Array<{ category: string; amount: number }>;
    revenues: Array<{ name: string; monthlyAmount: number }>;
    expenses: Array<{ name: string; monthlyAmount: number }>;
    aiChatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const exportToPDF = async (project: Project) => {
    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let currentY = margin;

        // Helper for formatting currency
        const formatMoney = (amount: number) => {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0
            }).format(amount);
        };

        const totalInvestment = project.investments.reduce((sum, item) => sum + item.amount, 0);
        const totalRevenue = project.revenues.reduce((sum, item) => sum + item.monthlyAmount, 0);
        const totalExpense = project.expenses.reduce((sum, item) => sum + item.monthlyAmount, 0);
        const monthlyProfit = totalRevenue - totalExpense;

        // 1. Capture Charts (Generate independently)
        let chartsImgData = '';
        const chartsElement = document.getElementById('forecast-charts-container');
        if (chartsElement) {
            const chartCanvas = await html2canvas(chartsElement, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            chartsImgData = chartCanvas.toDataURL('image/png');
        }

        // 2. Build Main Report HTML (Static Data)
        const reportContainer = document.createElement('div');
        reportContainer.style.position = 'absolute';
        reportContainer.style.left = '-9999px';
        reportContainer.style.top = '0';
        reportContainer.style.width = '800px';
        reportContainer.style.backgroundColor = '#ffffff';
        reportContainer.style.padding = '40px';
        reportContainer.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(reportContainer);

        reportContainer.innerHTML = `
            <div style="color: #1e293b;">
                <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #0f172a;">${project.name}</h1>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 30px;">Финансовый отчет</p>

                <!-- Summary Cards -->
                <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Инвестиции</div>
                        <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${formatMoney(totalInvestment)}</div>
                    </div>
                    <div style="flex: 1; padding: 15px; background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px;">
                        <div style="font-size: 12px; color: #166534; margin-bottom: 5px;">Чистая Прибыль/мес</div>
                        <div style="font-size: 18px; font-weight: bold; color: #15803d;">${formatMoney(monthlyProfit)}</div>
                    </div>
                </div>

                <!-- Charts Image -->
                ${chartsImgData ? `<div style="margin-bottom: 30px;"><img src="${chartsImgData}" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;" /></div>` : ''}

                <!-- Tables Container -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <!-- Investments -->
                    <div>
                        <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Инвестиции</h2>
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                            ${project.investments.map(item => `
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">${item.category}</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #0f172a;">${formatMoney(item.amount)}</td>
                                </tr>
                            `).join('')}
                            <tr>
                                <td style="padding: 12px 0; font-weight: bold; color: #0f172a;">Итого</td>
                                <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #0f172a;">${formatMoney(totalInvestment)}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Monthly Flows -->
                    <div>
                        <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Ежемесячные Потоки</h2>
                        
                        <!-- Revenues -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 13px; font-weight: 600; color: #166534; margin-bottom: 10px;">Доходы</div>
                            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                                ${project.revenues.map(item => `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 6px 0; color: #334155;">${item.name}</td>
                                        <td style="padding: 6px 0; text-align: right; color: #166534;">+${formatMoney(item.monthlyAmount)}</td>
                                    </tr>
                                `).join('')}
                            </table>
                        </div>

                        <!-- Expenses -->
                        <div>
                            <div style="font-size: 13px; font-weight: 600; color: #991b1b; margin-bottom: 10px;">Расходы</div>
                            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                                ${project.expenses.map(item => `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 6px 0; color: #334155;">${item.name}</td>
                                        <td style="padding: 6px 0; text-align: right; color: #991b1b;">-${formatMoney(item.monthlyAmount)}</td>
                                    </tr>
                                `).join('')}
                            </table>
                        </div>
                    </div>
                </div>
                 <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #94a3b8;">
                    Сгенерировано в FinModel AI • ${new Date().toLocaleDateString('ru-RU')}
                </div>
            </div>
        `;

        // 3. Render Main Report to Image
        const reportCanvas = await html2canvas(reportContainer, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        // 4. Add Main Report to PDF
        const reportImgData = reportCanvas.toDataURL('image/png');
        const reportImgWidth = pageWidth;
        const reportImgHeight = (reportCanvas.height * reportImgWidth) / reportCanvas.width;

        // If main report is huge (shouldn't be, but safe to handle), simple split
        if (reportImgHeight > pageHeight) {
            let heightLeft = reportImgHeight;
            let position = 0;
            doc.addImage(reportImgData, 'PNG', 0, position, reportImgWidth, reportImgHeight);
            heightLeft -= pageHeight;
            while (heightLeft >= 0) {
                position = heightLeft - reportImgHeight;
                doc.addPage();
                doc.addImage(reportImgData, 'PNG', 0, position, reportImgWidth, reportImgHeight);
                heightLeft -= pageHeight;
            }
            currentY = 0; // Reset for next section? No, let's just start fresh page if needed.
            // Actually, for AI analysis, let's ALWAYS start on a new page if the report was long.
            doc.addPage();
            currentY = margin;
        } else {
            doc.addImage(reportImgData, 'PNG', 0, 0, reportImgWidth, reportImgHeight);
            currentY = reportImgHeight + 10;
        }

        // Clean up main container
        document.body.removeChild(reportContainer);

        // 5. AI Analysis Section (Smart Pagination)
        const assistantMessages = project.aiChatHistory ? project.aiChatHistory.filter(msg => msg.role === 'assistant') : [];

        if (assistantMessages.length > 0) {
            // Check if we need a new page for the header
            if (currentY + 20 > pageHeight) {
                doc.addPage();
                currentY = margin;
            }

            // Add Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            // Note: jsPDF default fonts don't support Cyrillic well without custom fonts. 
            // But we are using images for the report to avoid this.
            // For the header, we can also render it as an image or trust the user has a font?
            // Safer: Render the Header as an HTML element too.

            // Let's create a temporary container for EACH message
            const msgContainer = document.createElement('div');
            msgContainer.style.position = 'absolute';
            msgContainer.style.left = '-9999px';
            msgContainer.style.top = '0';
            msgContainer.style.width = '750px'; // Slightly narrower for margins
            msgContainer.style.backgroundColor = '#f8fafc';
            msgContainer.style.border = '1px solid #e2e8f0';
            msgContainer.style.borderRadius = '8px';
            msgContainer.style.padding = '20px';
            msgContainer.style.fontFamily = 'Arial, sans-serif';
            document.body.appendChild(msgContainer);

            // Render "AI Analysis" Title Element
            const titleContainer = document.createElement('div');
            titleContainer.style.position = 'absolute';
            titleContainer.style.left = '-9999px';
            titleContainer.style.width = '750px';
            titleContainer.innerHTML = `<h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; font-family: Arial, sans-serif;">Анализ ИИ</h2>`;
            document.body.appendChild(titleContainer);

            const titleCanvas = await html2canvas(titleContainer, { scale: 2, backgroundColor: '#ffffff' });
            const titleImgHeight = (titleCanvas.height * reportImgWidth) / titleCanvas.width; // Use full width ratio

            if (currentY + titleImgHeight > pageHeight) {
                doc.addPage();
                currentY = margin;
            }
            doc.addImage(titleCanvas.toDataURL('image/png'), 'PNG', margin, currentY, pageWidth - (margin * 2), titleImgHeight);
            currentY += titleImgHeight + 5;
            document.body.removeChild(titleContainer);

            // Loop messages
            for (const msg of assistantMessages) {
                // Prepare content
                msgContainer.innerHTML = `
                    <div style="font-size: 12px; color: #334155; line-height: 1.5;">
                        ${msg.content
                        .replace(/^### (.*$)/gim, '<div style="font-weight: bold; margin-top: 10px; margin-bottom: 5px; font-size: 13px;">$1</div>')
                        .replace(/^## (.*$)/gim, '<div style="font-weight: bold; margin-top: 15px; margin-bottom: 8px; font-size: 14px;">$1</div>')
                        .replace(/^# (.*$)/gim, '<div style="font-weight: bold; margin-top: 20px; margin-bottom: 10px; font-size: 15px;">$1</div>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')}
                    </div>
                `;

                const msgCanvas = await html2canvas(msgContainer, {
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    backgroundColor: '#f8fafc'
                });

                const msgImgData = msgCanvas.toDataURL('image/png');
                // Calculate height relative to PDF page width (minus margins)
                // Calculate height relative to PDF page width (minus margins)
                const contentWidth = pageWidth - (margin * 2);
                const msgImgHeight = (msgCanvas.height * contentWidth) / msgCanvas.width;

                // Check if message fits on current page
                if (currentY + msgImgHeight <= pageHeight - margin) {
                    doc.addImage(msgImgData, 'PNG', margin, currentY, contentWidth, msgImgHeight);
                    currentY += msgImgHeight + 10;
                } else {
                    // Message is too big for current page remaining space.
                    // Check if it fits on a FRESH new page.
                    if (msgImgHeight <= (pageHeight - (margin * 2))) {
                        doc.addPage();
                        currentY = margin;
                        doc.addImage(msgImgData, 'PNG', margin, currentY, contentWidth, msgImgHeight);
                        currentY += msgImgHeight + 10;
                    } else {
                        // ULTRA LONG MESSAGE CASE: Taller than a single page.
                        // We must slice the image across multiple pages.

                        // 1. Move to a fresh page first.
                        doc.addPage();
                        currentY = margin;

                        let remainingHeight = msgImgHeight;
                        let currentSliceY = 0; // Y position in the source image (0 to 1 scale roughly, or pixels)

                        // We need to slice based on SOURCE pixels, not PDF units.
                        const pageContentHeight = pageHeight - (margin * 2); // PDF units

                        // Ratio: 1 PDF unit = X Canvas pixels
                        const pdfToCanvasRatio = msgCanvas.height / msgImgHeight;

                        const sliceHeightPdf = pageContentHeight;
                        const sliceHeightCanvas = sliceHeightPdf * pdfToCanvasRatio;

                        let sourceY = 0; // Canvas pixels

                        while (remainingHeight > 0) {
                            // Create a temporary canvas for the slice
                            const sliceCanvas = document.createElement('canvas');
                            sliceCanvas.width = msgCanvas.width;

                            // Height is either full page height or whatever is left
                            const currentSliceHeightCanvas = Math.min(sliceHeightCanvas, msgCanvas.height - sourceY);
                            sliceCanvas.height = currentSliceHeightCanvas;

                            const ctx = sliceCanvas.getContext('2d');
                            if (ctx) {
                                ctx.drawImage(
                                    msgCanvas,
                                    0, sourceY, msgCanvas.width, currentSliceHeightCanvas, // Source
                                    0, 0, msgCanvas.width, currentSliceHeightCanvas // Dest
                                );

                                const sliceImgData = sliceCanvas.toDataURL('image/png');
                                const sliceHeightPdfActual = currentSliceHeightCanvas / pdfToCanvasRatio;

                                doc.addImage(sliceImgData, 'PNG', margin, margin, contentWidth, sliceHeightPdfActual);
                            }

                            remainingHeight -= sliceHeightPdf;
                            sourceY += sliceHeightCanvas;

                            // If we still have content, add a new page for the next slice
                            if (remainingHeight > 0) {
                                doc.addPage();
                                currentY = margin;
                            } else {
                                // If done, update currentY for the NEXT message (if any)
                                currentY = margin + (msgCanvas.height - (sourceY - sliceHeightCanvas)) / pdfToCanvasRatio + 10;
                                // Actually simplistic: just set it to where we ended.
                                // The sliceHeightPdfActual calculation above logic is slightly tailored for full pages.
                                // Let's just reset currentY nicely.
                                currentY = margin + Math.min(sliceHeightPdf, remainingHeight + sliceHeightPdf) + 10;
                                // Wait, simple logic:
                                // After loop, the last slice was placed at `margin`. Its height is `currentSliceHeightCanvas / pdfToCanvasRatio`.
                                // So currentY should be margin + that height + padding.
                                const lastSliceHeight = (Math.min(sliceHeightCanvas, msgCanvas.height - (sourceY - sliceHeightCanvas))) / pdfToCanvasRatio;
                                currentY = margin + lastSliceHeight + 10;
                            }
                        }
                    }
                }
            }
            document.body.removeChild(msgContainer);
        }

        doc.save(`${project.name.replace(/\s+/g, '_')}_Report.pdf`);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Ошибка при генерации PDF');
    }
};
