/* Rastreio de origem e formulário de contato do site da NEXA.
   Em toda página: guarda o primeiro toque (como a pessoa chegou pela primeira vez) e o
   último toque com origem (UTM, id de clique ou site que indicou). No envio, manda tudo
   junto com o formulário para a função lead-site, que grava o lead no CRM (aba Inbound). */
(function () {
  var API = 'https://atzwinvlemkyttkrdumn.supabase.co/functions/v1/lead-site';
  var CHAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id'];
  var DIAS90 = 90 * 864e5;
  var ler = function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  var gravar = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var cookie = function (n) { var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; };

  // ── Toques ──
  var q = new URLSearchParams(location.search), agora = Date.now(), t = {};
  CHAVES.forEach(function (k) { var v = q.get(k); if (v) t[k] = v.slice(0, 300); });
  var ref = document.referrer && document.referrer.indexOf(location.host) < 0 ? document.referrer : '';
  var temOrigem = Object.keys(t).length > 0 || !!ref;
  t.landing = location.pathname + location.search; t.referrer = ref; t.ts = new Date(agora).toISOString();
  var primeiro = ler('nexa-toque-1');
  if (!primeiro || agora - Date.parse(primeiro.ts) > DIAS90) { primeiro = t; gravar('nexa-toque-1', t); }
  var ultimo = ler('nexa-toque-u');
  if (temOrigem || !ultimo) { ultimo = t; gravar('nexa-toque-u', t); }
  if (t.fbclid && !cookie('_fbc')) { try { document.cookie = '_fbc=fb.1.' + agora + '.' + t.fbclid + ';max-age=7776000;path=/;SameSite=Lax'; } catch (e) {} }
  var visitas = (ler('nexa-visitas') || 0) + (sessionStorage.getItem('nexa-sessao') ? 0 : 1);
  try { sessionStorage.setItem('nexa-sessao', '1'); } catch (e) {}
  gravar('nexa-visitas', visitas);

  // ── Formulário ──
  var f = document.querySelector('form.lead-form');
  if (!f) return;
  var msg = f.querySelector('.lead-msg'), bt = f.querySelector('button[type=submit]'), tel = f.elements.whatsapp;

  // Botões de plano ("Quero o Profissional") marcam o interesse antes de rolar até o formulário.
  document.querySelectorAll('[data-interesse]').forEach(function (a) {
    a.addEventListener('click', function () { if (f.elements.interesse) f.elements.interesse.value = a.getAttribute('data-interesse'); });
  });

  tel.addEventListener('input', function () {
    var d = tel.value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11), s = d;
    if (d.length > 2) s = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) s = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    tel.value = s;
  });

  var erro = function (texto, campo) {
    msg.textContent = texto; msg.className = 'lead-msg bad';
    f.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    if (campo && f.elements[campo]) { f.elements[campo].setAttribute('aria-invalid', 'true'); f.elements[campo].focus(); }
  };

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (n) { return f.elements[n] ? f.elements[n].value.trim() : ''; };
    if (v('nome').length < 2) return erro('Informe seu nome.', 'nome');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) return erro('Confira o e-mail.', 'email');
    if (v('whatsapp').replace(/\D/g, '').length < 10) return erro('Informe o WhatsApp com DDD.', 'whatsapp');

    var eventId = 'lead-' + agora.toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    var corpo = {
      formulario: f.getAttribute('data-formulario'), site: v('site'),
      nome: v('nome'), email: v('email'), whatsapp: v('whatsapp'), empresa: v('empresa'), cargo: v('cargo'),
      funcionarios: v('funcionarios'), vendedores: v('vendedores'), interesse: v('interesse'),
      rastreio: {
        ultimo: ultimo, primeiro: primeiro, pagina: location.pathname + location.search, titulo: document.title,
        referrer: document.referrer, fbp: cookie('_fbp'), fbc: cookie('_fbc'), ga: cookie('_ga'), event_id: eventId,
        visitas: visitas, segundos: Math.round(performance.now() / 1000),
        dispositivo: matchMedia('(max-width: 760px)').matches ? 'celular' : 'computador',
        tela: screen.width + 'x' + screen.height, idioma: navigator.language,
      },
    };
    bt.disabled = true; msg.className = 'lead-msg'; msg.textContent = 'Enviando…';
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (r) {
        if (!r.ok || !r.j.ok) { bt.disabled = false; return erro(r.j.erro || 'Não foi possível enviar agora. Tente de novo.', r.j.campo); }
        // Conversão para as ferramentas de anúncio que estiverem instaladas na página.
        var produto = f.getAttribute('data-formulario');
        try { window.fbq && window.fbq('track', 'Lead', { content_name: produto }, { eventID: eventId }); } catch (e) {}
        try { (window.dataLayer = window.dataLayer || []).push({ event: 'generate_lead', formulario: produto, event_id: eventId }); } catch (e) {}
        try { window.gtag && window.gtag('event', 'generate_lead', { formulario: produto }); } catch (e) {}
        var primeiroNome = v('nome').split(' ')[0], conv = f.closest('.conv');
        msg.textContent = ''; conv.classList.add('enviado');
        conv.querySelector('.conv-ok b').textContent = 'Obrigado, ' + primeiroNome + '!';
      })
      .catch(function () { bt.disabled = false; erro('Sem conexão. Confira a internet e tente de novo.'); });
  });
})();
