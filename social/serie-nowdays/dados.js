// Série editorial no ritmo do @nowdays: 12 carrosséis, 4 por marca (educativo, conteúdo e comercial).
// Corpo em caixa baixa, como na referência. **negrito** e *negrito itálico* viram destaque.
// Tipos de tela: capa, contexto, dado, info, textoimg, citacao, virada, fecha, marca, cur, produto, preco.
const POSTS = [
  // ───────────────────────────── NEXA ─────────────────────────────
  {
    id: 'n1', marca: 'nexa', slug: 'dado-sem-conversa', tipo: 'educativo', telas: [
      { tipo: 'capa', foto: 'n1-capa', texto: 'dado sem conversa\né só planilha' },
      { tipo: 'contexto', foto: 'n1-ctx', titulo: 'onde a empresa realmente acontece',
        texto: 'a venda, a demissão, a promoção, o projeto que atrasa: quase tudo o que importa numa empresa começa numa conversa. e quase nenhuma conversa vira dado. o que sobra é o relato de quem estava lá, do jeito que lembrou.' },
      { tipo: 'dado', foto: 'n1-dado', texto: '70% dos líderes de dados dizem que os insights valiosos estão presos em dado não estruturado',
        fonte: 'salesforce · state of sales, 7ª ed. (2026)' },
      { tipo: 'info', titulo: 'como uma conversa vira decisão', itens: [
        ['a conversa acontece', 'reunião de venda, 1:1, pesquisa com o time. do jeito que já acontece hoje.'],
        ['a conversa vira dado', 'nota, critérios, clima por área, sinais de risco. estruturado e comparável.'],
        ['o dado vira decisão', 'o gestor age antes: no lead que esfriou, na área que está adoecendo.'],
      ] },
      { tipo: 'textoimg', foto: 'n1-txt',
        a: 'gestor bom sempre foi quem **escuta**. o problema é que ninguém escuta 400 reuniões por mês, nem 80 pessoas ao mesmo tempo.',
        b: 'a tecnologia certa não decide por você. ela **escuta o que você não alcança** e te entrega o que merece atenção.' },
      { tipo: 'citacao', frase: 'gestão boa é a que escuta antes de decidir.', cred: 'nexa' },
      { tipo: 'virada', titulo: 'a ia não substitui o gestor.',
        texto: 'ela devolve o tempo que ele gastava tentando descobrir o que aconteceu, para ele gastar decidindo o que fazer.' },
      { tipo: 'fecha', texto: 'toda empresa já tem os dados de que precisa. eles só estão **sendo falados, não escritos**.', cta: 'salva pra mostrar pro seu time' },
      { tipo: 'marca', cta: 'sales coach · atlas — link na bio' },
    ],
  },
  {
    id: 'n2', marca: 'nexa', slug: 'quantas-conversas', tipo: 'conteúdo', telas: [
      { tipo: 'capa', modo: 'gig', foto: 'n2-capa', texto: 'quantas conversas do seu time você ouviu esta semana?' },
      { tipo: 'contexto', foto: 'n2-txt', titulo: 'a conta não fecha',
        texto: 'um time de 8 vendedores faz umas 120 reuniões por mês. uma empresa de 60 pessoas tem 60 versões de como está o trabalho. nenhum gestor dá conta de ouvir tudo isso. então ele ouve **quem fala mais alto**.' },
      { tipo: 'virada', titulo: 'quem fala mais alto não é quem mais precisa ser ouvido.',
        texto: 'o vendedor que está perdendo não pede ajuda. a pessoa que está esgotada não avisa. o silêncio também é um dado.' },
      { tipo: 'info', titulo: 'três silêncios que custam caro', itens: [
        ['a reunião que ninguém revisou', 'e o próximo passo que ficou para depois.'],
        ['a pesquisa que ninguém respondeu', 'e a área que parou de acreditar que adianta.'],
        ['o 1:1 que foi remarcado', 'pela terceira semana seguida.'],
      ] },
      { tipo: 'fecha', texto: 'escutar tudo não é humanamente possível. **não escutar nada** é uma escolha.', cta: 'comenta: qual silêncio pesa mais aí?' },
      { tipo: 'marca', cta: 'escuta em escala — link na bio' },
    ],
  },
  {
    id: 'n3', marca: 'nexa', slug: 'cinco-livros', tipo: 'conteúdo', telas: [
      { tipo: 'capa', foto: 'n3-l3', texto: '5 livros para quem\nlidera pessoas' },
      { tipo: 'cur', foto: 'n3-l1', num: '01', titulo: 'comunicação não-violenta', texto: 'marshall b. rosenberg · para conversas difíceis que não viram briga.' },
      { tipo: 'cur', foto: 'n3-l2', num: '02', titulo: 'empatia assertiva', texto: 'kim scott · para dar feedback que cuida e cobra ao mesmo tempo.' },
      { tipo: 'cur', foto: 'n3-l4', num: '03', titulo: 'rápido e devagar', texto: 'daniel kahneman · para desconfiar da primeira impressão antes de decidir.' },
      { tipo: 'cur', foto: 'n3-l5', num: '04', titulo: 'a coragem de ser imperfeito', texto: 'brené brown · para liderar sem fingir que tem todas as respostas.' },
      { tipo: 'cur', foto: 'n3-l6', num: '05', titulo: 'mindset', texto: 'carol s. dweck · para tratar erro como parte do aprendizado do time.' },
      { tipo: 'fecha', texto: 'liderar é, antes de tudo, **prestar atenção**. qual livro você colocaria nessa lista?', cta: 'salva pra ler depois' },
      { tipo: 'marca', cta: 'link na bio' },
    ],
  },
  {
    id: 'n4', marca: 'nexa', slug: 'ecossistema', tipo: 'comercial', telas: [
      { tipo: 'capa', foto: 'n4-capa', texto: 'decidir sobre\npessoas com dados' },
      { tipo: 'info', titulo: 'dois produtos, uma ideia: escutar em escala', itens: [
        ['sales coach', 'escuta as reuniões de venda: nota, coach ao vivo e crm preenchido. a partir de r$ 89,90 por usuário/mês.'],
        ['atlas', 'escuta o time: pesquisa de clima, 360 e eNPS por área e liderança. r$ 30 por usuário.'],
      ] },
      { tipo: 'produto', kick: 'sales coach', titulo: 'toda reunião de venda vira método',
        texto: 'o time inteiro numa tela e **um assistente que conhece todas as reuniões**.', img: 'dashboard.png' },
      { tipo: 'produto', kick: 'atlas', titulo: 'o clima do time, por área e liderança',
        texto: 'pesquisa anônima com resultado em tempo real e **onde agir primeiro**.', img: 'atlas-painel.jpg', estilo: 'left:330px;width:600px' },
      { tipo: 'fecha', texto: 'a nexa existe para que **nenhuma decisão sobre pessoas** seja tomada no escuro.', cta: 'fale com a gente · link na bio' },
      { tipo: 'marca', cta: 'sales coach · atlas — link na bio' },
    ],
  },

  // ───────────────────────────── SALES COACH ─────────────────────────────
  {
    id: 's1', marca: 'sc', slug: 'reuniao-boa', tipo: 'educativo', telas: [
      { tipo: 'capa', foto: 's1-ctx', texto: 'como saber se\numa reunião\nde venda foi boa' },
      { tipo: 'contexto', titulo: '“reunião boa” não é diagnóstico',
        texto: 'é o que mais aparece no campo de observações do crm. e não diz nada: nem o que o cliente precisa, nem quem decide, nem quando. a reunião boa de verdade **deixa rastro**.' },
      { tipo: 'dado', foto: 's1-dado', texto: 'negócio ganho: vendedor fala 57% da chamada. perdido: 62%.',
        fonte: 'gong labs · 326 mil chamadas de vendas analisadas' },
      { tipo: 'info', titulo: 'quatro perguntas que a reunião precisa responder', itens: [
        ['existe orçamento?', 'ou pelo menos uma faixa de investimento conversada.'],
        ['quem decide?', 'e quem mais influencia essa decisão.'],
        ['qual é a dor de verdade?', 'nas palavras do cliente, não nas do vendedor.'],
        ['até quando?', 'o prazo que o cliente tem, não o que você queria.'],
      ] },
      { tipo: 'textoimg', foto: 's1-txt',
        a: 'a reunião só termina quando existe **próximo passo com data**. “vou ver internamente” não é próximo passo.',
        b: 'se o cliente falou menos que você, provavelmente você **apresentou mais do que descobriu**.' },
      { tipo: 'citacao', frase: 'reunião boa não é a que foi agradável. é a que andou.', cred: 'coaching de vendas · sales coach' },
      { tipo: 'virada', titulo: 'nota não é para punir. é para ensinar.',
        texto: 'quando toda reunião tem nota, o gestor para de opinar e começa a treinar: no critério que faltou, com o trecho exato da conversa.' },
      { tipo: 'fecha', texto: 'na próxima 1:1, em vez de perguntar “como foi?”, pergunte **“o que ficou combinado?”**', cta: 'salva e usa na próxima 1:1' },
      { tipo: 'marca', cta: 'a partir de r$ 89,90 por usuário/mês — link na bio' },
    ],
  },
  {
    id: 's2', marca: 'sc', slug: 'objecoes', tipo: 'conteúdo', telas: [
      { tipo: 'capa', modo: 'gig', foto: 's2-capa', texto: 'o que responder quando o cliente diz “tá caro”?' },
      { tipo: 'cur', foto: 's2-o1', num: 'objeção 01', titulo: '“tá caro”', texto: 'caro comparado a quê? volte para o custo do problema antes de falar de preço.' },
      { tipo: 'cur', foto: 's2-o2', num: 'objeção 02', titulo: '“já temos uma ferramenta”', texto: 'ótimo. o que ela resolve bem e o que ainda dá trabalho? a brecha está na segunda resposta.' },
      { tipo: 'cur', foto: 's2-o3', num: 'objeção 03', titulo: '“vou pensar”', texto: 'pensar sobre o quê, exatamente? quase sempre é uma objeção que ainda não foi dita.' },
      { tipo: 'cur', foto: 's2-o4', num: 'objeção 04', titulo: '“me manda por e-mail”', texto: 'mando, sim. e já deixamos 20 minutos na quinta para você me dizer o que achou?' },
      { tipo: 'fecha', texto: 'objeção não é um não. é **o cliente mostrando onde está a dúvida**.', cta: 'comenta a que você mais ouve' },
      { tipo: 'marca', cta: 'a resposta certa, na hora da objeção — link na bio' },
    ],
  },
  {
    id: 's3', marca: 'sc', slug: 'melhor-vendedor-saiu', tipo: 'conteúdo', telas: [
      { tipo: 'capa', foto: 's3-capa', texto: 'seu melhor vendedor\nsaiu. e o método\ndele?' },
      { tipo: 'dado', foto: 's3-dado', texto: '53% de turnover no comercial brasileiro', fonte: 'meetime · inside sales benchmark brasil 2022' },
      { tipo: 'textoimg', foto: 's3-txt',
        a: 'ele sabia contornar preço, sabia a hora de chamar o diretor, sabia **o que perguntar na primeira reunião**.',
        b: 'nada disso estava escrito. foi embora junto com o crachá. e o próximo vai aprender tudo de novo, **com os seus clientes**.' },
      { tipo: 'virada', titulo: 'o que não está registrado não é método. é talento.',
        texto: 'talento sai pela porta. método fica: nas reuniões gravadas, nas melhores respostas, no treino de quem chega.' },
      { tipo: 'fecha', texto: 'o melhor momento de registrar o jeito do seu melhor vendedor é **antes de ele sair**.', cta: 'manda pro gestor do seu time' },
      { tipo: 'marca', cta: 'o método fica — link na bio' },
    ],
  },
  {
    id: 's4', marca: 'sc', slug: 'um-coach-em-cada-reuniao', tipo: 'comercial', telas: [
      { tipo: 'capa', foto: 's4-capa', texto: 'um coach em cada\nreunião do seu time' },
      { tipo: 'produto', kick: 'durante a reunião', titulo: 'a resposta aparece na hora',
        texto: 'o coach ao vivo entra no meet ou no teams e **sopra a resposta na hora da objeção**. só o vendedor vê.', img: 'extensao.webp', estilo: 'left:280px;width:520px' },
      { tipo: 'produto', kick: 'depois da reunião', titulo: 'nota, próximo passo e crm preenchido',
        texto: 'temperatura, critérios da sua metodologia e **próximo passo pronto**. e o crm se preenche sozinho.', img: 'analise.webp' },
      { tipo: 'produto', kick: 'para o gestor', titulo: 'o time inteiro numa tela',
        texto: 'e **um assistente que conhece todas as reuniões** e responde o que você perguntar.', img: 'dashboard.png' },
      { tipo: 'preco', de: 'a partir de', valor: '89,90', por: 'por usuário/mês, **sem limite de uso**', cta: 'teste no seu time · link na bio' },
      { tipo: 'marca', cta: 'um coach em cada reunião do seu time' },
    ],
  },

  // ───────────────────────────── ATLAS ─────────────────────────────
  {
    id: 'a1', marca: 'atlas', slug: 'clima-ou-360', tipo: 'educativo', telas: [
      { tipo: 'capa', foto: 'a1-capa', texto: 'clima ou 360:\nqual pesquisa o seu\ntime precisa?' },
      { tipo: 'contexto', foto: 'a1-ctx', titulo: 'as duas escutam. escutam coisas diferentes.',
        texto: 'a pesquisa de clima pergunta como as pessoas estão vivendo o trabalho. o 360 pergunta como cada liderança é percebida por quem está em volta. confundir as duas é o jeito mais rápido de ter **muito dado e nenhuma ação**.' },
      { tipo: 'info', titulo: 'qual usar e quando', itens: [
        ['pesquisa de clima', 'o time todo, anônima, por área. mostra onde agir primeiro.'],
        ['feedback 360', 'uma pessoa por vez: gestor, pares e equipe avaliam. vira plano de desenvolvimento.'],
        ['eNPS', 'uma pergunta, rápida e frequente: você indicaria trabalhar aqui?'],
      ] },
      { tipo: 'textoimg', foto: 'a1-txt',
        a: 'clima responde **onde** está o problema. 360 responde **quem** pode ajudar a resolver.',
        b: 'por isso as empresas mais maduras **usam as duas**: o clima uma ou duas vezes por ano, o 360 nos ciclos de desenvolvimento.' },
      { tipo: 'citacao', frase: 'quem pergunta assume o compromisso de ouvir a resposta.', cred: 'atlas · pesquisa de clima e 360' },
      { tipo: 'virada', titulo: 'o que mata a pesquisa não é a pergunta. é o silêncio depois dela.',
        texto: 'se o time responde e nada muda, na próxima ele não responde. ou responde o que acha que você quer ouvir.' },
      { tipo: 'fecha', texto: 'antes de escolher a pesquisa, escolha **o que você vai fazer com a resposta**.', cta: 'salva pra próxima reunião de rh' },
      { tipo: 'marca', cta: 'r$ 30 por usuário — link na bio' },
    ],
  },
  {
    id: 'a2', marca: 'atlas', slug: 'sinais-do-clima', tipo: 'conteúdo', telas: [
      { tipo: 'capa', modo: 'gig', foto: 'a2-capa', texto: 'o clima do seu time está pior do que parece?' },
      { tipo: 'cur', foto: 'a2-s1', num: 'sinal 01', titulo: 'o silêncio nas reuniões', texto: 'ninguém discorda, ninguém pergunta. não é alinhamento: é desistência.' },
      { tipo: 'cur', foto: 'a2-s2', num: 'sinal 02', titulo: 'o pedido de demissão surpresa', texto: 'quase sempre houve aviso: o 1:1 cancelado, a câmera desligada, a pergunta que a pessoa parou de fazer.' },
      { tipo: 'cur', foto: 'a2-s3', num: 'sinal 03', titulo: 'a cadeira vazia', texto: 'faltas e atestados que aumentam aos poucos, sempre na mesma área.' },
      { tipo: 'cur', foto: 'a2-s4', num: 'sinal 04', titulo: 'só a liderança fala', texto: 'quando o gestor fala e o time olha para baixo, a conversa já acabou.' },
      { tipo: 'fecha', texto: 'nenhum desses sinais aparece no relatório do mês. aparecem **quando alguém pergunta do jeito certo**: anônimo, por área e com retorno.', cta: 'qual sinal você já viu aí?' },
      { tipo: 'marca', cta: 'ouvir o time de verdade — link na bio' },
    ],
  },
  {
    id: 'a3', marca: 'atlas', slug: 'nr1-risco-psicossocial', tipo: 'educativo', telas: [
      { tipo: 'capa', foto: 'a3-capa', texto: 'nr-1: seu rh já mede\nrisco psicossocial?' },
      { tipo: 'contexto', titulo: 'o que mudou',
        texto: 'com a atualização da nr-1 (portaria mte nº 1.419/2024), os riscos psicossociais passam a fazer parte do gerenciamento de riscos ocupacionais, o **pgr**, com vigência desde maio de 2026. sobrecarga, assédio e metas abusivas deixam de ser só “clima” e viram **risco a gerenciar**.' },
      { tipo: 'info', titulo: 'alguns fatores que entram na conta', itens: [
        ['carga e ritmo de trabalho', 'metas, prazos e horas extras que viraram rotina.'],
        ['relações e liderança', 'apoio do gestor, conflitos e assédio.'],
        ['autonomia e reconhecimento', 'quanto a pessoa decide e o quanto é vista.'],
        ['clareza do papel', 'saber o que se espera dela.'],
      ] },
      { tipo: 'textoimg', foto: 'a3-dado',
        a: 'medir risco psicossocial começa por **perguntar às pessoas**, do jeito certo: anônimo, recorrente e por área.',
        b: 'e não termina na pesquisa: o gerenciamento pede **plano de ação e acompanhamento**. resposta sem ação não protege ninguém.' },
      { tipo: 'virada', titulo: 'não é só obrigação legal. é o que segura as pessoas.',
        texto: 'esgotamento não aparece no ponto. aparece no pedido de demissão, no afastamento e no time que fica sobrecarregado com quem saiu.' },
      { tipo: 'fecha', texto: 'a pergunta não é se a sua empresa vai medir. é **se vai medir antes ou depois** de alguém adoecer.', cta: 'manda pro seu rh' },
      { tipo: 'marca', cta: 'clima, 360 e eNPS por área — link na bio' },
    ],
  },
  {
    id: 'a4', marca: 'atlas', slug: 'trinta-reais', tipo: 'comercial', telas: [
      { tipo: 'capa', foto: 'a4-capa', texto: 'ouvir o seu time\ncusta r$ 30\npor pessoa' },
      { tipo: 'produto', kick: 'atlas', titulo: 'o clima por área e por liderança',
        texto: 'pesquisa anônima, resultado em tempo real e **onde agir primeiro**, sem planilha.', img: 'atlas-painel.jpg', estilo: 'left:330px;width:600px' },
      { tipo: 'info', titulo: 'o que vem no atlas', itens: [
        ['pesquisa de clima', 'anônima, com resultado por área.'],
        ['feedback 360', 'lideranças avaliadas por equipe, pares e gestor.'],
        ['eNPS', 'o termômetro rápido entre uma pesquisa e outra.'],
        ['onde agir primeiro', 'o resultado já aponta os temas mais urgentes.'],
      ] },
      { tipo: 'preco', de: 'por apenas', valor: '30', por: 'por usuário', cta: 'conheça o atlas · link na bio' },
      { tipo: 'marca', cta: 'sua empresa merece ouvir o time de verdade' },
    ],
  },
];
