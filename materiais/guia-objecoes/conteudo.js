// Conteúdo do Guia das objeções em vendas B2B (Sales Coach · NEXA).
// Uma entrada por objeção. O guia.html monta uma página para cada uma.
window.OBJECOES = [
  {
    tema: 'Preço',
    frase: 'Achei caro para o momento.',
    porTras: 'Quase nunca é sobre o número. “Caro” é comparação: com outra opção, com o orçamento ou com o tamanho do problema na cabeça do lead. Se a dor não ficou clara, qualquer preço parece alto.',
    fazer: [
      'Não defenda o valor de cara. Primeiro descubra com o que ele está comparando.',
      'Retome a dor que o próprio lead disse na reunião, com as palavras dele.',
      'Traga o custo de não resolver para o mesmo período do preço (por mês, por trimestre).',
      'Se o problema for o fluxo de caixa, discuta formato antes de discutir desconto.',
    ],
    perguntas: [
      'Caro em relação a quê? Você tem uma referência em mente?',
      'Quanto custa, por mês, continuar do jeito que está hoje?',
    ],
    dica: 'Desconto na primeira objeção confirma que o preço era o problema e ensina o lead a pedir mais.',
  },
  {
    tema: 'Concorrência',
    frase: 'Já temos um fornecedor para isso.',
    porTras: 'O lead está dizendo que mudar dá trabalho e tem risco. Ele não vai trocar algo que funciona “mais ou menos” por algo que ele ainda não entendeu por que seria melhor.',
    fazer: [
      'Valide a escolha atual. Criticar o fornecedor dele é criticar a decisão dele.',
      'Pergunte o que funciona bem e o que ele mudaria se pudesse.',
      'Procure a lacuna: o que o fornecedor atual não resolve e que apareceu na conversa.',
      'Proponha um piloto pequeno em vez de uma troca completa.',
    ],
    perguntas: [
      'Se você pudesse mudar uma coisa no que tem hoje, o que seria?',
      'Quando foi a última vez que vocês reavaliaram essa escolha?',
    ],
    dica: 'O melhor concorrente para você é o “mais ou menos”. Seu trabalho é tornar visível o custo do mais ou menos.',
  },
  {
    tema: 'Momento',
    frase: 'Agora não é o momento.',
    porTras: 'Pode ser verdade (orçamento fechado, outra prioridade) ou uma forma educada de dizer “não vi urgência”. Sem descobrir qual dos dois, você vai voltar daqui a três meses para ouvir a mesma frase.',
    fazer: [
      'Pergunte o que precisa acontecer para virar o momento.',
      'Descubra se existe um evento concreto: fim de trimestre, contratação, meta nova.',
      'Mostre o que acontece até lá se nada mudar.',
      'Se o timing for real, combine a data de retomada e o que você vai trazer nela.',
    ],
    perguntas: [
      'O que precisa acontecer para isso virar prioridade?',
      'Se não mudar nada até lá, o que acontece com a meta do trimestre?',
    ],
    dica: '“Me procura em março” sem um motivo para março é um não com data. Peça o motivo.',
  },
  {
    tema: 'Autoridade',
    frase: 'Preciso falar com o meu sócio.',
    porTras: 'A pessoa na sua frente não decide sozinha, ou não se sente segura para defender a compra. Se você deixar que ela venda por você, a proposta chega pela metade.',
    fazer: [
      'Entenda o papel de cada um: quem usa, quem aprova, quem assina.',
      'Pergunte o que o sócio vai querer saber, e prepare o seu interlocutor para isso.',
      'Ofereça uma conversa curta com os dois, em vez de mandar material.',
      'Entregue um resumo de uma página com dor, solução, investimento e próximo passo.',
    ],
    perguntas: [
      'Além de você, quem mais participa dessa decisão?',
      'O que o seu sócio vai perguntar primeiro quando você apresentar?',
    ],
    dica: 'Seu objetivo não é passar pelo intermediário. É transformá-lo em defensor da proposta.',
  },
  {
    tema: 'Fuga',
    frase: 'Me manda uma proposta por e-mail.',
    porTras: 'Às vezes é processo. Muitas vezes é o jeito mais confortável de encerrar a reunião sem dizer não. Proposta sem conversa vira PDF esquecido na caixa de entrada.',
    fazer: [
      'Aceite enviar, mas condicione a uma conversa curta para apresentar.',
      'Antes de desligar, confirme o que precisa estar na proposta para ela ser aprovada.',
      'Pergunte quem mais vai ler e quais critérios vão usar para comparar.',
      'Saia da reunião com data e horário da próxima conversa na agenda.',
    ],
    perguntas: [
      'Mando sim. O que precisa estar nela para fazer sentido para vocês?',
      'Podemos marcar 20 minutos na quinta para eu te apresentar e ajustar o que for preciso?',
    ],
    dica: 'Nunca termine uma reunião com “fico no aguardo”. Termine com data.',
  },
  {
    tema: 'Orçamento',
    frase: 'Não temos orçamento para isso este ano.',
    porTras: 'Orçamento é decisão de prioridade. Empresas acham verba para o que resolve um problema caro e urgente. Se não há verba, ou a dor não é grande o bastante ou ela ainda não chegou em quem aprova.',
    fazer: [
      'Descubra se o problema é a verba ou a prioridade.',
      'Pergunte de qual linha de orçamento isso sairia, e quem cuida dela.',
      'Mostre o retorno em prazo curto, no mesmo ano fiscal se possível.',
      'Se a verba realmente fecha só no próximo ciclo, entre agora no planejamento.',
    ],
    perguntas: [
      'Se o orçamento existisse, essa seria a prioridade?',
      'Quando vocês montam o orçamento do próximo ano, e quem participa?',
    ],
    dica: 'Quem responde “não tem orçamento” raramente é quem define o orçamento. Descubra quem é.',
  },
  {
    tema: 'Experiência ruim',
    frase: 'Já tentamos algo parecido e não funcionou.',
    porTras: 'O lead está com medo de repetir um erro, e talvez de se expor de novo internamente. Não é uma objeção à sua solução, é uma cicatriz.',
    fazer: [
      'Pergunte o que aconteceu, com curiosidade genuína, e escute até o fim.',
      'Separe o que foi problema da ferramenta do que foi problema de implantação.',
      'Mostre o que é diferente, especificamente, no ponto que deu errado da outra vez.',
      'Reduza o risco: piloto, marcos de acompanhamento, critério claro de sucesso.',
    ],
    perguntas: [
      'O que fez a última tentativa não dar certo?',
      'O que precisaria ser diferente desta vez para você confiar?',
    ],
    dica: 'Quem já tentou e falhou já reconheceu o problema. Isso é meio caminho andado.',
  },
  {
    tema: 'Adoção',
    frase: 'Meu time não vai usar.',
    porTras: 'O gestor está antecipando resistência e o trabalho de cobrar o uso. A pergunta real é: quanto esforço isso vai me custar no dia a dia?',
    fazer: [
      'Pergunte por que ele acha isso, e o que o time usa bem hoje.',
      'Mostre o que o time ganha, não só o que o gestor ganha.',
      'Explique quanto do processo é automático e quanto depende de alguém lembrar.',
      'Combine uma implantação com um grupo pequeno e um campeão interno.',
    ],
    perguntas: [
      'Qual ferramenta o time adotou rápido, e por quê?',
      'Se o time ganhasse tempo em vez de tarefa, a resistência seria a mesma?',
    ],
    dica: 'Ferramenta que dá trabalho ao vendedor morre. Ferramenta que tira trabalho dele pega sozinha.',
  },
  {
    tema: 'Indecisão',
    frase: 'Vou pensar e te dou um retorno.',
    porTras: 'Ficou alguma dúvida que o lead não falou. Se ele sair da reunião sem dizer qual é, você não vai ter chance de responder.',
    fazer: [
      'Agradeça e pergunte, com leveza, o que ele vai pensar.',
      'Peça uma nota de 0 a 10 para o quanto faz sentido, e o que falta para o 10.',
      'Trate a dúvida ali mesmo, enquanto o contexto está fresco.',
      'Combine o retorno com data, não com “assim que der”.',
    ],
    perguntas: [
      'Claro. Para eu te ajudar a pensar: qual ponto ainda não ficou claro?',
      'De 0 a 10, quanto isso faz sentido hoje? O que faltaria para chegar no 10?',
    ],
    dica: 'A dúvida que não é dita na reunião vira o “não” que chega por e-mail.',
  },
  {
    tema: 'Comparação de preço',
    frase: 'O concorrente faz mais barato.',
    porTras: 'O lead está comparando preço porque ainda não enxergou diferença de valor. Ou está usando a comparação para negociar, o que também é um sinal de interesse.',
    fazer: [
      'Pergunte o que exatamente foi cotado, para comparar a mesma coisa.',
      'Liste com o lead os critérios que importam para ele, antes de falar de preço.',
      'Mostre a diferença no que pesa para ele, não na lista de funcionalidades.',
      'Se for negociação, troque concessão por compromisso (prazo, volume, case).',
    ],
    perguntas: [
      'Além do preço, o que vai pesar na decisão de vocês?',
      'Se o valor fosse igual, com qual das duas opções vocês fechariam?',
    ],
    dica: 'Se a única diferença percebida é o preço, o problema começou antes, na conversa de valor.',
  },
  {
    tema: 'Status quo',
    frase: 'Nosso processo funciona bem hoje.',
    porTras: 'Funciona bem é diferente de funciona bem o bastante. O lead não sente a dor porque se acostumou a ela, ou porque ninguém mediu quanto ela custa.',
    fazer: [
      'Concorde e pergunte como eles medem que funciona bem.',
      'Procure números: conversão, ciclo de venda, tempo de rampa de quem entra.',
      'Compare com a meta, não com o passado.',
      'Use perguntas de implicação: o que acontece se o cenário mudar?',
    ],
    perguntas: [
      'Como vocês sabem que está funcionando? Qual número acompanham?',
      'Se o time dobrar no ano que vem, o processo atual aguenta?',
    ],
    dica: 'Ninguém compra solução para um problema que não vê. Seu papel é ajudar a ver, com perguntas, não com argumentos.',
  },
  {
    tema: 'Implantação',
    frase: 'Não temos tempo para implantar agora.',
    porTras: 'O lead imagina um projeto longo, que vai tirar o time do foco. A objeção não é à solução, é ao esforço de começar.',
    fazer: [
      'Pergunte o que ele imagina que a implantação exige.',
      'Mostre o passo a passo real, com prazo e o que é responsabilidade de cada lado.',
      'Separe o mínimo para começar do que pode vir depois.',
      'Compare o tempo de implantar com o tempo que o problema já consome hoje.',
    ],
    perguntas: [
      'Quanto tempo você imagina que levaria para começar?',
      'Quanto tempo por semana o time gasta hoje com isso que estamos resolvendo?',
    ],
    dica: 'Quanto menor o primeiro passo, mais fácil o sim. Venda o começo, não o projeto inteiro.',
  },
];
