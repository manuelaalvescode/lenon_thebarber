/* ============================================================
   LENON THE BARBER — main.js
   Responsabilidades:
   1. Scroll reveal (anima .reveal quando entra na tela)
   2. Nav sticky (muda visual após scroll)
   3. Menu mobile (abre/fecha)
   4. Smooth scroll em links âncora
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. SCROLL REVEAL ──
     Observa todos os elementos com classe .reveal
     Adiciona .in quando 10% do elemento entrar na tela */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target); // para de observar após animar
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });


  /* ── 2. NAV STICKY ──
     Adiciona classe .scrolled ao nav após 80px de scroll
     CSS usa essa classe para mudar background/sombra */
  const nav = document.getElementById('nav');

  const handleNavScroll = () => {
    if (window.scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // roda uma vez ao carregar


  /* ── 3. MENU MOBILE ──
     Toggle do menu hamburguer */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';

      navToggle.setAttribute('aria-expanded', !isOpen);
      navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open');
    });

    // Fecha o menu ao clicar em qualquer link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ── 4. SMOOTH SCROLL ──
     Rola suavemente para seções ao clicar em links âncora (#)
     Desconta a altura do nav fixo para não ficar embaixo dele */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = nav ? nav.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });

});
