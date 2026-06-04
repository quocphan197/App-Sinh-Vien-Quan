// Component: Orders Screen
// Renders active and past order history cards, tracking preparation states

export function renderOrders(state) {
    const activeOrders = state.orders.filter(o => o.status !== 'completed');
    const completedOrders = state.orders.filter(o => o.status === 'completed');

    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <!-- Page Title -->
            <div class="mb-6 select-none">
                <h2 class="font-section-title-mobile text-section-title-mobile text-on-surface dark:text-white mb-1.5">Đơn hàng của bạn</h2>
                <p class="font-body-md text-sm text-on-surface-variant dark:text-secondary-fixed-dim">Theo dõi tiến độ chuẩn bị món ăn tại quầy số 3.</p>
            </div>

            <!-- Active Orders -->
            <section class="mb-8">
                <h3 class="font-bold text-[16px] text-primary dark:text-primary-fixed-dim mb-4 select-none">Đơn hàng đang chế biến</h3>
                
                <div class="grid gap-4">
                    ${activeOrders.length === 0 ? `
                        <!-- Empty Active State -->
                        <div class="p-8 border border-dashed border-outline-variant dark:border-outline/30 rounded-2xl flex flex-col items-center text-center opacity-60">
                            <span class="material-symbols-outlined text-4xl mb-2 text-outline">receipt_long</span>
                            <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim font-medium">Bạn không có đơn hàng nào đang chế biến.</p>
                            <button class="mt-4 bg-primary-container text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-primary transition-all squishy-button" onclick="window.location.hash = '#/menu'">Đặt món ngay</button>
                        </div>
                    ` : activeOrders.map(order => {
                        let statusColor = 'text-status-yellow';
                        let percentage = '30%';
                        let statusDesc = 'Đang chế biến';

                        if (order.step === 1) {
                            statusColor = 'text-status-yellow';
                            percentage = '15%';
                            statusDesc = 'Đang chuẩn bị nguyên liệu';
                        } else if (order.step === 2) {
                            statusColor = 'text-primary-container';
                            percentage = '60%';
                            statusDesc = 'Đang nấu trên bếp';
                        } else if (order.step === 3) {
                            statusColor = 'text-status-green';
                            percentage = '95%';
                            statusDesc = 'Đang chờ nhận tại Quầy số 3';
                        }

                        return `
                            <!-- Active Order Card -->
                            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-xl p-4 shadow-sm space-y-3">
                                <div class="flex justify-between items-start pb-2 border-b border-outline-variant/10">
                                    <div>
                                        <span class="text-xs font-mono font-bold text-on-surface-variant dark:text-secondary-fixed-dim">${order.id}</span>
                                        <h4 class="font-bold text-sm text-on-surface dark:text-white mt-1">${order.itemName}</h4>
                                    </div>
                                    <span class="text-xs font-bold ${statusColor}">${statusDesc}</span>
                                </div>
                                
                                <div class="space-y-1">
                                    <div class="flex justify-between text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim font-semibold">
                                        <span>Tiến độ món ăn</span>
                                        <span>${percentage}</span>
                                    </div>
                                    <!-- Progress bar -->
                                    <div class="w-full bg-surface-container-low dark:bg-black/20 h-2 rounded-full overflow-hidden">
                                        <div class="bg-primary-container h-full rounded-full transition-all duration-1000" style="width: ${percentage}"></div>
                                    </div>
                                </div>
                                
                                <div class="flex justify-between items-center text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim pt-2">
                                    <span>Thời gian đặt: ${order.time}</span>
                                    <span class="font-bold text-primary dark:text-primary-fixed-dim">${order.price.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>

            <!-- Past Orders -->
            <section class="mb-6">
                <h3 class="font-bold text-[16px] text-on-surface-variant dark:text-secondary-fixed-dim mb-4 opacity-75 select-none">Đơn hàng đã nhận</h3>
                
                <div class="grid gap-4 select-none">
                    ${completedOrders.map(order => `
                        <!-- Completed Order Card -->
                        <div class="bg-surface-container-low dark:bg-surface-variant/10 border border-outline-variant/20 rounded-xl p-4 flex justify-between items-center opacity-80">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-mono font-semibold text-on-surface-variant">${order.id}</span>
                                    <span class="px-1.5 py-0.5 bg-status-green/10 text-status-green border border-status-green/20 rounded text-[9px] font-bold">Thành công</span>
                                </div>
                                <h4 class="font-bold text-sm text-on-surface dark:text-white mt-1.5">${order.itemName}</h4>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">Thời gian: ${order.time}</p>
                            </div>
                            <div class="text-right">
                                <span class="font-black text-xs text-on-surface dark:text-white block">${order.price.toLocaleString('vi-VN')}đ</span>
                                <button class="mt-2 text-[10px] font-bold border border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim px-2.5 py-1 rounded-full active:scale-95 transition-all squishy-button" onclick="window.reorderItem('${order.id}')">Đặt lại</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
}
