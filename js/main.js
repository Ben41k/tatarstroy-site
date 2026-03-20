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

  // ====== Contact form (валидация) ======
  const form = document.getElementById('contactForm');
  if (form) {
    const nameInput = document.getElementById('contactName');
    const phoneInput = document.getElementById('contactPhone');
    const messageInput = document.getElementById('contactMessage');

    const nameError = document.getElementById('contactNameError');
    const phoneError = document.getElementById('contactPhoneError');
    const messageError = document.getElementById('contactMessageError');

    const statusEl = document.getElementById('contactFormStatus');

    const setFieldError = (inputEl, errorEl, message) => {
      if (!inputEl || !errorEl) return;
      const hasError = Boolean(message);
      inputEl.setAttribute('aria-invalid', hasError ? 'true' : 'false');
      errorEl.textContent = message || '';
    };

    const validateName = (value) => {
      const v = String(value || '').trim();
      if (!v) return 'Введите имя.';
      if (v.length < 2) return 'Имя должно быть не короче 2 символов.';
      // Разрешаем буквы (латиница/кириллица), пробелы и дефисы.
      if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(v)) return 'Проверьте формат имени.';
      return '';
    };

    const validatePhone = (value) => {
      const v = String(value || '').trim();
      if (!v) return 'Введите телефон.';
      // Быстро проверим общее количество цифр.
      const digitsCount = v.replace(/\D/g, '').length;
      if (digitsCount < 10) return 'Телефон должен содержать минимум 10 цифр.';
      // Разрешаем +, пробелы, скобки, дефисы и цифры.
      if (!/^\+?[0-9\s()-]{10,20}$/.test(v)) return 'Проверьте формат телефона.';
      return '';
    };

    const validateMessage = (value) => {
      const v = String(value || '').trim();
      if (!v) return 'Введите сообщение.';
      if (v.length < 10) return 'Сообщение должно быть не короче 10 символов.';
      if (v.length > 1000) return 'Сообщение слишком длинное (макс. 1000 символов).';
      return '';
    };

    const fields = [
      { input: nameInput, errorEl: nameError, validator: validateName },
      { input: phoneInput, errorEl: phoneError, validator: validatePhone },
      { input: messageInput, errorEl: messageError, validator: validateMessage },
    ];

    // Валидация “на лету” — чтобы ошибка исчезала, как только поле стало корректным.
    for (const field of fields) {
      if (!field.input) continue;
      field.input.addEventListener('input', () => {
        const msg = field.validator(field.input.value);
        setFieldError(field.input, field.errorEl, msg);
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      for (const field of fields) {
        if (!field.input) continue;
        const msg = field.validator(field.input.value);
        setFieldError(field.input, field.errorEl, msg);
        if (msg) valid = false;
      }

      if (!valid) {
        if (statusEl) statusEl.textContent = 'Проверьте поля формы и попробуйте ещё раз.';
        return;
      }

      // Здесь можно подключить отправку на сервер.
      // Пока только показываем успешное сообщение.
      if (statusEl) {
        statusEl.textContent = 'Спасибо! Ваше сообщение отправлено.';
      }
      form.reset();

      // Сбрасываем состояния ошибок и aria-invalid.
      for (const field of fields) {
        if (!field.input || !field.errorEl) continue;
        field.input.setAttribute('aria-invalid', 'false');
        field.errorEl.textContent = '';
      }
    });
  }
});
