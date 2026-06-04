// Utility helper functions for Sinh Viên Quán app

// 1. Web Audio API Pleasant Synthesized Audio Effects
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

export function playClickSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
        console.warn("Audio Context blocked or not supported", e);
    }
}

export function playSuccessSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        
        // Play an ascending sweet chime (2 notes)
        const playNote = (freq, delay, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration);
        };
        
        playNote(523.25, 0, 0.15); // C5
        playNote(659.25, 0.08, 0.25); // E5
    } catch (e) {
        console.warn("Audio Context blocked", e);
    }
}

// 2. High Performance Toast Notification System
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-enter flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold pointer-events-auto backdrop-blur-md transition-all duration-300`;
    
    // Theme configurations
    if (type === 'success') {
        toast.className += ' bg-status-green/90 text-white border-status-green/20';
    } else if (type === 'info') {
        toast.className += ' bg-primary-container/90 text-white border-primary/20';
    } else {
        toast.className += ' bg-surface-container-high/90 text-on-surface border-outline-variant/30';
    }

    // Icon select
    let iconName = 'check_circle';
    if (type === 'info') iconName = 'info';
    else if (type === 'warning') iconName = 'warning';

    toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px] shrink-0">${iconName}</span>
        <span class="flex-grow">${message}</span>
    `;

    container.appendChild(toast);
    playClickSound();

    // Auto dismiss after 2.8 seconds
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// 3. Canvas Confetti Particles System
export function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Fit canvas bounds to app container
    const appContainer = document.getElementById('app-container');
    canvas.width = appContainer.clientWidth;
    canvas.height = appContainer.clientHeight;

    playSuccessSound();

    const colors = ['#f46b2a', '#a53c00', '#FBBF24', '#10B981', '#00658c'];
    const particles = [];

    // Create 60 colorful confetti pieces
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -10 - Math.random() * 20,
            r: 4 + Math.random() * 6,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0,
            w: 8 + Math.random() * 6,
            h: 4 + Math.random() * 4,
            speedY: 2 + Math.random() * 3,
            speedX: Math.random() * 2 - 1
        });
    }

    let animationFrameId;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let remaining = false;

        particles.forEach(p => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += p.speedY;
            p.x += p.speedX;
            p.tilt = Math.sin(p.tiltAngle) * 12;

            if (p.y < canvas.height) {
                remaining = true;
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            }
        });

        if (remaining) {
            animationFrameId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationFrameId);
        }
    }

    draw();
}
