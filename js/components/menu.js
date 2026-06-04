// Component: Menu Screen
// Renders a beautiful food and drink catalog with searching, categories filtering, cart management, and voucher application checkout

import { combos, singleItems } from '../database.js';
import { calcCartSubtotal, calcVoucherDiscount } from '../pricing.js';

export function renderMenu(state) {
    const activeCategory = state.menuFilter || 'all';
    const searchQuery = (state.menuSearch || '').toLowerCase().trim();

    // Compile items list
    let allItems = [];
    
    // Convert combos into product format
    if (activeCategory === 'all' || activeCategory === 'combos') {
        combos.forEach(c => {
            allItems.push({
                id: c.id,
                name: c.name,
                subtitle: c.dishName,
                price: c.price,
                image: c.image,
                isCombo: true,
                category: 'combos'
            });
        });
    }

    // Convert single items
    singleItems.forEach(item => {
        if (activeCategory === 'all' || activeCategory === item.category) {
            allItems.push({
                id: item.id,
                name: item.name,
                subtitle: item.category === 'food' ? 'Món ăn chính' : 'Nước giải nhiệt',
                price: item.price,
                image: item.image,
                isCombo: false,
                category: item.category
            });
        });
    });

    // Apply search filter
    if (searchQuery) {
        allItems = allItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery) || 
            (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery))
        );
    }

    const cartCount = Object.values(state.cart).reduce((sum, q) => sum + q, 0);
    const cartTotal = calcCartSubtotal(state.cart);
    const { discount } = calcVoucherDiscount(state.cart, state.appliedVoucherCode);
    const finalTotal = Math.max(0, cartTotal - discount);

    return `
        <div class="pt-16 pb-24 animate-fade-in select-none">
            <!-- Search bar -->
            <div class="mb-4 relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-secondary-fixed-dim text-[20px]">search</span>
                <input class="w-full pl-10 pr-4 py-2.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/10 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface dark:text-white" 
                       id="menu-search-input" placeholder="Tìm món ngon sinh viên..." value="${state.menuSearch || ''}"
                       oninput="window.handleMenuSearch(this.value)">
                ${state.menuSearch ? `
                    <button class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant" onclick="window.handleMenuSearch(''); document.getElementById('menu-search-input').value=''">close</button>
                ` : ''}
            </div>

            <!-- Categories Tabs -->
            <div class="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
                <button class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all squishy-button ${activeCategory === 'all' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant dark:text-white'}" onclick="window.filterMenu('all')">Tất cả</button>
                <button class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all squishy-button ${activeCategory === 'combos' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant dark:text-white'}" onclick="window.filterMenu('combos')">Combo Tiết Kiệm</button>
                <button class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all squishy-button ${activeCategory === 'food' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant dark:text-white'}" onclick="window.filterMenu('food')">Món ăn chính</button>
                <button class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all squishy-button ${activeCategory === 'drink' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant dark:text-white'}" onclick="window.filterMenu('drink')">Nước uống</button>
            </div>

            <!-- Menu Grid -->
            <div class="mt-4 grid grid-cols-2 gap-3">
                ${allItems.length === 0 ? `
                    <div class="col-span-2 py-12 text-center opacity-60 flex flex-col items-center">
                        <span class="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
                        <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">Không tìm thấy món ăn phù hợp với bộ lọc.</p>
                    </div>
                ` : allItems.map(item => {
                    const quantity = state.cart[item.id] || 0;
                    return `
                        <!-- Menu Item Card -->
                        <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/20 dark:border-outline/10 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group transition-all">
                            <div class="h-32 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${item.image}">
                                ${item.isCombo ? `
                                    <span class="absolute top-2 left-2 bg-status-red text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">COMBO</span>
                                ` : ''}
                            </div>
                            
                            <div class="p-3 flex-1 flex flex-col justify-between">
                                <div class="mb-2">
                                    <h4 class="font-bold text-xs leading-snug text-on-surface dark:text-white line-clamp-1">${item.name}</h4>
                                    <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim line-clamp-1 mt-0.5">${item.subtitle}</p>
                                </div>
                                
                                <div class="flex justify-between items-center mt-auto pt-2 border-t border-outline-variant/10">
                                    <span class="text-xs font-black text-primary dark:text-primary-fixed-dim">${item.price.toLocaleString('vi-VN')}đ</span>
                                    
                                    ${quantity > 0 ? `
                                        <!-- Interactive Quantity Selector -->
                                        <div class="flex items-center gap-2">
                                            <button class="w-6 h-6 rounded-full border border-primary text-primary flex items-center justify-center font-bold active:scale-90 transition-transform hover:bg-primary/5 shrink-0 select-none" onclick="window.updateCartQuantity('${item.id}', -1)">-</button>
                                            <span class="text-xs font-bold text-on-surface dark:text-white min-w-[12px] text-center select-none">${quantity}</span>
                                            <button class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold active:scale-90 transition-transform hover:bg-primary-container shrink-0 select-none" onclick="window.updateCartQuantity('${item.id}', 1)">+</button>
                                        </div>
                                    ` : `
                                        <!-- Add Button -->
                                        <button class="squishy-button w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center hover:bg-primary shadow-sm" onclick="window.updateCartQuantity('${item.id}', 1)">
                                            <span class="material-symbols-outlined text-[18px]">add</span>
                                        </button>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Floating Cart Bar (Rendered if items are in cart) -->
            ${cartCount > 0 ? `
                <div class="fixed bottom-16 left-0 w-full px-4 py-3 bg-surface-container-lowest/90 dark:bg-inverse-surface/95 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40 transition-all select-none animate-slide-up">
                    <div class="max-w-md mx-auto flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <span class="material-symbols-outlined text-primary text-3xl">shopping_bag</span>
                                <span class="absolute -top-1 -right-1 bg-status-red text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm badge-pulse">${cartCount}</span>
                            </div>
                            <div>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim">Tổng thanh toán</p>
                                <div class="flex items-center gap-1.5">
                                    <p class="text-base font-black text-primary dark:text-primary-fixed-dim">${finalTotal.toLocaleString('vi-VN')}đ</p>
                                    ${discount > 0 ? `
                                        <span class="px-1.5 py-0.5 bg-status-red/10 text-status-red rounded text-[9px] font-bold border border-status-red/20">-${discount.toLocaleString('vi-VN')}đ</span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <button class="squishy-button bg-primary-container hover:bg-primary text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs flex items-center gap-1.5" onclick="window.checkoutCart()">
                            Đặt Hàng Ngay
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}
