// Component: Drawer
// Renders the side drawer navigation with profile info and a working Dark Mode switch

export function renderDrawer(state) {
    const isDark = state.theme === 'dark';
    
    return `
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/50 z-[55] hidden transition-opacity duration-300" id="drawer-overlay" onclick="window.toggleDrawer()"></div>
        
        <!-- Sidebar Navigation Drawer -->
        <aside class="fixed inset-y-0 left-0 z-[60] flex flex-col p-stack-lg bg-surface dark:bg-inverse-surface h-full w-80 rounded-r-xl shadow-2xl -translate-x-full transition-transform duration-300 border-r border-outline-variant/10" id="nav-drawer">
            <!-- Header Profile Info -->
            <div class="flex flex-col gap-4 mb-8">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full overflow-hidden bg-primary-container border-2 border-primary shadow-sm shrink-0">
                        <img class="w-full h-full object-cover" alt="Student Profile Picture" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80">
                    </div>
                    <div>
                        <h2 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">Nguyễn Văn A</h2>
                        <p class="text-sm text-on-surface-variant dark:text-secondary-fixed-dim">MSSV: 12345678</p>
                        <div class="flex gap-1.5 items-center mt-1">
                            <span class="inline-block px-2 py-0.5 bg-status-yellow text-on-primary-fixed text-xs font-bold rounded-full select-none shadow-sm">Hạng Vàng</span>
                            <span class="text-xs text-primary font-bold dark:text-primary-fixed-dim">🌟 1,250 Điểm</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Navigation Links -->
            <nav class="flex flex-col gap-2 flex-grow">
                <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/orders" onclick="window.toggleDrawer()">
                    <span class="material-symbols-outlined" data-icon="history">history</span>
                    <span class="font-body-md text-sm">Lịch sử đặt quà</span>
                </a>
                <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/profile" onclick="window.toggleDrawer()">
                    <span class="material-symbols-outlined" data-icon="stars">stars</span>
                    <span class="font-body-md text-sm">Ví điểm thưởng</span>
                </a>
                <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/profile" onclick="window.toggleDrawer()">
                    <span class="material-symbols-outlined" data-icon="map">map</span>
                    <span class="font-body-md text-sm">Địa chỉ đã lưu</span>
                </a>
                <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/profile" onclick="window.toggleDrawer()">
                    <span class="material-symbols-outlined" data-icon="support_agent">support_agent</span>
                    <span class="font-body-md text-sm">Trung tâm hỗ trợ</span>
                </a>
                
                <!-- Divider and Settings -->
                <div class="border-t border-outline-variant/30 dark:border-outline/30 mt-4 pt-4 flex flex-col gap-2">
                    <!-- Theme Toggle Switch (Dark Mode) -->
                    <div class="flex items-center justify-between p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim">
                        <div class="flex items-center gap-4">
                            <span class="material-symbols-outlined" id="theme-icon">${isDark ? 'dark_mode' : 'light_mode'}</span>
                            <span class="font-body-md text-sm select-none">Chế độ tối</span>
                        </div>
                        <button class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDark ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}" 
                                id="theme-switch" role="switch" aria-checked="${isDark}" onclick="window.toggleTheme()">
                            <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDark ? 'translate-x-5' : 'translate-x-0'}"></span>
                        </button>
                    </div>

                    <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/profile" onclick="window.toggleDrawer()">
                        <span class="material-symbols-outlined" data-icon="settings">settings</span>
                        <span class="font-body-md text-sm">Cài đặt</span>
                    </a>
                </div>

                <!-- Logout -->
                <button class="flex items-center gap-4 p-3 rounded-lg text-error hover:bg-error-container/30 active:opacity-70 transition-colors mt-auto text-left w-full" onclick="window.handleLogout()">
                    <span class="material-symbols-outlined" data-icon="logout">logout</span>
                    <span class="font-body-md text-sm font-semibold">Đăng xuất</span>
                </button>
            </nav>
        </aside>
    `;
}
