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

  // Подсвечиваем текущую страницу в меню (работает и для header, и для footer)
  const navLinks = Array.from(document.querySelectorAll('nav a[href]'));
  if (navLinks.length) {
    const normalizePathPart = (v) => {
      if (!v) return '';
      let s = String(v);
      try {
        s = decodeURIComponent(s);
      } catch {
        // Игнорируем ошибки декодирования
      }

      // Убираем query/hash, если они окажутся в href.
      s = s.split('#')[0].split('?')[0];
      if (s.endsWith('/')) s = s.slice(0, -1);
      return s.split('/').pop();
    };

    const currentPath = normalizePathPart(window.location.pathname);
    const currentHref = window.location.href;

    for (const a of navLinks) a.removeAttribute('aria-current');

    const matchesCurrent = (aHref) => {
      const linkPart = normalizePathPart(aHref);
      if (!linkPart) return false;
      if (currentPath && currentPath === linkPart) return true;

      // На некоторых окружениях `pathname` может отличаться, поэтому делаем запасной матч по концу URL.
      if (currentHref && (currentHref.endsWith(aHref) || currentHref.endsWith('/' + aHref))) return true;
      return false;
    };

    let matched = false;
    for (const a of navLinks) {
      const href = a.getAttribute('href');
      if (matchesCurrent(href)) {
        a.setAttribute('aria-current', 'page');
        matched = true;
      }
    }

    // Фоллбек: если совпадение не найдено, считаем, что открыта главная.
    if (!matched) {
      for (const a of navLinks) {
        if (a.getAttribute('href') === 'index.html') {
          a.setAttribute('aria-current', 'page');
          break;
        }
      }
    }
  }

  // ====== Header: автоматический переход в burger-меню при нехватке ширины ======
  const header = document.querySelector('header');
  const headerLogo = header ? header.querySelector(':scope > a') : null;
  const headerNav = header ? header.querySelector(':scope > nav') : null;
  const burgerBtn = header ? header.querySelector('.header__burger') : null;

  if (header && headerLogo && headerNav && burgerBtn) {
    const syncHeaderOffset = () => {
      document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight}px`);
    };

    const closeMenu = () => {
      header.classList.remove('header--menu-open');
      burgerBtn.setAttribute('aria-expanded', 'false');
      burgerBtn.setAttribute('aria-label', 'Открыть меню');
      syncHeaderOffset();
    };

    const openMenu = () => {
      header.classList.add('header--menu-open');
      burgerBtn.setAttribute('aria-expanded', 'true');
      burgerBtn.setAttribute('aria-label', 'Закрыть меню');
      syncHeaderOffset();
    };

    const updateHeaderCompactState = () => {
      // Временное отключение compact-режима нужно, чтобы корректно измерить
      // реальную ширину полного меню и решить, помещается ли оно.
      header.classList.remove('header--compact', 'header--menu-open');
      burgerBtn.setAttribute('aria-expanded', 'false');
      burgerBtn.setAttribute('aria-label', 'Открыть меню');

      const headerWidth = header.clientWidth;
      const fullHeaderWidth = headerLogo.scrollWidth + headerNav.scrollWidth + 56;

      if (fullHeaderWidth > headerWidth) {
        header.classList.add('header--compact');
      }

      syncHeaderOffset();
    };

    burgerBtn.addEventListener('click', () => {
      if (header.classList.contains('header--menu-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    headerNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    window.addEventListener('resize', updateHeaderCompactState);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    updateHeaderCompactState();
  }

  // ====== Contact form (валидация) ======
  const form = document.getElementById('contactForm');
  if (form) {
    const nameInput = document.getElementById('contactName');
    const phoneInput = document.getElementById('contactPhone');
    const serviceInput = document.getElementById('contactService');
    const messageInput = document.getElementById('contactMessage');

    const nameError = document.getElementById('contactNameError');
    const phoneError = document.getElementById('contactPhoneError');
    const serviceError = document.getElementById('contactServiceError');
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

    const validateService = (value) => {
      const v = String(value || '').trim();
      if (!v) return 'Выберите тип услуги.';
      return '';
    };

    if (serviceInput) {
      const serviceFromQuery = new URLSearchParams(window.location.search).get('service');
      if (serviceFromQuery) {
        const matchingOption = serviceInput.querySelector(`option[value="${serviceFromQuery}"]`);
        if (matchingOption) {
          serviceInput.value = serviceFromQuery;
        }
      }
    }

    const fields = [
      { input: nameInput, errorEl: nameError, validator: validateName },
      { input: phoneInput, errorEl: phoneError, validator: validatePhone },
      { input: serviceInput, errorEl: serviceError, validator: validateService },
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
