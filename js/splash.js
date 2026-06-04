// Splash → Onboarding → App (inside phone frame)

const ONBOARDED_KEY = 'svq_onboarded';

function enterApp(hash = '#/home') {
    try {
        localStorage.setItem(ONBOARDED_KEY, '1');
    } catch (e) {
        /* ignore */
    }
    window.location.href = `app.html${hash}`;
}

function setupRippleFeedback() {
    const frame = document.getElementById('splash-phone');
    const stage = document.getElementById('splash-stage');
    const host = stage || frame;
    if (!host) return;

    host.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;

        const bounds = host.getBoundingClientRect();
        const circle = document.createElement('div');
        circle.className = 'splash-ripple';
        circle.style.left = `${e.clientX - bounds.left - 10}px`;
        circle.style.top = `${e.clientY - bounds.top - 10}px`;
        host.appendChild(circle);

        requestAnimationFrame(() => {
            circle.style.transform = 'scale(4)';
            circle.style.opacity = '0';
        });

        setTimeout(() => circle.remove(), 500);
    });
}

function runSplashSequence() {
    const splash = document.getElementById('splash-container');
    const onboarding = document.getElementById('onboarding-layer');
    if (!splash || !onboarding) return;

    setTimeout(() => {
        splash.style.opacity = '1';
        splash.style.transform = 'translateY(0)';
    }, 100);

    // Make splash screen interactive
    splash.style.cursor = 'pointer';

    // Pulsing helper text to guide user to tap
    const tapToContinue = document.createElement('p');
    tapToContinue.className = 'font-label-sm text-[11px] text-white/55 uppercase tracking-widest mt-12 animate-pulse splash-reveal';
    tapToContinue.textContent = 'Chạm màn hình để tiếp tục';
    splash.appendChild(tapToContinue);

    const transitionToOnboarding = () => {
        splash.style.opacity = '0';
        splash.style.transform = 'translateY(-16px)';

        setTimeout(() => {
            onboarding.classList.add('is-visible');
        }, 300);
    };

    // Transition only when user clicks/taps
    splash.addEventListener('click', transitionToOnboarding);
}

document.addEventListener('DOMContentLoaded', () => {
    // For prototype testing, clear onboarded state and comment out automatic app entry
    try {
        localStorage.removeItem(ONBOARDED_KEY);
    } catch (e) {}

    /*
    try {
        if (localStorage.getItem(ONBOARDED_KEY) === '1') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('splash') !== '1') {
                enterApp('#/home');
                return;
            }
        }
    } catch (e) {
        // continue with splash
    }
    */

    setupRippleFeedback();
    runSplashSequence();

    document.getElementById('btn-start')?.addEventListener('click', () => enterApp('#/home'));
    document.getElementById('btn-login')?.addEventListener('click', () => enterApp('#/profile'));
});
