/* ═══════════════════════════════════════════════
   GS9 — Interactions
   ═══════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────── Catálogo ─────────── */
const ART = {
  chain: `<svg viewBox="0 0 200 200" fill="none" stroke="url(#gsGold)" stroke-width="2">
    <path d="M40 52Q100 180 160 52"/>
    <circle cx="40" cy="52" r="4"/><circle cx="160" cy="52" r="4"/>
    <circle cx="58" cy="85" r="6"/><circle cx="142" cy="85" r="6"/>
    <circle cx="76" cy="106" r="7.5"/><circle cx="124" cy="106" r="7.5"/>
    <circle cx="100" cy="116" r="9"/>
    <path d="M100 129l18 21-18 25-18-25z"/></svg>`,
  ring: `<svg viewBox="0 0 200 200" fill="none" stroke="url(#gsGold)" stroke-width="2">
    <circle cx="100" cy="112" r="46"/><circle cx="100" cy="112" r="34" opacity=".45"/>
    <path d="M78 74l22-30 22 30" stroke-linejoin="round"/><path d="M86 74h28l-14 18z"/></svg>`,
  hoodie: `<svg viewBox="0 0 200 200" fill="none" stroke="url(#gsGold)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M74 72L44 88l-10 34 22 10 6-12v66h76v-66l6 12 22-10-10-34-30-16"/>
    <path d="M74 72Q100 28 126 72"/><path d="M86 72Q100 52 114 72"/>
    <path d="M95 76v16M105 76v16"/>
    <path d="M78 140h44v24H78z" opacity=".55"/></svg>`,
  tee: `<svg viewBox="0 0 200 200" fill="none" stroke="url(#gsGold)" stroke-width="2" stroke-linejoin="round">
    <path d="M74 52l26 12 26-12 32 18-14 30-12-7v61H68v-61l-12 7-14-30z"/>
    <path d="M74 52c0 14 12 24 26 24s26-10 26-24"/></svg>`,
  bottle: `<svg viewBox="0 0 200 200" fill="none" stroke="url(#gsGold)" stroke-width="2" stroke-linejoin="round">
    <rect x="80" y="34" width="40" height="24" rx="3"/><path d="M90 58h20v16H90z"/>
    <rect x="62" y="74" width="76" height="94" rx="6"/><path d="M62 108h76" opacity=".5"/>
    <circle cx="100" cy="134" r="16" opacity=".4"/></svg>`,
  cap: `<svg viewBox="0 0 200 200" fill="none" stroke="url(#gsGold)" stroke-width="2" stroke-linejoin="round">
    <path d="M48 116c0-30 24-52 52-52s52 22 52 52z"/><path d="M48 116h108c10 0 14 8 6 14H44z"/>
    <path d="M100 64v52" opacity=".4"/><circle cx="100" cy="66" r="5"/></svg>`
};

const PRODUCTS = [
  { id:'gs9-001', name:'Cadena Cubana 8mm',  meta:'Acero · PVD Oro',    price:48900, art:'chain',  tag:'Nuevo' },
  { id:'gs9-002', name:'Hoodie Heavyweight', meta:'Algodón 420gsm',     price:72500, art:'hoodie', tag:'Nuevo' },
  { id:'gs9-003', name:'Extracto N.º 1',     meta:'Ámbar · Cuero 50ml', price:61000, art:'bottle', tag:null   },
  { id:'gs9-004', name:'Signet Ring',        meta:'Plata 925',          price:39900, art:'ring',   tag:null   },
  { id:'gs9-005', name:'Tee Boxy Fit',       meta:'Algodón 240gsm',     price:28400, art:'tee',    tag:null   },
  { id:'gs9-006', name:'Cap Estructurada',   meta:'Bordado directo',    price:24900, art:'cap',    tag:'Agotado', soldOut:true }
];

const money = n => '$' + n.toLocaleString('es-AR');

/* ─────────── Preloader ─────────── */
const preloader = $('#preloader');
const countEl = $('#preloaderCount');
const progressCircle = $('.preloader__progress');

let preloaderDone = false;

