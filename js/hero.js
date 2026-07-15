(() => {
  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  function closeMobileMenu() {
    if (!menuButton || !mobileMenu) return;
    menuButton.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const isActive = menuButton.classList.toggle('active');
      mobileMenu.classList.toggle('active', isActive);
      document.body.classList.toggle('menu-open', isActive);
      menuButton.setAttribute('aria-expanded', String(isActive));
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  const hero = document.querySelector('.hero');
  const bike = document.querySelector('.hero-bike');
  const allowMotion =
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (allowMotion && hero && bike) {
    hero.addEventListener(
      'pointermove',
      (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        bike.style.transform = `
          translate3d(${x * 16}px, ${y * 10}px, 0)
          rotateY(${x * 1.5}deg)
          rotateX(${-y * 1.15}deg)
        `;
      },
      { passive: true }
    );

    hero.addEventListener('pointerleave', () => {
      bike.style.transform = 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)';
    });
  }

  const navigationLinks = document.querySelectorAll('.desktop-nav a');
  const sections = document.querySelectorAll('section[id], header[id]');
  if (navigationLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navigationLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${entry.target.id}`);
          });
        });
      },
      { threshold: 0.35 }
    );
    sections.forEach((section) => observer.observe(section));
  }
})();
