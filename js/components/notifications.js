// Component: Notifications Screen (Screen 27)
// Renders the notifications hub with activity and promotional tabs, live unread counters, and custom back buttons

export function renderNotifications(state) {
    const activeTab = state.notificationTab || 'hoat-dong';
    
    // Filter based on tab selection
    const notificationsList = state.notifications.filter(n => n.type === activeTab);

    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <!-- Tab Navigation (Sticky below header) -->
            <div class="sticky top-14 -mx-margin-mobile z-40 bg-surface dark:bg-inverse-surface border-b border-outline-variant/30 dark:border-outline/20 transition-all duration-300">
                <div class="flex w-full">
                    <button class="flex-1 py-4 text-center font-bold text-sm transition-all relative ${activeTab === 'hoat-dong' ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant dark:text-secondary-fixed-dim'}" 
                            onclick="window.switchNotificationTab('hoat-dong')">
                        Hoạt động
                        <div class="absolute bottom-0 left-0 w-full h-1 rounded-t-full transition-all duration-300 ${activeTab === 'hoat-dong' ? 'bg-primary dark:bg-primary-fixed-dim' : 'bg-transparent'}"></div>
                    </button>
                    <button class="flex-1 py-4 text-center font-bold text-sm transition-all relative ${activeTab === 'uu-dai' ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant dark:text-secondary-fixed-dim'}" 
                            onclick="window.switchNotificationTab('uu-dai')">
                        Ưu đãi
                        <div class="absolute bottom-0 left-0 w-full h-1 rounded-t-full transition-all duration-300 ${activeTab === 'uu-dai' ? 'bg-primary dark:bg-primary-fixed-dim' : 'bg-transparent'}"></div>
                    </button>
                </div>
            </div>

            <!-- Notifications List -->
            <div class="py-5 space-y-4" id="notification-list-container">
                ${notificationsList.length === 0 ? `
                    <div class="py-12 text-center opacity-60 flex flex-col items-center">
                        <span class="material-symbols-outlined text-5xl mb-3 text-outline">notifications_off</span>
                        <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">Không có thông báo nào trong hộp thư của bạn.</p>
                    </div>
                ` : notificationsList.map(n => {
                    const unreadClass = n.unread 
                        ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/20 dark:bg-primary-fixed/5' 
                        : 'border-outline-variant/30 dark:border-outline/10 bg-surface-container-low dark:bg-surface-dim';
                    
                    return `
                        <!-- Notification Item -->
                        <div class="p-4 rounded-xl flex gap-4 border ${unreadClass} relative active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                             onclick="window.readNotification('${n.id}')">
                            
                            <!-- Icon / Image Left -->
                            ${n.icon === 'coupon_image' ? `
                                <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/30">
                                    <img alt="Promo" class="w-full h-full object-cover" src="${n.image}">
                                </div>
                            ` : `
                                <div class="w-12 h-12 rounded-full ${n.iconBg || 'bg-primary-fixed'} flex items-center justify-center flex-shrink-0 text-2xl">
                                    <span class="material-symbols-outlined ${n.iconColor || 'text-primary'}" style="font-variation-settings: 'FILL' 1;">${n.icon}</span>
                                </div>
                            `}

                            <!-- Detail Content -->
                            <div class="flex-grow space-y-2">
                                <div class="flex justify-between items-start">
                                    <h3 class="font-bold text-sm text-on-surface dark:text-white leading-snug">${n.title}</h3>
                                    <span class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim shrink-0 ml-2 font-medium">${n.time}</span>
                                </div>
                                <p class="text-on-surface-variant dark:text-secondary-fixed-dim text-xs leading-relaxed">${n.desc}</p>
                                
                                ${n.actionText ? `
                                    <button class="px-3.5 py-1 text-[11px] font-bold border border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim rounded-full hover:bg-primary/5 active:scale-95 transition-all mt-1"
                                            onclick="event.stopPropagation(); window.handleNotificationAction('${n.actionHash}', '${n.id}')">
                                        ${n.actionText}
                                    </button>
                                ` : ''}
                            </div>

                            <!-- Unread dot indicator -->
                            ${n.unread ? `
                                <span class="absolute top-4 right-4 w-2 h-2 bg-status-red rounded-full shadow-sm badge-pulse"></span>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}