function runPreloader(){
  if (REDUCED){ finish(); return; }

  const DUR = 1000, HOLD = .9;
  const t0 = performance.now();
  let loaded = document.readyState === 'complete';
  addEventListener('load', () => { loaded = true; }, { once:true });
  // never trap the page behind a stalled resource
  setTimeout(() => { loaded = true; }, 3000);

  const step = now => {
    if (preloaderDone) return;
    const p = clamp((now - t0) / DUR, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const shown = loaded ? eased : Math.min(eased, HOLD);
    countEl.textContent = String(Math.round(shown * 100));
    progressCircle.style.strokeDashoffset = String(603 - 603 * shown);
    if (shown >= 1){ setTimeout(finish, 220); return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function finish(){
  if (preloaderDone) return;
  preloaderDone = true;
  preloader.classList.add('is-done');
  document.body.classList.remove('is-locked');
  setTimeout(() => preloader.remove(), 1400);
}

document.body.classList.add('is-locked');
runPreloader();

/* ─────────── Cursor ─────────── */
const cursor = $('#cursor');
if (cursor && matchMedia('(hover:hover)').matches){
  const dot = $('.cursor__dot'), ring = $('.cursor__ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  }, { passive:true });

  (function loop(){
    rx = lerp(rx, mx, .16); ry = lerp(ry, my, .16);
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  const hot = 'a,button,[data-magnetic],input';
  addEventListener('mouseover', e => {
    if (e.target.closest(hot)) cursor.classList.add('is-hot');
  });
  addEventListener('mouseout', e => {
    if (e.target.closest(hot)) cursor.classList.remove('is-hot');
  });
}

/* ─────────── Magnetic ─────────── */
if (!REDUCED && matchMedia('(hover:hover)').matches){
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .26;
      const y = (e.clientY - r.top - r.height / 2) * .26;
      el.style.transform = `translate(${x}px,${y}px)`;
      el.style.transition = 'transform .12s linear';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      el.style.transform = '';
    });
  });
}

/* ─────────── Nav + scroll progress ─────────── */
const nav = $('#nav'), bar = $('#scrollbarFill');
const onScroll = () => {
  const y = scrollY;
  nav.classList.toggle('is-stuck', y > 40);
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
};
addEventListener('scroll', onScroll, { passive:true });
onScroll();

/* ─────────── Mobile menu ─────────── */
const burger = $('#burger'), menu = $('#menu');
const toggleMenu = force => {
  const open = force ?? !menu.classList.contains('is-open');
  menu.classList.toggle('is-open', open);
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('is-locked', open);
};
burger.addEventListener('click', () => toggleMenu());
$$('.menu__links a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

/* ─────────── Hero parallax ─────────── */
if (!REDUCED && matchMedia('(hover:hover)').matches){
  const layers = $$('[data-parallax]');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
  }, { passive:true });
  (function loop(){
    cx = lerp(cx, tx, .05); cy = lerp(cy, ty, .05);
    layers.forEach(l => {
      const d = parseFloat(l.dataset.parallax) * 340;
      l.style.translate = `calc(-50% + ${cx * d}px) calc(-50% + ${cy * d}px)`;
    });
    requestAnimationFrame(loop);
  })();
}

/* ─────────── Reveal ─────────── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const d = e.target.dataset.delay || 0;
    setTimeout(() => e.target.classList.add('is-in'), +d);
    revealIO.unobserve(e.target);
  });
}, { threshold:.14, rootMargin:'0px 0px -8% 0px' });

const observeReveals = () => $$('.reveal:not(.is-in)').forEach(el => revealIO.observe(el));

/* ─────────── Manifiesto: palabras ─────────── */
const splitEl = $('[data-split]');
if (splitEl){
  const words = splitEl.textContent.trim().split(/\s+/);
  splitEl.textContent = '';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'word';
    s.textContent = w;
    s.style.transitionDelay = (i % 12) * 18 + 'ms';
    splitEl.append(s, document.createTextNode(' '));
  });

  if (REDUCED){
    $$('.word', splitEl).forEach(w => w.classList.add('is-lit'));
  } else {
    const spans = $$('.word', splitEl);
    const litScroll = () => {
      const r = splitEl.getBoundingClientRect();
      const p = clamp((innerHeight * .82 - r.top) / (r.height + innerHeight * .34), 0, 1);
      const upTo = Math.floor(p * spans.length * 1.25);
      spans.forEach((s, i) => s.classList.toggle('is-lit', i < upTo));
    };
    addEventListener('scroll', litScroll, { passive:true });
    litScroll();
  }
}

/* ─────────── Carrito ─────────── */
const CART_KEY = 'gs9.cart.v1';
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }

const drawer = $('#drawer');
const drawerItems = $('#drawerItems');
const cartCount = $('#cartCount');
const cartTotal = $('#cartTotal');

const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} };

function renderCart(){
  const units = cart.reduce((n, i) => n + i.qty, 0);
  cartCount.textContent = String(units);
  cartCount.classList.add('is-pop');
  setTimeout(() => cartCount.classList.remove('is-pop'), 400);

  drawerItems.textContent = '';
  if (!cart.length){
    const p = document.createElement('p');
    p.className = 'drawer__empty';
    p.textContent = 'Tu bolsa está vacía.';
    drawerItems.append(p);
  } else {
    cart.forEach(item => {
      const p = PRODUCTS.find(x => x.id === item.id);
      if (!p) return;
      const row = document.createElement('div');
      row.className = 'ditem';

      const art = document.createElement('div');
      art.className = 'ditem__art';
      art.innerHTML = ART[p.art];

      const body = document.createElement('div');
      body.className = 'ditem__body';
      const b = document.createElement('b'); b.textContent = p.name;
      const s = document.createElement('span'); s.textContent = money(p.price);
      body.append(b, s);

      const qty = document.createElement('div');
      qty.className = 'ditem__qty';
      const minus = document.createElement('button');
      minus.type = 'button'; minus.textContent = '−';
      minus.setAttribute('aria-label', `Quitar una unidad de ${p.name}`);
      minus.addEventListener('click', () => changeQty(p.id, -1));
      const n = document.createElement('span'); n.textContent = String(item.qty);
      const plus = document.createElement('button');
      plus.type = 'button'; plus.textContent = '+';
      plus.setAttribute('aria-label', `Agregar una unidad de ${p.name}`);
      plus.addEventListener('click', () => changeQty(p.id, 1));
      qty.append(minus, n, plus);

      row.append(art, body, qty);
      drawerItems.append(row);
    });
  }

  const total = cart.reduce((sum, i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
  cartTotal.textContent = money(total);
  saveCart();
}

function addToCart(id){
  const found = cart.find(i => i.id === id);
  if (found) found.qty++;
  else cart.push({ id, qty:1 });
  renderCart();
  openDrawer(true);
}
function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}

const openDrawer = open => {
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('is-locked', open);
};
$('#cartOpen').addEventListener('click', () => openDrawer(true));
$('#cartClose').addEventListener('click', () => openDrawer(false));
$('#drawerScrim').addEventListener('click', () => openDrawer(false));
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (drawer.classList.contains('is-open')) openDrawer(false);
  if (menu.classList.contains('is-open')) toggleMenu(false);
});

