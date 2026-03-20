// Общие скрипты для всех страниц сайта
document.addEventListener('DOMContentLoaded', async () => {
  // Подключаем HTML-компоненты (например, header/footer) в страницы
  // В разметке страницы используем плейсхолдер: <div data-include="components/header.html"></div>
  const includeEls = Array.from(document.querySelectorAll('[data-include]'));
  for (const el of includeEls) {
    const src = el.getAttribute('data-include');
    if (!src) continue;

    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const html = await res.text();
      el.outerHTML = html;
    } catch (err) {
      // Если компонент не загрузился, страница хотя бы не упадет целиком.
      console.error(`Не удалось подключить компонент: ${src}`, err);
    }
  }

  // Обновляем год в футере (id="year" находится внутри компонента footer.html)
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});
