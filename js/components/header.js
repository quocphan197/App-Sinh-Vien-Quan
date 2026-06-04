// Component: Header
// Renders the top app bar dynamically based on current route and unread notification count

export function renderHeader(state) {
    const isMainPage = ['#/home', '#/vouchers', '#/menu', '#/orders', '#/profile'].includes(state.currentRoute) || !state.currentRoute || state.currentRoute === '#/';
    
    let headerHTML = '';

    if (isMainPage) {
        // Main page header with location and burger menu
        const unreadCount = state.notifications.filter(n => n.unread).length;
        const badgeHTML = unreadCount > 0 
            ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-status-red rounded-full border border-surface badge-pulse"></span>` 
            : '';

        headerHTML = `
            <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-14 bg-surface-container-low dark:bg-surface-dim border-b border-outline-variant/10 shadow-sm transition-colors duration-300">
                <div class="flex items-center gap-2 cursor-pointer" onclick="window.location.hash = '#/home'">
                    <span class="material-symbols-outlined text-primary" data-icon="location_on">location_on</span>
                    <h1 class="font-hero-mobile text-[24px] leading-tight text-primary font-bold">Sinh Viên Quán</h1>
                </div>
                <div class="flex items-center gap-4">
                    <button class="relative material-symbols-outlined text-on-surface-variant hover:text-primary hover:scale-105 active:scale-95 transition-transform" data-icon="notifications" onclick="window.location.hash = '#/notifications'">
                        notifications
                        ${badgeHTML}
                    </button>
                    <button class="material-symbols-outlined text-on-surface-variant hover:text-primary hover:scale-105 active:scale-95 transition-transform" data-icon="menu" onclick="window.toggleDrawer()">
                        menu
                    </button>
                </div>
            </header>
        `;
    } else {
        // Sub-page header with back button (e.g. notifications page)
        let pageTitle = "Sinh Viên Quán";
        if (state.currentRoute === '#/notifications') pageTitle = "Thông báo";
        if (state.currentRoute === '#/decision') pageTitle = "Quán Chọn Giúp";

        headerHTML = `
            <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-14 bg-surface-container-low dark:bg-surface-dim border-b border-outline-variant/10 shadow-sm transition-colors duration-300">
                <div class="flex items-center gap-stack-sm">
                    <button class="active:scale-95 transition-transform text-on-surface hover:text-primary p-1 rounded-full hover:bg-surface-variant/30 flex items-center justify-center" onclick="window.history.back()">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 class="font-section-title-mobile text-section-title-mobile text-primary font-extrabold text-[20px] ml-1">${pageTitle}</h1>
                </div>
                ${state.currentRoute === '#/notifications' ? `
                    <button class="active:scale-95 transition-transform text-on-surface hover:text-primary hover:opacity-80 p-1 rounded-full hover:bg-surface-variant/30 flex items-center justify-center" onclick="window.markAllNotificationsRead()" title="Đọc tất cả">
                        <span class="material-symbols-outlined">done_all</span>
                    </button>
                ` : '<div></div>'}
            </header>
        `;
    }

    return headerHTML;
}
