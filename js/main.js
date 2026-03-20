// Общие скрипты для всех страниц сайта
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
});
