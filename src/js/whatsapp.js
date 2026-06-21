/* ============================================================
   LENON THE BARBER — whatsapp.js
   Arquivo: src/js/whatsapp.js

   RESPONSABILIDADES:
   1. Mostrar o botão fixo após 300px de scroll
   2. Esconder o botão quando o footer for visível
      (evita conflito visual com os links do footer)
   3. Gerar links com mensagens pré-preenchidas por contexto
      (serviço clicado → mensagem personalizada)
   4. Rastrear cliques no console (base para analytics)

   DEPENDÊNCIAS:
   - Elemento #whatsapp-btn no index.html
   - Classe .is-visible controlada aqui (estilo em global.css)
   ============================================================ */

(function () {
  'use strict';

  /* ── CONFIGURAÇÃO CENTRAL ──
     Mude só aqui se o número ou mensagem mudar.
     Não espalhe o número pelo código. */
  const CONFIG = {
    number:          '5522999931788',
    defaultMessage:  'Olá, Lenon! Quero agendar um horário.',
    scrollThreshold: 300,   // px até o botão aparecer
    scrollDebounce:  80,    // ms de debounce no scroll (performance)
  };

  /* ── MENSAGENS POR SERVIÇO ──
     Quando o usuário clica em "agendar" dentro de um card
     de serviço específico, a mensagem já vem preenchida
     com o nome daquele serviço. */
  const SERVICE_MESSAGES = {
    'corte-simples':          'Olá, Lenon! Quero agendar um Corte Simples.',
    'corte-completo':         'Olá, Lenon! Quero agendar um Corte Completo.',
    'barba':                  'Olá, Lenon! Quero agendar um serviço de Barba.',
    'corte-barba':            'Olá, Lenon! Quero agendar o combo Corte + Barba.',
    'corte-barba-sobrancelha':'Olá, Lenon! Quero agendar o combo Corte + Barba + Sobrancelha.',
    'barbaterapia':           'Olá, Lenon! Quero saber mais sobre a Barbaterapia.',
    'barba-pezinho':          'Olá, Lenon! Quero agendar Barba + Pezinho.',
    'depilacao':              'Olá, Lenon! Quero agendar um serviço de Depilação.',
  };

  /* ── UTILITÁRIO: gera link do WhatsApp ── */
  function buildWhatsAppUrl(message) {
    const encoded = encodeURIComponent(message || CONFIG.defaultMessage);
    return `https://wa.me/${CONFIG.number}?text=${encoded}`;
  }

  /* ── UTILITÁRIO: debounce ──
     Evita chamar a função de scroll a cada pixel.
     Executa só depois que o usuário para de scrollar. */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ══════════════════════════════════════════════════════
     1. BOTÃO FIXO — aparecer / esconder
  ══════════════════════════════════════════════════════ */

  const btn = document.getElementById('whatsapp-btn');

  if (!btn) {
    console.warn('[whatsapp.js] Elemento #whatsapp-btn não encontrado no HTML.');
    return;
  }

  /* Garante que o link sempre aponta para o número certo */
  btn.href = buildWhatsAppUrl(CONFIG.defaultMessage);

  const footer = document.querySelector('footer');

  function updateButtonVisibility() {
    const scrollY       = window.scrollY;
    const windowHeight  = window.innerHeight;
    const docHeight     = document.documentElement.scrollHeight;

    /* Aparece após scrollar o threshold */
    const pastThreshold = scrollY > CONFIG.scrollThreshold;

    /* Esconde quando o footer está visível na tela
       (evita sobrepor os links de contato do footer) */
    let footerVisible = false;
    if (footer) {
      const footerTop = footer.getBoundingClientRect().top;
      footerVisible   = footerTop < windowHeight - 80;
    }

    if (pastThreshold && !footerVisible) {
      btn.classList.add('is-visible');
      btn.setAttribute('aria-hidden', 'false');
    } else {
      btn.classList.remove('is-visible');
      btn.setAttribute('aria-hidden', 'true');
    }
  }

  /* Escuta o scroll com debounce para não travar */
  window.addEventListener(
    'scroll',
    debounce(updateButtonVisibility, CONFIG.scrollDebounce),
    { passive: true }
  );

  /* Roda uma vez ao carregar (caso a página já comece scrollada) */
  updateButtonVisibility();

  /* ── Rastreia clique no botão fixo ── */
  btn.addEventListener('click', () => {
    console.info('[WhatsApp] Botão fixo clicado.');
    /* Futuramente: substituir por gtag('event', 'whatsapp_click', {...}) */
  });


  /* ══════════════════════════════════════════════════════
     2. LINKS DE SERVIÇO — mensagem contextual
     Procura todos os elementos com data-service="..."
     e atualiza o href com a mensagem do serviço.

     USO NO HTML:
     <a href="#"
        class="btn-primary"
        data-service="corte-barba"
        data-whatsapp>
       Agendar este serviço
     </a>
  ══════════════════════════════════════════════════════ */

  document.querySelectorAll('[data-whatsapp]').forEach(link => {
    const serviceKey = link.dataset.service;
    const message    = SERVICE_MESSAGES[serviceKey] || CONFIG.defaultMessage;

    link.href   = buildWhatsAppUrl(message);
    link.target = '_blank';
    link.rel    = 'noopener noreferrer';

    link.addEventListener('click', () => {
      console.info(`[WhatsApp] Serviço clicado: ${serviceKey || 'genérico'}`);
    });
  });


  /* ══════════════════════════════════════════════════════
     3. TODOS OS LINKS DE WHATSAPP — validação e target
     Garante que todo link wa.me do site
     abre em nova aba e tem rel correto.
  ══════════════════════════════════════════════════════ */

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    /* Corrige links que esqueceram o target */
    if (!link.target) {
      link.target = '_blank';
    }

    /* Garante segurança — sem isso o WhatsApp pode
       acessar window.opener da sua página */
    link.rel = 'noopener noreferrer';

    /* Garante que todos usam o número correto */
    if (!link.href.includes(CONFIG.number)) {
      console.warn('[whatsapp.js] Link com número diferente do configurado:', link.href);
    }
  });


  /* ══════════════════════════════════════════════════════
     4. ATALHO DE TECLADO — acessibilidade
     Pressionar "W" abre o WhatsApp (quando não está
     em input/textarea). Útil para usuários de teclado.
  ══════════════════════════════════════════════════════ */

  document.addEventListener('keydown', (e) => {
    /* Ignora se o foco está em campo de texto */
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    /* W → abre WhatsApp em nova aba */
    if (e.key === 'w' || e.key === 'W') {
      window.open(buildWhatsAppUrl(CONFIG.defaultMessage), '_blank', 'noopener');
      console.info('[WhatsApp] Aberto via atalho de teclado (W).');
    }
  });


  /* ══════════════════════════════════════════════════════
     5. COPY NUMBER — clique longo no botão fixo copia o número
     Em mobile, pressionar e segurar copia o número
     para a área de transferência como fallback.
  ══════════════════════════════════════════════════════ */

  let pressTimer = null;
  const FORMATTED_NUMBER = '(22) 99993-1788';

  btn.addEventListener('touchstart', () => {
    pressTimer = setTimeout(async () => {
      /* Cancela a navegação normal */
      btn.onclick = (e) => e.preventDefault();

      try {
        await navigator.clipboard.writeText(FORMATTED_NUMBER);
        showToast(`Número copiado: ${FORMATTED_NUMBER}`);
      } catch {
        /* Fallback se clipboard não estiver disponível */
        showToast(FORMATTED_NUMBER);
      }

      /* Restaura comportamento normal após 500ms */
      setTimeout(() => { btn.onclick = null; }, 500);

    }, 600); /* 600ms = pressionar e segurar */
  }, { passive: true });

  btn.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  }, { passive: true });

  btn.addEventListener('touchmove', () => {
    clearTimeout(pressTimer);
  }, { passive: true });


  /* ══════════════════════════════════════════════════════
     UTILITÁRIO: Toast de notificação
     Mensagem temporária que aparece e some sozinha.
     Usado quando o número é copiado.
  ══════════════════════════════════════════════════════ */

  function showToast(message) {
    /* Remove toast anterior se existir */
    const existing = document.getElementById('wa-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'wa-toast';
    toast.textContent = message;

    /* Estilo inline — evita depender de CSS externo */
    Object.assign(toast.style, {
      position:        'fixed',
      bottom:          '5.5rem',
      right:           '1.5rem',
      background:      '#1A0F0A',
      color:           '#F5EFE0',
      fontSize:        '0.8rem',
      padding:         '0.6rem 1rem',
      borderRadius:    '4px',
      border:          '1px solid rgba(184,134,11,0.3)',
      zIndex:          '300',
      opacity:         '0',
      transform:       'translateY(8px)',
      transition:      'opacity 0.25s ease, transform 0.25s ease',
      pointerEvents:   'none',
      letterSpacing:   '0.04em',
      whiteSpace:      'nowrap',
    });

    document.body.appendChild(toast);

    /* Anima entrada */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateY(0)';
      });
    });

    /* Remove após 2.5 segundos */
    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

})(); /* IIFE — encapsula tudo, não polui o escopo global */
