// Component: Footer
// Renders the bottom navigation bar dynamically with active states and fill icons

export function renderFooter(state) {
    const route = state.currentRoute || '#/home';
    
    const tabs = [
        { id: 'home', hash: '#/home', label: 'Trang chủ', icon: 'home' },
        { id: 'menu', hash: '#/menu', label: 'Thực đơn', icon: 'restaurant_menu' },
        { id: 'orders', hash: '#/orders', label: 'Đơn hàng', icon: 'receipt_long' },
        { id: 'vouchers', hash: '#/vouchers', label: 'Ưu đãi', icon: 'confirmation_number' },
        { id: 'profile', hash: '#/profile', label: 'Cá nhân', icon: 'person' }
    ];

    const tabElements = tabs.map(tab => {
        const isActive = route === tab.hash || (tab.id === 'home' && (route === '#/' || !route));
        const activeClass = isActive 
            ? 'text-primary dark:text-primary-fixed-dim font-semibold scale-105' 
            : 'text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary';
        
        const fillSetting = isActive ? "style=\"font-variation-settings: 'FILL' 1;\"" : '';

        return `
            <a class="flex flex-col items-center justify-center gap-1 ${activeClass} transition-all duration-200 px-2 py-1 select-none" href="${tab.hash}">
                <span class="material-symbols-outlined text-[24px]" ${fillSetting}>${tab.icon}</span>
                <span class="font-label-sm text-[10px] whitespace-nowrap uppercase tracking-tighter">${tab.label}</span>
            </a>
        `;
    }).join('');

    return `
        <nav class="fixed bottom-0 left-0 w-full z-50 h-16 flex justify-around items-center bg-surface-container-lowest dark:bg-inverse-surface border-t border-surface-variant shadow-md px-1 pb-safe transition-colors duration-300">
            ${tabElements}
        </nav>
    `;
}
