// Component: Profile Screen
// Renders the student loyalty card details, points balance history, and saved address book

export function renderProfile(state) {
    const pointTransactions = [
        { desc: "Tích điểm đơn hàng SVQ-024", pts: "+50", date: "Vừa xong" },
        { desc: "Bình luận đánh giá Combo Kịp Tiết", pts: "+10", date: "Hôm qua" },
        { desc: "Thưởng sinh nhật Nguyễn Văn A", pts: "+200", date: "15/05/2026" },
        { desc: "Tích điểm đơn hàng SVQ-023", pts: "+45", date: "12/05/2026" }
    ];

    const addresses = [
        { label: "Ký túc xá Khu B ĐHQG", desc: "Tòa B3, Phòng 502, Phường Linh Trung, Thủ Đức", isDefault: true },
        { label: "Thư viện Trung tâm ĐHQG", desc: "Khu bàn tự học lầu 2, Kế cửa sổ hướng hồ đá", isDefault: false }
    ];

    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <!-- Profile header card -->
            <div class="flex items-center gap-4 p-4 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-2xl shadow-sm mb-6 select-none">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-primary-container border-2 border-primary shadow-sm shrink-0">
                    <img class="w-full h-full object-cover" alt="Student Profile Picture" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80">
                </div>
                <div>
                    <h2 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">Nguyễn Văn A</h2>
                    <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">MSSV: 12345678 • Trường Đại học Bách Khoa</p>
                    <div class="flex gap-2 items-center mt-1">
                        <span class="px-2.5 py-0.5 bg-status-yellow text-on-primary-fixed text-[10px] font-black rounded-full shadow-sm">HẠNG VÀNG</span>
                        <span class="text-xs font-bold text-primary dark:text-primary-fixed-dim">1,250 PTS</span>
                    </div>
                </div>
            </div>

            <!-- Tier Level Progress -->
            <section class="mb-6 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-2xl p-4 shadow-sm space-y-3 select-none">
                <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-on-surface dark:text-white">Thăng hạng Kim Cương</span>
                    <span class="text-on-surface-variant dark:text-secondary-fixed-dim font-bold">1250 / 1500 PTS</span>
                </div>
                
                <!-- Progress bar -->
                <div class="w-full bg-surface-container-low dark:bg-black/20 h-2 rounded-full overflow-hidden">
                    <div class="bg-gradient-to-r from-primary to-primary-container h-full rounded-full" style="width: 83%"></div>
                </div>
                
                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim italic leading-relaxed">Đạt thêm 250 PTS để thăng hạng Kim Cương và nhận voucher giảm giá 50% miễn phí hàng tháng!</p>
            </section>

            <!-- Loyalty Point Transactions -->
            <section class="mb-6 select-none">
                <h3 class="font-bold text-[15px] text-primary dark:text-primary-fixed-dim mb-3">Lịch sử tích lũy</h3>
                <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-2xl p-3 divide-y divide-outline-variant/10">
                    ${pointTransactions.map(t => `
                        <div class="flex justify-between items-center py-2.5 first:pt-1 last:pb-1">
                            <div>
                                <h4 class="font-bold text-xs text-on-surface dark:text-white">${t.desc}</h4>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">${t.date}</p>
                            </div>
                            <span class="text-xs font-black text-status-green">${t.pts} PTS</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Saved Addresses -->
            <section class="mb-6 select-none">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold text-[15px] text-primary dark:text-primary-fixed-dim">Địa chỉ đã lưu</h3>
                    <button class="text-xs font-bold text-primary hover:text-primary-container shrink-0 flex items-center gap-0.5" onclick="window.addMockAddress()">
                        <span class="material-symbols-outlined text-sm">add</span> Thêm
                    </button>
                </div>
                
                <div class="grid gap-3" id="address-list-root">
                    ${addresses.map(a => `
                        <div class="p-3 border border-outline-variant/30 dark:border-outline/10 bg-surface-container-lowest dark:bg-surface-dim rounded-xl flex gap-3 shadow-sm select-none">
                            <span class="material-symbols-outlined text-primary text-xl shrink-0">location_on</span>
                            <div class="flex-grow space-y-1">
                                <div class="flex items-center gap-2">
                                    <h4 class="font-bold text-xs text-on-surface dark:text-white">${a.label}</h4>
                                    ${a.isDefault ? `<span class="px-1.5 py-0.5 bg-status-green/10 text-status-green border border-status-green/20 rounded text-[9px] font-bold shrink-0">Mặc định</span>` : ''}
                                </div>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">${a.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
}
