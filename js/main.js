/* global document, window */

function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

async function includeComponent(targetSelector, componentUrl) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  try {
    const res = await fetch(componentUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    target.innerHTML = await res.text();
  } catch (err) {
    // Если компонент не подгрузился (например, при открытии через file://),
    // сайт хотя бы не сломается.
    console.warn(`Не удалось загрузить компонент: ${componentUrl}`, err);
  }
}

function initMobileMenu() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (!header || !toggle || !nav) return;

  const openClass = 'is-menu-open';

  const setOpen = (isOpen) => {
    header.classList.toggle(openClass, isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.contains(openClass);
    setOpen(!isOpen);
  });

  nav.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const link = t.closest('a');
    if (!link) return;
    if (window.innerWidth <= 768) setOpen(false);
  });
}

function setActiveNav() {
  const file = (location.pathname.split('/').pop() || 'index.html').trim() || 'index.html';
  document.querySelectorAll('nav a[data-page]').forEach((a) => {
    const page = a.getAttribute('data-page');
    if (!page) return;
    a.classList.toggle('is-active', page === file);
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (form.querySelector('[name="name"]')?.value || '').trim();
    const phone = (form.querySelector('[name="phone"]')?.value || '').trim();
    const message = (form.querySelector('[name="message"]')?.value || '').trim();

    if (!name || (!phone && message.length < 10)) {
      status.textContent = 'Пожалуйста, укажите имя и контакт (телефон) или подробное сообщение.';
      status.classList.add('is-error');
      return;
    }

    status.classList.remove('is-error');
    status.textContent = 'Спасибо! Заявка принята. Мы свяжемся с вами в ближайшее время.';
    form.reset();
  });
}

async function initPage() {
  // Компоненты грузим через fetch: страницы остаются обычными HTML без сборщиков.
  await Promise.all([
    includeComponent('[data-include="header"]', './components/header.html'),
    includeComponent('[data-include="footer"]', './components/footer.html'),
  ]);

  setYear();
  initMobileMenu();
  setActiveNav();
  initContactForm();
}

document.addEventListener('DOMContentLoaded', () => {
  void initPage();
});

