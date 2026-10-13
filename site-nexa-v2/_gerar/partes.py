"""Partes repetidas das páginas do site v2 (cabeçalho, rodapé, ícones)."""
NEXA_D = "M8 139V12L175 139V12M200 12H366M200 12V139H366M200 75H366M390 12L558 139M558 12L390 139M580 139L685 12L792 139M618 95H755"
STAR = '<svg viewBox="0 0 24 24"><path d="M12 0c.6 6.4 5 11 12 12-7 1-11.4 5.6-12 12-.6-6.4-5-11-12-12C7 11 11.4 6.4 12 0z"/></svg>'
SETA = '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>'
GRADE = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></svg>'
WA = "https://wa.me/5551981736796?text=Ol%C3%A1%2C%20Dandara%21%20Vim%20pelo%20site%20da%20NEXA%20e%20quero%20entender%20como%20voc%C3%AAs%20podem%20ajudar%20a%20minha%20empresa.%20Podemos%20conversar%3F"
# Muda a cada publicação de CSS/JS: os assets têm cache de 1 dia.
V = "20261013"
MAIL = "mailto:dandara@nexatech.ia.br?subject=Quero%20conversar%20com%20a%20NEXA"

def head(titulo, desc, base):
    return f'''<!doctype html>
<html lang="pt-BR" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titulo}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#08090a">
<script>(function(){{var t;try{{t=localStorage.getItem('nexa-tema')}}catch(e){{}}if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'claro':'escuro';if(t==='claro')document.documentElement.setAttribute('data-tema','claro')}})()</script>
<meta property="og:title" content="{titulo}"><meta property="og:description" content="{desc}"><meta property="og:image" content="https://nexatech.ia.br/og.jpg">
<link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300;400;500&family=Poppins:wght@400;500;600&display=swap">
<link rel="stylesheet" href="{base}assets/site.css?v={V}">
</head>
<body>'''

def topo(base, ativo=''):
    itens = ' · '.join([])
    m = ''.join(f'<span>{t}{STAR}</span>' for t in ['Sales Coach', 'Atlas Clima', 'Atlas 360', 'Fábrica de soluções', 'IA acelera. Pessoas dão direção.'] * 2)
    def a(href, txt, k):
        on = ' class="on"' if ativo == k else ''
        return f'<a href="{base}{href}"{on}>{txt}</a>'
    return f'''<div class="marquee" aria-hidden="true"><div class="trilho">{m}{m}</div></div>
<header class="topo"><div class="wrap">
  <a class="logo" href="{base}index.html" aria-label="NEXA, início"><svg viewBox="0 0 800 150"><path d="{NEXA_D}"/></svg><i></i></a>
  <nav class="nav">{a('sales-coach/index.html', 'Sales Coach', 'sc')}{a('atlas/index.html', 'Atlas', 'atlas')}{a('index.html#fabrica', 'Fábrica', 'f')}{a('index.html#metodo', 'Método', 'm')}<a href="#contato">Contato</a></nav>
  <div class="acoes"><button class="tema-bt" aria-label="Alternar tema claro ou escuro"><svg class="lua" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg><svg class="sol" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button><a class="pill sm lime" href="#contato">Fale com a NEXA {SETA}</a><button class="menu-bt" aria-label="Abrir menu"><i></i></button></div>
</div></header>
<nav class="gaveta">{a('index.html', 'Início', '')}{a('sales-coach/index.html', 'Sales Coach', '')}{a('atlas/index.html', 'Atlas', '')}{a('index.html#fabrica', 'Fábrica', '')}<a href="#contato">Contato</a></nav>'''

FUNC = ['1 a 10', '11 a 50', '51 a 200', '201 a 500', '501 a 1.000', 'Mais de 1.000']
VEND = ['1 a 5', '6 a 15', '16 a 50', '51 a 100', 'Mais de 100']

def _sel(nome, rotulo, opcoes):
    ops = ''.join(f'<option>{o}</option>' for o in opcoes)
    return f'<label><span>{rotulo}</span><select name="{nome}"><option value="">Selecione</option>{ops}</select></label>'

