/* SVG fallback paths for the 2 missing icons (Sofía + Eloy) */
const SVG_FALLBACK = {
    sofia: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M50 14 C58 14 64 22 60 30 C68 30 73 38 68 46 C75 50 73 60 64 62 C66 70 58 76 50 72 C42 78 34 72 36 64 C28 64 22 56 26 48 C20 44 22 34 30 32 C28 24 36 16 44 20 C46 14 50 14 50 14 Z"/>
    <circle cx="50" cy="46" r="3" fill="currentColor"/>
  </g></svg>`,
    eloy: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 50 L48 14 L78 50 Z" />
    <path d="M24 60 q4 -8 10 0 q4 8 10 0 q4 -8 10 0 q4 8 10 0 q4 -8 10 0"/>
  </g></svg>`
};

/* ----- BUILD PERSONAJES GRID ----- */
(async () => {
    let PERSONAJES;
    try {
        const res = await fetch('personajes.json');
        if (!res.ok) throw new Error(res.status);
        PERSONAJES = await res.json();
    } catch (err) {
        console.error('No se pudo cargar personajes.json:', err);
        return;
    }

    const grid = document.getElementById('personaGrid');
    PERSONAJES.forEach((p, i) => {
        const el = document.createElement('div');
        el.className = 'persona';
        el.style.setProperty('--c', p.color);
        const num = String(i + 1).padStart(2, '0');

        let bgIconMarkup, tileMarkup;
        if (p.has) {
            bgIconMarkup = `<div class="persona__icon-bg" style="-webkit-mask-image:var(--i-${p.id});mask-image:var(--i-${p.id})"></div>`;
            tileMarkup = `<div class="persona__icon-tile" style="-webkit-mask-image:var(--i-${p.id});mask-image:var(--i-${p.id});background:${p.color}"></div>`;
        } else {
            bgIconMarkup = `<div class="persona__icon-bg" style="-webkit-mask:none;mask:none;display:flex;align-items:flex-end;justify-content:center;color:rgba(31,29,26,.18);background:transparent"><div style="width:75%;height:75%">${SVG_FALLBACK[p.id]}</div></div>`;
            tileMarkup = `<div class="persona__icon-tile" style="-webkit-mask:none;mask:none;background:transparent;display:flex;align-items:center;justify-content:center;color:${p.color}">${SVG_FALLBACK[p.id]}</div>`;
        }

        el.innerHTML = `
        ${bgIconMarkup}
        <span class="persona__num">${num}</span>
        ${tileMarkup}
        <div class="persona__text">
          <div class="persona__name">${p.name}</div>
          <div class="persona__pastry">${p.pastry}</div>
          <div class="persona__city">${p.city}</div>
          <div class="persona__quote">${p.quote}</div>
        </div>
      `;
        grid.appendChild(el);
    });
})();

/* ----- HERO TITLE: stagger char rise ----- */
const heroTitle = document.getElementById('heroTitle');
const text = heroTitle.textContent;
heroTitle.innerHTML = '';
text.split('').forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch;
    s.style.animationDelay = (i * 0.04) + 's';
    heroTitle.appendChild(s);
});

/* ----- CUSTOM CURSOR ----- */
const cursor = document.getElementById('cursor');
const label = document.getElementById('cursor-label');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let cx = mx, cy = my;

window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function tick() {
    cx += (mx - cx) * 0.22;
    cy += (my - cy) * 0.22;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    label.style.transform = label.classList.contains('show')
        ? `translate(${mx + 22}px, ${my + 22}px) scale(1)`
        : `translate(${mx + 22}px, ${my + 22}px) scale(0)`;
    requestAnimationFrame(tick);
}
tick();

/* Cursor states */
function setCursorMode(mode, txt) {
    cursor.classList.toggle('hover', !!mode);
    if (txt) { label.textContent = txt; label.classList.add('show'); }
    else { label.classList.remove('show'); }
}

document.querySelectorAll('a, button, .persona, .city, .manifiesto__item, .product, .pdv__row, .faq__item summary, input').forEach(el => {
    el.addEventListener('mouseenter', () => {
        setCursorMode(true, el.dataset.cursor || null);
    });
    el.addEventListener('mouseleave', () => setCursorMode(null));
});

/* ----- HEADER: scroll-spy + section-aware theme ----- */
const header = document.getElementById('header');
const navLinks = document.querySelectorAll('.header__nav a');
const sectionIds = ['concepto', 'origen', 'personajes', 'packaging', 'tienda', 'puntos', 'manifiesto', 'info'];
const watchSections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

// Detect which section currently occupies the middle of the viewport
const spyIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const id = e.target.id;
            navLinks.forEach(a => a.classList.toggle('is-active', a.dataset.section === id));
            const isDark = e.target.matches('.origen, .manifiesto');
            header.classList.toggle('is-dark', isDark);
            document.getElementById('backToTop')?.classList.toggle('is-dark', isDark);
        }
    });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

watchSections.forEach(s => spyIO.observe(s));

// "is-scrolled" once the hero is past
const heroEl = document.getElementById('hero');
const scrolledIO = new IntersectionObserver(([e]) => {
    header.classList.toggle('is-scrolled', !e.isIntersecting);
}, { rootMargin: '-72px 0px 0px 0px', threshold: 0 });
scrolledIO.observe(heroEl);

/* ----- REVEAL ON SCROLL ----- */
const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
        }
    });
}, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ----- HIDE NATIVE CURSOR ON ALL CHILDREN (extra safety) ----- */
// (Already covered via *,a,button,input cursor:none in CSS)

/* ----- BACK TO TOP: mostrar al salir del hero ----- */
const backToTop = document.getElementById('backToTop');
if (backToTop && heroEl) {
    const backIO = new IntersectionObserver(([e]) => {
        backToTop.classList.toggle('is-visible', !e.isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 });
    backIO.observe(heroEl);
}