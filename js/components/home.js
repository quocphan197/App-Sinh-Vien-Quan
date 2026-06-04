// Component: Home Screen
// Renders the main dashboard for the user, linking to the voucher page, menu, and decision engine

export function renderHome(state) {
    const unreadNotifications = state.notifications.filter(n => n.unread).length;
    const activeVouchers = state.vouchers.filter(v => v.category === 'available').slice(0, 2);

    return `
        <!-- Main Content -->
        <div class="space-y-6 pt-16 pb-12 animate-fade-in">
            <!-- Student card dashboard -->
            <div class="bg-gradient-to-br from-primary to-primary-container text-white p-5 rounded-2xl shadow-md relative overflow-hidden select-none">
                <!-- Floating background glow decoration -->
                <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div class="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                
                <div class="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <p class="text-white/80 font-label-sm text-[12px] uppercase tracking-wider">Thành viên ưu tú</p>
                        <h3 class="text-xl font-extrabold leading-tight">Sinh Viên Quán Card</h3>
                    </div>
                    <span class="px-2.5 py-0.5 bg-status-yellow text-on-primary-fixed text-[11px] font-bold rounded-full shadow-sm">HẠNG VÀNG</span>
                </div>
                
                <div class="mt-6 flex justify-between items-end relative z-10">
                    <div>
                        <p class="text-white/60 text-[11px]">Mã số sinh viên</p>
                        <p class="font-mono text-sm tracking-wider font-bold">12345678</p>
                    </div>
                    <div class="text-right">
                        <p class="text-white/60 text-[11px]">Điểm tích lũy</p>
                        <p class="text-2xl font-black">1,250 <span class="text-xs font-normal">pts</span></p>
                    </div>
                </div>
            </div>

            <!-- Decision engine prompt banner (Call to action for screen 11) -->
            <div class="bg-gradient-to-r from-[#ffe9e2] to-[#fce3da] dark:from-[#3c2d28] dark:to-[#4e453b] p-5 rounded-2xl border border-outline-variant/30 dark:border-outline/20 relative overflow-hidden shadow-sm decision-engine-glow select-none">
                <div class="flex gap-4 items-center">
                    <div class="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0 shadow-md">
                        <span class="material-symbols-outlined text-2xl font-bold animate-bounce">psychology</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-on-surface text-base dark:text-white">Hôm nay ăn gì?</h4>
                        <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">Tiết kiệm thời gian suy nghĩ, để quán chọn cho bạn!</p>
                    </div>
                </div>
                <button class="mt-4 w-full squishy-button bg-primary text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all" onclick="window.location.hash = '#/decision'">
                    <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">bolt</span>
                    Quán Chọn Giúp Tôi (3 giây)
                </button>
            </div>

            <!-- Quick Actions Grid -->
            <div class="grid grid-cols-3 gap-3 select-none">
                <button class="squishy-button flex flex-col items-center justify-center p-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-all" onclick="window.location.hash = '#/menu'">
                    <span class="material-symbols-outlined text-primary text-2xl mb-1.5" style="font-variation-settings: 'FILL' 1;">restaurant_menu</span>
                    <span class="font-label-sm text-[11px] text-on-surface">Gọi món</span>
                </button>
                <button class="squishy-button flex flex-col items-center justify-center p-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-all" onclick="window.location.hash = '#/vouchers'">
                    <span class="material-symbols-outlined text-primary text-2xl mb-1.5" style="font-variation-settings: 'FILL' 1;">confirmation_number</span>
                    <span class="font-label-sm text-[11px] text-on-surface">Voucher</span>
                </button>
                <button class="squishy-button flex flex-col items-center justify-center p-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-all" onclick="window.location.hash = '#/notifications'">
                    <span class="material-symbols-outlined text-primary text-2xl mb-1.5" style="font-variation-settings: 'FILL' 1;">notifications</span>
                    <span class="font-label-sm text-[11px] text-on-surface">Thông báo</span>
                </button>
            </div>

            <!-- Active Vouchers Section -->
            <section class="space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">Voucher của bạn</h3>
                    <a class="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onclick="window.location.hash = '#/vouchers'">Xem tất cả</a>
                </div>
                
                <div class="grid gap-3">
                    ${activeVouchers.map(v => `
                        <div class="relative overflow-hidden flex bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-xl shadow-sm hover:shadow-md transition-all group select-none">
                            <div class="w-16 ${v.type === 'Giảm' ? 'bg-primary-container' : 'bg-tertiary-container'} flex flex-col items-center justify-center text-white p-1 shrink-0">
                                <span class="material-symbols-outlined text-2xl mb-0.5">${v.icon}</span>
                                <span class="text-[9px] font-bold uppercase">${v.type}</span>
                                <span class="text-sm font-black">${v.valueText}</span>
                            </div>
                            <div class="p-3 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 class="font-bold text-sm text-on-surface leading-snug dark:text-white">${v.title}</h4>
                                    <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">${v.condition} • HSD: ${v.expiry}</p>
                                </div>
                                <button class="mt-2 self-end bg-primary-container hover:bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full active:scale-95 transition-transform" onclick="window.applyVoucher('${v.id}')">Dùng ngay</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Popular Items banner slider mock -->
            <section class="space-y-3">
                <h3 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">Khuyến mãi cực hot</h3>
                <div class="relative overflow-hidden rounded-2xl bg-surface-container-high dark:bg-surface-dim border border-outline-variant/30 h-32 select-none cursor-pointer" onclick="window.location.hash = '#/menu'">
                    <img class="absolute inset-0 w-full h-full object-cover brightness-[0.7] hover:scale-105 transition-all duration-500" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80" alt="Hot deal background">
                    <div class="absolute inset-0 p-4 flex flex-col justify-between text-white pointer-events-none">
                        <span class="self-start px-2 py-0.5 bg-status-red text-[10px] font-black uppercase rounded-lg shadow-sm">Độc quyền</span>
                        <div>
                            <h4 class="font-black text-lg">Giờ Vàng Sinh Viên</h4>
                            <p class="text-[11px] text-white/80">Khung giờ 14h - 17h: Trà sữa giảm giá đồng loạt còn 15.000đ</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;
}