/* ─────────── Render productos ─────────── */
const grid = $('#dropGrid');
PRODUCTS.forEach((p, i) => {
  const card = document.createElement('article');
  card.className = 'card reveal';
  card.dataset.delay = String((i % 3) * 110);

  const media = document.createElement('div');
  media.className = 'card__media';
  media.innerHTML = ART[p.art];

  if (p.tag){
    const tag = document.createElement('span');
    tag.className = 'card__tag' + (p.soldOut ? ' card__tag--out' : '');
    tag.textContent = p.tag;
    media.append(tag);
  }

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'card__add';
  add.textContent = p.soldOut ? 'Agotado' : 'Agregar a la bolsa';
  if (p.soldOut) add.disabled = true;
  else add.addEventListener('click', () => addToCart(p.id));
  media.append(add);

  const info = document.createElement('div');
  info.className = 'card__info';
  const left = document.createElement('div');
  const name = document.createElement('h3');
  name.className = 'card__name'; name.textContent = p.name;
  const meta = document.createElement('p');
  meta.className = 'card__meta'; meta.textContent = p.meta;
  left.append(name, meta);
  const price = document.createElement('span');
  price.className = 'card__price'; price.textContent = money(p.price);
  info.append(left, price);

  card.append(media, info);
  grid.append(card);
});

/* ─────────── Lookbook ─────────── */
const LOOKS = ['gs9-001', 'gs9-002', 'gs9-003', 'gs9-004', 'gs9-006'];
const lookTrack = $('#lookTrack');

LOOKS.forEach((id, i) => {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const fig = document.createElement('figure');
  fig.className = 'look__card';

  const art = document.createElement('div');
  art.className = `look__art look__art--${i + 1}`;

  const idx = document.createElement('span');
  idx.className = 'look__idx';
  idx.textContent = String(i + 1).padStart(2, '0');

  const shape = document.createElement('div');
  shape.className = 'look__shape';
  shape.innerHTML = ART[p.art];

  art.append(idx, shape);

  const cap = document.createElement('figcaption');
  const b = document.createElement('b'); b.textContent = p.name;
  const s = document.createElement('span'); s.textContent = p.meta;
  cap.append(b, s);

  fig.append(art, cap);
  lookTrack.append(fig);
});

/* ─────────── Lookbook horizontal ─────────── */
const look = $('#lookbook'), track = lookTrack, lookBar = $('#lookBar');
if (look && track && !REDUCED){
  const lookScroll = () => {
    const r = look.getBoundingClientRect();
    const span = look.offsetHeight - innerHeight;
    if (span <= 0) return;
    const p = clamp(-r.top / span, 0, 1);
    const dist = Math.max(0, track.scrollWidth - innerWidth + 32);
    track.style.transform = `translate3d(${-p * dist}px,0,0)`;
    lookBar.style.width = p * 100 + '%';
  };
  addEventListener('scroll', lookScroll, { passive:true });
  addEventListener('resize', lookScroll);
  lookScroll();
}

/* ─────────── Count up ─────────── */
const countIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.to;
    countIO.unobserve(el);
    if (REDUCED){ el.textContent = String(to); return; }
    const dur = 1500, t0 = performance.now();
    const step = t => {
      const p = clamp((t - t0) / dur, 0, 1);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold:.5 });
$$('.count').forEach(el => countIO.observe(el));

/* ─────────── Newsletter ─────────── */
const form = $('#newsForm'), msg = $('#newsMsg');
form.addEventListener('submit', e => {
  e.preventDefault();
  const value = $('#newsEmail').value.trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  msg.classList.toggle('is-err', !ok);
  msg.textContent = ok
    ? 'Anotado. Te avisamos cuando abra el Drop 002.'
    : 'Revisá el email, no parece válido.';
  if (ok) form.reset();
});

/* ─────────── Misc ─────────── */
$('#year').textContent = String(new Date().getFullYear());
renderCart();
observeReveals();

})();
