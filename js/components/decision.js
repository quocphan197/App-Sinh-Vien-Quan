// Component: Decision Screen (Screen 11)
// Renders the food recommendation generator with real slot-machine rapid spinning animations

import { calcVoucherDiscount } from '../pricing.js';

export function renderDecision(state) {
    const currentCombo = state.selectedCombo;
    const isSpinning = state.isSpinning;

    let cardContent = '';

    if (isSpinning) {
        // While spinning, show slot-machine style high speed rolls
        cardContent = `
            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 rounded-xl overflow-hidden decision-engine-glow transition-all duration-300">
                <!-- Slot Machine container -->
                <div class="slot-machine-container bg-surface-variant/30 dark:bg-black/20 flex flex-col justify-center items-center">
                    <div class="slot-machine-track" id="slot-track">
                        <div class="slot-item">
                            <span class="material-symbols-outlined text-5xl text-primary animate-spin mb-2">autorenew</span>
                            <span class="font-bold text-sm text-on-surface-variant">Đang kết nối ý chí chống đói...</span>
                        </div>
                    </div>
                </div>
                <div class="p-6 text-center">
                    <h3 class="font-bold text-lg text-primary animate-pulse">Quán đang chọn nhân duyên ẩm thực...</h3>
                    <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-1">Đảm bảo ngon, rẻ, siêu tốc!</p>
                </div>
            </div>
        `;
    } else {
        // Render the active selected combo card
        const priceFormatted = currentCombo.price.toLocaleString('vi-VN') + 'đ';
        const previewCart = { [currentCombo.id]: 1 };
        const { discount: discountAmount } = calcVoucherDiscount(previewCart, state.appliedVoucherCode);
        const hasDiscount = discountAmount > 0;
        const finalPrice = Math.max(0, currentCombo.price - discountAmount);
        const finalPriceFormatted = finalPrice.toLocaleString('vi-VN') + 'đ';

        cardContent = `
            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 rounded-xl overflow-hidden decision-engine-glow transition-all duration-300 select-none">
                <!-- Food Image POV -->
                <div class="h-56 w-full relative overflow-hidden">
                    <img alt="${currentCombo.dishName}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" src="${currentCombo.image}">
                    <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        ${currentCombo.tags.map(tag => `
                            <span class="bg-status-red text-white font-label-sm text-[10px] px-2.5 py-0.5 rounded-lg font-bold shadow-sm select-none">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                <!-- Card Content -->
                <div class="p-stack-md flex flex-col gap-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1 pr-2">
                            <h2 class="font-card-title text-base font-extrabold text-on-surface dark:text-white leading-tight">${currentCombo.dishName}</h2>
                            <div class="flex items-center gap-1 text-on-surface-variant dark:text-secondary-fixed-dim mt-1.5">
                                <span class="material-symbols-outlined text-[16px]">schedule</span>
                                <span class="font-body-md text-xs">${currentCombo.time} • ${currentCombo.status}</span>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            ${hasDiscount ? `
                                <span class="text-xs line-through text-on-surface-variant block">${priceFormatted}</span>
                                <span class="font-label-price text-base font-extrabold text-status-red block">${finalPriceFormatted}</span>
                            ` : `
                                <span class="font-label-price text-base font-extrabold text-primary dark:text-primary-fixed-dim block">${priceFormatted}</span>
                            `}
                        </div>
                    </div>
                    
                    <!-- Reason Badge -->
                    <div class="bg-primary-fixed dark:bg-surface-container p-3 rounded-lg border-l-4 border-primary">
                        <p class="font-body-md text-xs text-on-primary-fixed dark:text-on-primary-container italic font-medium">"${currentCombo.reason}"</p>
                    </div>
                    
                    <!-- Primary CTA -->
                    <button class="squishy-button w-full bg-primary-container hover:bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" onclick="window.orderCombo('${currentCombo.id}')">
                        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">shopping_cart</span>
                        Đặt combo này
                    </button>
                </div>
            </div>
        `;
    }

    return `
        <div class="pt-16 pb-12 max-w-md mx-auto animate-fade-in">
            <!-- Notification Header -->
            <div class="mb-5 text-center select-none">
                <span class="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container dark:bg-surface-variant dark:text-primary-fixed-dim font-bold text-[10px] uppercase tracking-wider mb-2 shadow-sm">
                    Quyết định trong 3 giây
                </span>
                <h1 class="font-section-title-mobile text-xl font-black text-on-surface dark:text-white">
                    Quán chọn cho bạn:<br>
                    <span class="text-primary dark:text-primary-fixed-dim font-black text-2xl">${isSpinning ? '...' : (currentCombo ? currentCombo.name : 'Chưa chọn')}</span>
                </h1>
            </div>

            <!-- Suggestion Card Area -->
            <div class="relative group">
                ${cardContent}
            </div>

            <!-- Secondary Actions -->
            <div class="mt-5 grid grid-cols-2 gap-3 select-none">
                <button class="squishy-button flex flex-col items-center justify-center p-3 border border-outline-variant/30 rounded-xl bg-surface-container-low dark:bg-surface-dim hover:bg-surface-container hover:text-primary dark:text-white transition-colors" 
                        onclick="window.spinDecisionEngine()" ${isSpinning ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim mb-1 ${isSpinning ? 'animate-spin' : ''}">refresh</span>
                    <span class="font-label-sm text-[11px] font-semibold">Gợi ý món khác</span>
                </button>
                <button class="squishy-button flex flex-col items-center justify-center p-3 border border-outline-variant/30 rounded-xl bg-surface-container-low dark:bg-surface-dim hover:bg-surface-container hover:text-primary dark:text-white transition-colors" 
                        onclick="window.location.hash = '#/menu'" ${isSpinning ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim mb-1">menu_book</span>
                    <span class="font-label-sm text-[11px] font-semibold">Xem toàn bộ menu</span>
                </button>
            </div>

            <!-- Fast Track Tips -->
            <div class="mt-6 p-4 rounded-xl border border-dashed border-outline-variant/40 dark:border-outline/30 bg-surface-container-highest dark:bg-surface-dim/40 select-none">
                <div class="flex gap-3">
                    <span class="material-symbols-outlined text-status-yellow shrink-0 text-xl" style="font-variation-settings: 'FILL' 1;">lightbulb</span>
                    <div>
                        <h4 class="font-label-sm text-xs font-bold text-on-surface dark:text-white">Mẹo nhỏ cho bạn</h4>
                        <p class="font-body-md text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5 leading-relaxed">Đặt ngay bây giờ để nhận món tại quầy số 3 mà không cần xếp hàng chờ đợi!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
