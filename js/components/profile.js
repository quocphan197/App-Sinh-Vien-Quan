// Component: Profile Screen
// Renders the student loyalty card details, points balance history, and saved address book

export function renderAuthPage(state) {
    const activeTab = state.authTab || 'login';
    
    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <div class="text-center mb-6">
                <span class="material-symbols-outlined text-[64px] text-primary dark:text-primary-fixed-dim leading-none mb-2">account_circle</span>
                <h2 class="font-hero-mobile text-3xl text-primary dark:text-primary-fixed-dim">Sinh Viên Quán</h2>
                <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-1">Đăng nhập tài khoản để đặt món & tích điểm</p>
            </div>
            
            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 rounded-2xl p-5 shadow-sm space-y-4">
                <!-- Tabs -->
                <div class="flex border-b border-outline-variant/20 pb-2">
                    <button class="flex-1 text-center font-bold text-sm py-2 ${activeTab === 'login' ? 'text-primary border-b-2 border-primary dark:text-primary-fixed-dim dark:border-primary-fixed-dim' : 'text-on-surface-variant/60'}" onclick="window.setAuthTab('login')">
                        Đăng nhập
                    </button>
                    <button class="flex-1 text-center font-bold text-sm py-2 ${activeTab === 'register' ? 'text-primary border-b-2 border-primary dark:text-primary-fixed-dim dark:border-primary-fixed-dim' : 'text-on-surface-variant/60'}" onclick="window.setAuthTab('register')">
                        Đăng ký
                    </button>
                </div>
                
                ${activeTab === 'login' ? `
                    <!-- Login Form -->
                    <div class="space-y-4" id="login-form">
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Email sinh viên</label>
                            <input type="email" id="auth-email" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="name@student.edu.vn">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mật khẩu</label>
                            <input type="password" id="auth-password" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="••••••••">
                        </div>
                        <button class="w-full h-12 bg-primary hover:bg-primary-container text-white font-bold rounded-xl active:scale-[0.98] transition-transform text-xs shadow-md mt-2 flex items-center justify-center gap-2" onclick="window.submitAuthLogin()">
                            <span>Đăng nhập ngay</span>
                        </button>
                    </div>
                ` : `
                    <!-- Register Form -->
                    <div class="space-y-4" id="register-form">
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Họ và Tên</label>
                            <input type="text" id="reg-name" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="Nguyễn Văn A">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Email sinh viên</label>
                            <input type="email" id="reg-email" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="a.nv123@student.iuh.edu.vn">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mật khẩu (tối thiểu 6 ký tự)</label>
                            <input type="password" id="reg-password" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="••••••••">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mã số sinh viên (MSSV)</label>
                            <input type="text" id="reg-mssv" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="12345678">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Trường Đại học</label>
                            <input type="text" id="reg-univ" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" value="Trường Đại học Công Nghiệp - IUH">
                        </div>
                        <button class="w-full h-12 bg-primary hover:bg-primary-container text-white font-bold rounded-xl active:scale-[0.98] transition-transform text-xs shadow-md mt-2 flex items-center justify-center gap-2" onclick="window.submitAuthRegister()">
                            <span>Đăng ký tài khoản</span>
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

export function renderProfile(state) {
    if (!state.user) {
        return renderAuthPage(state);
    }
    
    const profile = state.profile || { name: "Người dùng IUH", mssv: "Chưa cập nhật", university: "Đại học Công Nghiệp - IUH", point_balance: 0 };
    const addresses = state.addresses || [];
    
    const pointTransactions = [
        { desc: "Chào mừng thành viên mới!", pts: "+0", date: "Vừa xong" }
    ];

    let tier = "HẠNG ĐỒNG";
    let badgeColor = "bg-gray-400 text-white";
    if (profile.point_balance >= 1500) {
        tier = "KIM CƯƠNG";
        badgeColor = "bg-status-red text-white";
    } else if (profile.point_balance >= 500) {
        tier = "HẠNG VÀNG";
        badgeColor = "bg-status-yellow text-on-primary-fixed";
    }

    const progressPercent = Math.min(100, (profile.point_balance / 1500) * 100);

    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <!-- Profile header card -->
            <div class="flex items-center gap-4 p-4 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-2xl shadow-sm mb-6 select-none">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-primary-container border-2 border-primary shadow-sm shrink-0 flex items-center justify-center text-white">
                    <span class="material-symbols-outlined text-4xl">account_circle</span>
                </div>
                <div>
                    <h2 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">${profile.name}</h2>
                    <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">MSSV: ${profile.mssv} • ${profile.university}</p>
                    <div class="flex gap-2 items-center mt-1">
                        <span class="px-2.5 py-0.5 ${badgeColor} text-[10px] font-black rounded-full shadow-sm">${tier}</span>
                        <span class="text-xs font-bold text-primary dark:text-primary-fixed-dim">${profile.point_balance} PTS</span>
                    </div>
                </div>
            </div>

            <!-- Tier Level Progress -->
            <section class="mb-6 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-2xl p-4 shadow-sm space-y-3 select-none">
                <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-on-surface dark:text-white">Thăng hạng Kim Cương</span>
                    <span class="text-on-surface-variant dark:text-secondary-fixed-dim font-bold">${profile.point_balance} / 1500 PTS</span>
                </div>
                
                <!-- Progress bar -->
                <div class="w-full bg-surface-container-low dark:bg-black/20 h-2 rounded-full overflow-hidden">
                    <div class="bg-gradient-to-r from-primary to-primary-container h-full rounded-full" style="width: ${progressPercent}%"></div>
                </div>
                
                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim italic leading-relaxed">Đạt thêm ${Math.max(0, 1500 - profile.point_balance)} PTS để thăng hạng Kim Cương và nhận voucher giảm giá 50% miễn phí hàng tháng!</p>
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
                    ${addresses.length === 0 ? `
                        <p class="text-xs text-on-surface-variant/60 text-center py-4">Chưa có địa chỉ nào được lưu.</p>
                    ` : addresses.map(a => `
                        <div class="p-3 border border-outline-variant/30 dark:border-outline/10 bg-surface-container-lowest dark:bg-surface-dim rounded-xl flex gap-3 shadow-sm select-none">
                            <span class="material-symbols-outlined text-primary text-xl shrink-0">location_on</span>
                            <div class="flex-grow space-y-1">
                                <div class="flex items-center gap-2">
                                    <h4 class="font-bold text-xs text-on-surface dark:text-white">${a.label}</h4>
                                    ${a.is_default ? `<span class="px-1.5 py-0.5 bg-status-green/10 text-status-green border border-status-green/20 rounded text-[9px] font-bold shrink-0">Mặc định</span>` : ''}
                                </div>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">${a.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Logout button -->
            <button class="w-full h-12 border border-outline-variant/50 text-on-surface hover:bg-surface-container-low font-bold rounded-xl active:scale-[0.98] transition-transform text-xs shadow-sm mt-4 flex items-center justify-center gap-2 dark:text-white dark:border-outline/20" onclick="window.handleSupabaseLogout()">
                <span class="material-symbols-outlined text-sm">logout</span>
                <span>Đăng xuất tài khoản</span>
            </button>
        </div>
    `;
}
