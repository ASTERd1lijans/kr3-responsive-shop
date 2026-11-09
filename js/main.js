/**
 * Main Application Script for kr3-responsive-shop
 * Handles mobile navigation, accessible modals, and form validation
 */
document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------------
     1. Mobile Navigation Toggle (WCAG 2.1 Accessible Burger)
     ------------------------------------------------------------------------ */
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      siteNav.classList.toggle('is-open');

      if (!isExpanded) {
        // Focus first link in open menu
        const firstLink = siteNav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    // Close mobile nav on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (event) => {
      if (siteNav.classList.contains('is-open') &&
          !siteNav.contains(event.target) &&
          !navToggle.contains(event.target)) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Mobile Catalog Filter Toggle
     ------------------------------------------------------------------------ */
  const filterToggle = document.querySelector('.catalog-filters__toggle');
  const filterContent = document.querySelector('.catalog-filters__content');

  if (filterToggle && filterContent) {
    filterToggle.addEventListener('click', () => {
      const isExpanded = filterToggle.getAttribute('aria-expanded') === 'true';
      filterToggle.setAttribute('aria-expanded', String(!isExpanded));
      filterContent.classList.toggle('is-open');
    });
  }

  /* ------------------------------------------------------------------------
     3. Accessible Order Modal Dialog (<dialog>)
     ------------------------------------------------------------------------ */
  const orderDialog = document.getElementById('order-dialog');
  const closeDialogButton = document.getElementById('close-order-dialog');
  const orderForm = document.getElementById('order-form');
  const selectedProductInput = document.getElementById('selected-product');
  const successNotification = document.getElementById('order-success-notification');
  const orderButtons = document.querySelectorAll('.js-open-order-dialog');

  let lastActiveElement = null;

  if (orderButtons.length > 0 && orderDialog) {
    orderButtons.forEach((button) => {
      button.addEventListener('click', () => {
        lastActiveElement = button;
        const productName = button.dataset.product || '';
        if (selectedProductInput) {
          selectedProductInput.value = productName;
        }
        orderDialog.showModal();

        // Focus first input inside dialog
        const firstInput = orderDialog.querySelector('input:not([type="hidden"])');
        if (firstInput) {
          firstInput.focus();
        }
      });
    });
  }

  if (closeDialogButton && orderDialog) {
    closeDialogButton.addEventListener('click', () => {
      orderDialog.close();
      if (lastActiveElement) {
        lastActiveElement.focus();
      }
    });
  }

  if (orderDialog) {
    // Backdrop click close
    orderDialog.addEventListener('click', (event) => {
      const rect = orderDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        orderDialog.close();
        if (lastActiveElement) {
          lastActiveElement.focus();
        }
      }
    });

    orderDialog.addEventListener('close', () => {
      if (lastActiveElement) {
        lastActiveElement.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Form Validation & Submission Handling
     ------------------------------------------------------------------------ */
  const forms = document.querySelectorAll('form[data-validate="true"]');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
      let isFormValid = true;

      inputs.forEach((input) => {
        if (!input.willValidate) return;

        if (!input.checkValidity()) {
          input.setAttribute('aria-invalid', 'true');
          isFormValid = false;
        } else {
          input.removeAttribute('aria-invalid');
        }

        // Live reset on user typing
        input.addEventListener('input', () => {
          if (input.checkValidity()) {
            input.removeAttribute('aria-invalid');
          }
        }, { once: true });
      });

      if (!isFormValid) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        form.reportValidity();
        return;
      }

      // Success feedback
      const successBox = form.closest('.form-card')
        ? form.closest('.form-card').querySelector('.notification--success')
        : successNotification;

      if (successBox) {
        successBox.hidden = false;
        successBox.focus();
      } else {
        alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
      }

      form.reset();

      if (orderDialog && orderDialog.open) {
        setTimeout(() => {
          orderDialog.close();
        }, 1200);
      }
    });
  });
});
