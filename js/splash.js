// Splash → Onboarding → App (inside phone frame)

const ONBOARDED_KEY = 'svq_onboarded';

// Initialize Supabase Client
let supabaseClient;
try {
    if (!window.CONFIG || !window.CONFIG.SUPABASE_URL || !window.CONFIG.SUPABASE_ANON_KEY) {
        throw new Error("Missing Supabase credentials in config.js");
    }
    supabaseClient = supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
} catch (e) {
    console.error("Supabase client initialization failed:", e);
    // Graceful fallback for offline/prototype mode
    supabaseClient = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: e }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        }
    };
}

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

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in via Supabase
    let loggedIn = false;
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            loggedIn = true;
        }
    } catch (e) {
        console.warn("Could not check Supabase auth status", e);
    }

    if (loggedIn) {
        enterApp('#/home');
        return;
    }

    // For prototype testing, clear onboarded state if splash URL parameter is present
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('splash') === '1') {
            localStorage.removeItem(ONBOARDED_KEY);
        } else if (localStorage.getItem(ONBOARDED_KEY) === '1') {
            enterApp('#/home');
            return;
        }
    } catch (e) {}

    setupRippleFeedback();
    runSplashSequence();

    document.getElementById('btn-start')?.addEventListener('click', () => enterApp('#/home'));
    document.getElementById('btn-login')?.addEventListener('click', () => enterApp('#/profile'));
});