def contato(base, titulo='Qual desafio do seu negócio vira o <span class="tom">próximo produto?</span>', formulario='home'):
    """Seção final com o formulário de conversão (vai para o CRM, aba Inbound)."""
    botao = {'home': 'Quero conversar com a NEXA', 'sales-coach': 'Agendar demonstração', 'atlas': 'Agendar demonstração'}[formulario]
    vend = _sel('vendedores', 'Nº de vendedores', VEND) if formulario == 'sales-coach' else ''
    return f'''<section class="final" id="contato"><div class="wrap">
  <div class="kick lime" data-reveal>Seu próximo movimento</div>
  <h2 class="h-xl" data-palavras>{titulo}</h2>
  <div class="conv" data-reveal>
    <form class="lead-form" data-formulario="{formulario}" novalidate>
      <div class="conv-campos">
        <label><span>Nome <i>*</i></span><input name="nome" autocomplete="name" required></label>
        <label><span>E-mail <i>*</i></span><input name="email" type="email" autocomplete="email" required></label>
        <label><span>WhatsApp <i>*</i></span><input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(51) 98765-4321" required></label>
        <label><span>Empresa</span><input name="empresa" autocomplete="organization"></label>
        <label><span>Cargo</span><input name="cargo" autocomplete="organization-title"></label>
        {_sel('funcionarios', 'Nº de funcionários', FUNC)}
        {vend}
      </div>
      <input type="hidden" name="interesse">
      <label class="conv-isca" aria-hidden="true">Site<input name="site" tabindex="-1" autocomplete="off"></label>
      <div class="conv-envio"><button class="pill lime" type="submit">{botao} {SETA}</button>
        <p class="conv-nota"><i>*</i> obrigatórios. Ao enviar, você concorda com a <a href="/privacidade/">política de privacidade</a>.</p></div>
      <p class="lead-msg" aria-live="polite"></p>
    </form>
    <div class="conv-ok" role="status"><span class="kick lime">Recebido</span><b>Obrigado!</b><p>A Dandara, executiva comercial da NEXA, vai te chamar no WhatsApp em até 1 dia útil.</p><a class="pill" href="{WA}" target="_blank" rel="noopener">Falar agora no WhatsApp {SETA}</a></div>
    <aside class="conv-lado"><span class="kick">Prefere falar direto?</span>
      <a href="{WA}" target="_blank" rel="noopener"><b>WhatsApp</b><span>+55 51 98173-6796</span></a>
      <a href="{MAIL}"><b>E-mail</b><span>dandara@nexatech.ia.br</span></a></aside>
  </div>
</div></section>'''

def rodape(base):
    return f'''<footer class="rodape"><div class="wrap">
  <div class="cols">
    <div><span class="kick">Produtos</span><a href="{base}sales-coach/index.html">Sales Coach</a><a href="{base}atlas/index.html">Atlas Clima</a><a href="{base}atlas/index.html#atlas-360">Atlas 360</a></div>
    <div><span class="kick">NEXA</span><a href="{base}index.html#fabrica">Fábrica de soluções</a><a href="{base}index.html#metodo">Como criamos</a><a href="{base}index.html#contato">Contato</a></div>
    <div><span class="kick">Redes</span><a href="https://instagram.com/nexatech_ia" target="_blank" rel="noopener">Instagram · @nexatech_ia</a><a href="{WA}" target="_blank" rel="noopener">WhatsApp</a></div>
  </div>
  <svg class="gigante" viewBox="0 0 800 150"><path d="{NEXA_D}"/></svg>
  <div class="fim"><span>© 2026 NEXA</span><span>Inteligência que vira solução</span></div>
</div></footer>'''

def fim(base):
    return f'''<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>
<script src="{base}assets/site.js?v={V}"></script>
<script src="{base}assets/lead.js?v={V}"></script>
</body>
</html>
'''
