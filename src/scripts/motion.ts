import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isApp = document.documentElement.hasAttribute('data-app');
const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));

/* ── Header: sólido al bajar + menú móvil ─────────────────────── */
const header = document.getElementById('site-header')!;
const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement;
const menu = document.getElementById('menu')!;
const setSolid = () => header.setAttribute('data-solid', String(isApp || window.scrollY > 40));
setSolid();
window.addEventListener('scroll', setSolid, { passive: true });

let lenis: Lenis | undefined;
function toggleMenu(open: boolean) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  if (open) {
    menu.hidden = false;
    void menu.offsetHeight; // reflow para que la opacidad transicione
    header.dataset.open = 'true';
  } else {
    header.dataset.open = 'false';
    window.setTimeout(() => { if (header.dataset.open !== 'true') menu.hidden = true; }, reduced ? 0 : 240);
  }
  document.documentElement.style.overflow = open ? 'hidden' : '';
  open ? lenis?.stop() : lenis?.start();
}
menuBtn.addEventListener('click', () => toggleMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
window.addEventListener('keydown', (e) => e.key === 'Escape' && toggleMenu(false));
window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => e.matches && toggleMenu(false));

/* ── Scroll suave (Lenis) sólo si el usuario acepta movimiento ── */
if (!reduced && !isApp) {
  lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ── Contadores ───────────────────────────────────────────────── */
$$('[data-count]').forEach((el) => {
  const end = Number(el.dataset.count);
  if (reduced) return void (el.textContent = String(end));
  const o = { v: 0 };
  ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => gsap.to(o, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(o.v))) }),
  });
});

if (!reduced) {
  /* ── Entrada del hero: un solo momento orquestado ──────────── */
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.1 });
  if (document.querySelector('.hero-line')) tl.fromTo('.hero-line > span', { yPercent: 105, opacity: 1 }, { yPercent: 0, duration: 1, stagger: 0.09 });
  if (document.querySelector('.hero-fade')) tl.to('.hero-fade', { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=0.55');

  /* ── Reveal al hacer scroll (bloques grandes, una sola vez) ── */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09, overwrite: true }),
  });

  /* ── Parallax suave de imágenes marcadas ───────────────────── */
  if (window.matchMedia('(min-width: 768px)').matches) {
    $$('[data-parallax]').forEach((el) =>
      gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement!, scrub: true, start: 'top bottom', end: 'bottom top' } }),
    );
  }
}

/* ── Videos: elige archivo según pantalla, respeta ahorro de datos y pausa fuera de vista ── */
const saveData = (navigator as any).connection?.saveData === true;
const smallScreen = window.matchMedia('(max-width: 767px)').matches;
$$<HTMLVideoElement>('video[data-src]').forEach((v) => {
  if (reduced || saveData) return; // queda el póster estático
  const src = smallScreen && v.dataset.srcMobile ? v.dataset.srcMobile : v.dataset.src!;
  const start = () => {
    v.src = src;
    v.muted = true;
    v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.15 });
    io.observe(v);
  };
  'requestIdleCallback' in window ? (window as any).requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300);
});

window.addEventListener('load', () => ScrollTrigger.refresh());
