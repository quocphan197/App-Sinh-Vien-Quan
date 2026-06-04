// Component: Vouchers Screen (Screen 23)
// Renders the list of active and used vouchers, with full support for filtering and custom cutout styling

export function renderVouchers(state) {
    const availableVouchers = state.vouchers.filter(v => v.category === 'available');
    const usedVouchers = state.vouchers.filter(v => v.category === 'used');
    const newCount = availableVouchers.filter(v => v.isNew).length;

    return `
        <div class="pt-16 pb-12 animate-fade-in">
            <!-- Page Title & Quick Filter -->
            <div class="mb-6 select-none">
                <h2 class="font-section-title-mobile text-section-title-mobile text-on-surface dark:text-white mb-1.5">Voucher của bạn</h2>
                <p class="font-body-md text-sm text-on-surface-variant dark:text-secondary-fixed-dim">Tiết kiệm hơn với các ưu đãi dành riêng cho sinh viên.</p>
            </div>

            <!-- Section: Voucher khả dụng -->
            <section class="mb-8">
                <div class="flex items-center justify-between mb-4 select-none">
                    <h3 class="font-bold text-[16px] text-primary dark:text-primary-fixed-dim">Voucher khả dụng</h3>
                    ${newCount > 0 ? `<span class="bg-primary-container text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm badge-pulse">${newCount} Mới</span>` : ''}
                </div>
                
                <div class="grid gap-4">
                    ${availableVouchers.length === 0 ? `
                        <!-- Empty State for available vouchers -->
                        <div class="p-6 border border-dashed border-outline-variant dark:border-outline/40 rounded-2xl flex flex-col items-center text-center opacity-70">
                            <span class="material-symbols-outlined text-4xl mb-2 text-outline">confirmation_number</span>
                            <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim font-medium">Bạn đã dùng hết voucher khả dụng rồi!</p>
                        </div>
                    ` : availableVouchers.map(v => `
                        <!-- Voucher Card -->
                        <div class="relative overflow-hidden flex bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-xl shadow-sm hover:shadow-md transition-all group select-none">
                            <!-- Left Cutout Banner -->
                            <div class="w-24 ${v.id === 'v2' ? 'bg-tertiary-container' : 'bg-primary-container'} flex flex-col items-center justify-center text-white p-2 shrink-0 relative">
                                <span class="material-symbols-outlined text-3xl mb-1">${v.icon}</span>
                                <span class="text-[10px] font-bold uppercase text-center">${v.type}</span>
                                <span class="text-lg font-black">${v.valueText}</span>
                            </div>
                            
                            <!-- Right Voucher Details -->
                            <div class="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 class="font-bold text-[15px] text-on-surface dark:text-white leading-snug mb-1">${v.title}</h4>
                                    <p class="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim mb-2">${v.condition} • HSD: ${v.expiry}</p>
                                    <span class="inline-block px-2 py-0.5 font-semibold text-[10px] rounded border ${v.tagColor}">${v.tag}</span>
                                </div>
                                <button class="mt-4 self-end bg-primary-container hover:bg-primary text-white px-5 py-1.5 rounded-full font-bold text-xs active:scale-95 transition-all shadow-sm squishy-button" onclick="window.applyVoucher('${v.id}')">Dùng ngay</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Section: Voucher đã dùng -->
            <section class="mb-6">
                <h3 class="font-bold text-[16px] text-on-surface-variant dark:text-secondary-fixed-dim mb-4 opacity-75 select-none">Voucher đã dùng</h3>
                <div class="grid gap-4">
                    ${usedVouchers.map(v => `
                        <!-- Used Voucher Card (Grayscale) -->
                        <div class="relative overflow-hidden flex bg-surface-container-low dark:bg-surface-variant/10 border border-outline-variant/20 rounded-xl grayscale opacity-60 select-none">
                            <div class="w-24 bg-secondary flex flex-col items-center justify-center text-white p-2 shrink-0">
                                <span class="material-symbols-outlined text-3xl mb-1">${v.icon}</span>
                                <span class="text-[10px] font-bold uppercase">${v.type}</span>
                            </div>
                            <div class="p-4 flex-1">
                                <h4 class="font-bold text-[15px] text-on-surface dark:text-white leading-snug mb-1">${v.title}</h4>
                                <p class="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim mb-1">${v.useDetail}</p>
                                <p class="text-[10px] italic text-on-surface-variant/80 dark:text-secondary-fixed-dim/80">Ngày dùng: ${v.usedDate}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Atmosphere Hunter block -->
            <div class="mt-8 p-6 border-2 border-dashed border-outline-variant dark:border-outline/30 rounded-3xl flex flex-col items-center text-center opacity-40 select-none">
                <span class="material-symbols-outlined text-5xl mb-3 text-outline">confirmation_number</span>
                <p class="font-body-md text-xs text-on-surface-variant dark:text-secondary-fixed-dim max-w-[200px] leading-relaxed">Đang săn thêm voucher hời cho bạn...</p>
            </div>
        </div>
    `;
}
