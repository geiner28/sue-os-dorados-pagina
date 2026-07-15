(() => {
  const reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js-ready');

  if (typeof gsap === 'undefined') {
    document.documentElement.classList.add('no-gsap');
    console.warn('[motion] GSAP no cargó — revisa js/vendor/gsap.min.js');
    return;
  }

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.config({ force3D: true });

  function heroIntro() {
    /* Hero nueva usa CSS keyframes propias — no GSAP sobre .anim-item */
  }

  function revealOnScroll() {
    if (reduced) {
      gsap.set(['.reveal', '.reveal-line'], { opacity: 1, y: 0, clearProps: 'transform' });
      return;
    }

    if (typeof ScrollTrigger === 'undefined') {
      gsap.set(['.reveal', '.reveal-line'], { opacity: 1, y: 0 });
      return;
    }

    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 56 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    gsap.utils.toArray('.reveal-line').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 80, skewY: 4 },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 0.95,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  function frameParallax() {
    if (reduced || typeof ScrollTrigger === 'undefined') return;

    gsap.utils.toArray('.frame').forEach((frame) => {
      const img = frame.querySelector('img');
      const caption = frame.querySelector('.frame-caption');

      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.18, y: -40 },
          {
            scale: 1.02,
            y: 50,
            ease: 'none',
            scrollTrigger: {
              trigger: frame,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      if (caption) {
        gsap.fromTo(
          caption.children,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: frame,
              start: 'top 65%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });
  }

  function stripScroll() {
    if (reduced || typeof ScrollTrigger === 'undefined') return;
    const track = document.getElementById('strip-track');
    if (!track) return;

    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: '.strip',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  }

  window.pulseNumCell = function pulseNumCell(btn) {
    if (reduced || !btn) return;
    gsap.fromTo(
      btn,
      { scale: 0.88, backgroundColor: '#b9850d' },
      {
        scale: 1,
        duration: 0.35,
        ease: 'back.out(2.4)',
        clearProps: 'backgroundColor',
      }
    );
  };

  window.celebrateSuccess = function celebrateSuccess() {
    if (reduced) return;

    const card = document.getElementById('success-card');
    if (card) {
      gsap.fromTo(
        card,
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.success-burst',
        { scale: 0.3, rotate: -25 },
        { scale: 1, rotate: 0, duration: 0.65, ease: 'back.out(2)' }
      );
    }

    const layer = document.getElementById('success-particles');
    if (!layer) return;
    layer.classList.remove('hidden');
    layer.innerHTML = '';

    for (let i = 0; i < 32; i += 1) {
      const p = document.createElement('span');
      p.className = 'success-particle';
      p.style.left = `${10 + Math.random() * 80}%`;
      p.style.top = '55%';
      layer.appendChild(p);
      gsap.fromTo(
        p,
        { opacity: 0, scale: 0.3 },
        {
          opacity: 1,
          scale: 1,
          y: -(120 + Math.random() * 260),
          x: (Math.random() - 0.5) * 200,
          duration: 1 + Math.random() * 0.7,
          delay: Math.random() * 0.2,
          ease: 'power2.out',
          onComplete: () => gsap.to(p, { opacity: 0, duration: 0.3 }),
        }
      );
    }

    setTimeout(() => {
      layer.classList.add('hidden');
      layer.innerHTML = '';
    }, 2200);
  };

  window.pulseRuletaOpen = function pulseRuletaOpen() {
    if (reduced) return;
    const panel = document.querySelector('.ruleta-panel');
    if (!panel) return;
    gsap.fromTo(
      panel,
      { y: 40, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
    );
  };

  window.celebrateRuletaWin = function celebrateRuletaWin() {
    if (reduced) return;
    const display = document.getElementById('ruleta-display');
    if (!display) return;
    gsap.fromTo(
      display,
      { scale: 0.8, filter: 'brightness(2)' },
      { scale: 1, filter: 'brightness(1)', duration: 0.55, ease: 'back.out(2.2)' }
    );
  };

  // Boot after fonts/images have a chance — punchy and reliable
  function boot() {
    heroIntro();
    revealOnScroll();
    frameParallax();
    stripScroll();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
