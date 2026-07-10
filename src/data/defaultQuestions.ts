import { EnemArea, Question } from "../types";

export const DEFAULT_QUESTIONS: Record<EnemArea, Question[]> = {
  [EnemArea.LINGUAGENS]: [
    {
      contextText: "No poema 'Poética', Manuel Bandeira expressa um manifesto do Modernismo brasileiro: 'Estou farto do lirismo comedido / Do lirismo bem-comportado / Do funcionário público com livro de ponto expediente... / Quero antes o lirismo dos loucos / O lirismo dos bêbedos...'.",
      questionText: "A crítica exposta pelo eu lírico no fragmento textual acima foca em qual elemento estético e literário?",
      options: [
        "A exaltação do rigor formal parnasiano e da métrica clássica.",
        "A rejeição ao lirismo acadêmico tradicionalista em prol de uma expressão espontânea e livre.",
        "A defesa do retorno às formas barrocas de rebuscamento linguístico.",
        "A insatisfação com a vida urbana e o desejo de refúgio na natureza bucólica (Arcadismo).",
        "A necessidade de manter a arte sob rígidos padrões morais e sociais vigentes."
      ],
      correctOptionIndex: 1,
      explanation: "Manuel Bandeira, um dos maiores nomes do Modernismo brasileiro, critica o lirismo acadêmico, 'bem-comportado' e excessivamente formal das escolas anteriores (como o Parnasianismo). Ele clama por liberdade poética, uso do verso livre e incorporação do cotidiano espontâneo na poesia."
    },
    {
      contextText: "A internet mudou a forma como consumimos textos. O hipertexto possibilita que o leitor navegue de maneira não linear, criando seu próprio percurso através de links em portais de notícia, redes sociais e enciclopédias digitais.",
      questionText: "Considerando as novas tecnologias de informação e comunicação, o hipertexto reconfigura o papel do leitor ao:",
      options: [
        "Torná-lo um agente passivo que apenas consome informações sequenciais pré-estabelecidas.",
        "Eliminar a necessidade de reflexão crítica, já que os links realizam toda a associação de ideias.",
        "Transformá-lo em coautor do processo de leitura, dada a flexibilidade e autonomia na construção do sentido do texto.",
        "Restringir seu acesso à literatura tradicional ao limitar os caminhos interpretativos.",
        "Forçá-lo a aceitar uma única interpretação objetiva ditada pelo programador da página."
      ],
      correctOptionIndex: 2,
      explanation: "O hipertexto é caracterizado pela não linearidade. Ao clicar em links, o leitor escolhe seu próprio percurso de leitura, tornando-se mais ativo e autônomo, agindo quase como um coautor na construção de sentido daquela informação."
    }
  ],
  [EnemArea.MATEMATICA]: [
    {
      contextText: "Uma escola de ensino médio pretende comprar novos computadores para seu laboratório. A empresa fornecedora cobra uma taxa fixa de entrega de R$ 150,00 mais R$ 1.200,00 por cada computador adquirido.",
      questionText: "A função matemática que expressa o custo total (C), em reais, em termos do número de computadores comprados (x) é dada por:",
      options: [
        "C(x) = 150x + 1200",
        "C(x) = 1350x",
        "C(x) = 1200x + 150",
        "C(x) = 1200x - 150",
        "C(x) = 150x - 1200"
      ],
      correctOptionIndex: 2,
      explanation: "O custo total é composto por uma parcela fixa (taxa de entrega de R$ 150,00) e uma parcela variável que depende do número de computadores (R$ 1.200,00 por computador). Portanto, a lei da função é C(x) = 1200x + 150."
    },
    {
      contextText: "Um reservatório de água possui o formato de um cilindro circular reto. Para realizar uma limpeza, foi necessário esvaziá-lo completamente a uma taxa constante de vazão de 2 metros cúbicos por hora. Sabendo que o reservatório estava cheio e levou 12 horas para esvaziar:",
      questionText: "Qual era o volume total de água, em metros cúbicos, contido no reservatório antes do início do esvaziamento?",
      options: [
        "6 metros cúbicos.",
        "14 metros cúbicos.",
        "24 metros cúbicos.",
        "48 metros cúbicos.",
        "12 metros cúbicos."
      ],
      correctOptionIndex: 2,
      explanation: "Como a vazão é constante de 2 m³ por hora e o esvaziamento durou 12 horas, o volume total escoado (e portanto o volume original) é o produto do tempo pela vazão: 12 horas * 2 m³/hora = 24 m³."
    }
  ],
  [EnemArea.NATUREZA]: [
    {
      contextText: "A queima de combustíveis fósseis libera grandes quantidades de óxidos de enxofre (SOx) e de nitrogênio (NOx) na atmosfera. Esses compostos reagem com a água das nuvens, formando substâncias como o ácido sulfúrico e o ácido nítrico.",
      questionText: "Esse fenômeno atmosférico causa prejuízos a monumentos históricos de mármore e acidifica solos e mananciais de água. Trata-se da:",
      options: [
        "Inversão térmica.",
        "Destruição da camada de ozônio.",
        "Chuva ácida.",
        "Ampliação do efeito estufa.",
        "Eutrofização artificial."
      ],
      correctOptionIndex: 2,
      explanation: "A reação dos óxidos de enxofre e nitrogênio com a água na atmosfera gera precipitações de pH ácido (inferior a 5.6), fenômeno conhecido como Chuva Ácida. Ela corrói carbonatos (como o mármore), degrada florestas e acidifica ecossistemas aquáticos."
    },
    {
      contextText: "O processo de respiração celular aeróbica é responsável por produzir a maior parte da energia celular na forma de ATP (Trifosfato de Adenosina). Este processo é dividido em três etapas principais: Glicólise, Ciclo de Krebs e Cadeia Respiratória.",
      questionText: "Qual das seguintes estruturas celulares é o local de ocorrência da Cadeia Respiratória (fosforilação oxidativa)?",
      options: [
        "No complexo de Golgi.",
        "No citosol da célula.",
        "Nas cristas mitocondriais.",
        "No interior dos lisossomos.",
        "No estroma dos cloroplastos."
      ],
      correctOptionIndex: 2,
      explanation: "A glicólise ocorre no citosol. O ciclo de Krebs ocorre na matriz mitocondrial. Já a cadeia respiratória (ou fosforilação oxidativa), última etapa da respiração aeróbica onde há maior produção de ATP, ocorre nas cristas mitocondriais."
    }
  ],
  [EnemArea.HUMANAS]: [
    {
      contextText: "A Lei de Terras de 1850, promulgada no Brasil Império, estabeleceu que a aquisição de terras públicas só poderia ser realizada por meio da compra em leilões públicos, eliminando a tradicional doação de sesmarias e a posse por ocupação simples.",
      questionText: "Historicamente, essa legislação teve como principal impacto social e socioeconômico no país:",
      options: [
        "O incentivo à reforma agrária com distribuição justa de terras para pequenos produtores.",
        "A facilitação do acesso à terra para os imigrantes europeus recém-chegados.",
        "A consolidação do latifúndio e a exclusão da população pobre e dos ex-escravizados do acesso à propriedade rural.",
        "O fim definitivo das disputas de fronteiras agrárias entre as províncias.",
        "A estatização completa de todas as propriedades agrícolas produtivas."
      ],
      correctOptionIndex: 2,
      explanation: "A Lei de Terras de 1850 restringiu o acesso à terra apenas a quem possuía capital para comprá-la. Isso concentrou a estrutura fundiária nas mãos da elite cafeicultora latifundiária e marginalizou negros escravizados libertos e imigrantes pobres, dificultando sua ascensão social."
    },
    {
      contextText: "O Iluminismo foi um movimento intelectual e filosófico do século XVIII que defendia o uso da razão como o principal caminho para alcançar a liberdade, a ciência e o progresso social, opondo-se ao absolutismo monárquico e aos dogmas da Igreja.",
      questionText: "Um dos princípios fundamentais defendidos por pensadores como Montesquieu e que influencia as democracias modernas é:",
      options: [
        "A centralização absoluta do poder político na figura do soberano esclarecido.",
        "A divisão do poder político estatal em três esferas autônomas e harmônicas: Executivo, Legislativo e Judiciário.",
        "A submissão integral das leis civis aos dogmas e mandamentos religiosos vigentes.",
        "A eliminação total de qualquer forma de propriedade privada e economia de mercado.",
        "A extinção do Estado e o autogoverno anárquico das comunidades locais."
      ],
      correctOptionIndex: 1,
      explanation: "Montesquieu, em sua obra 'Do Espírito das Leis', formulou a teoria da tripartição dos poderes do Estado (Executivo, Legislativo e Judiciário) que servem de freio e contrapeso mútuos, garantindo a moderação do poder político e a liberdade individual."
    }
  ],
  [EnemArea.REDACAO]: [
    {
      contextText: "Em 2013, o tema da redação do ENEM foi 'Efeitos da implantação da Lei Seca no Brasil'. O texto exigia do candidato a elaboração de uma tese argumentativa consistente e uma proposta de intervenção social respeitando os direitos humanos.",
      questionText: "A redação do ENEM exige o formato de texto dissertativo-argumentativo. Uma característica obrigatória para obter nota máxima na Competência 5 é:",
      options: [
        "Apresentar uma narrativa emocionante que convença o leitor pelos sentimentos cotidianos.",
        "Formular uma proposta de intervenção detalhada que contenha obrigatoriamente cinco elementos: agente, ação, meio/modo, efeito e detalhamento.",
        "Copiar integralmente trechos dos textos motivadores fornecidos na coletânea de apoio.",
        "Terminar o texto com um poema reflexivo ou citação direta em latim de pensadores antigos.",
        "Propor medidas extremas de punição que ignorem os direitos humanos em prol da segurança imediata."
      ],
      correctOptionIndex: 1,
      explanation: "Na Competência 5 da redação do ENEM, para alcançar a pontuação máxima de 200 pontos, o candidato deve elaborar uma proposta de intervenção social para o problema abordado contendo exatamente 5 elementos estruturais: o Agente realizador, a Ação proposta, o Meio ou Modo de execução, o Efeito esperado e o Detalhamento de um desses termos."
    },
    {
      contextText: "Na estrutura do texto dissertativo-argumentativo do ENEM, a tese é o elemento que define o ponto de vista que o candidato irá defender ao longo de todo o seu texto.",
      questionText: "Em qual parte da redação a tese deve idealmente ser apresentada de forma clara e explícita para o corretor?",
      options: [
        "Somente no último parágrafo, junto com a proposta de intervenção.",
        "No final do desenvolvimento, para surpreender o leitor com a argumentação.",
        "No parágrafo de introdução, logo após a contextualização inicial do tema.",
        "Como um título em destaque acima de todo o texto.",
        "Não deve ser explícita, mas sim implícita nas entrelinhas de todo o texto."
      ],
      correctOptionIndex: 2,
      explanation: "No modelo padrão do ENEM, a tese (o posicionamento firme do candidato diante do problema) deve ser obrigatoriamente apresentada de forma clara e bem articulada logo na Introdução (primeiro parágrafo), para guiar toda a argumentação subsequente nos parágrafos de desenvolvimento."
    }
  ]
};

export const ESSAY_THEMES = [
  "Caminhos para combater a intolerância religiosa no Brasil",
  "Desafios para a formação educacional de surdos no Brasil",
  "Manipulação do comportamento do usuário pelo controle de dados na internet",
  "Democratização do acesso ao cinema no Brasil",
  "O estigma associado às doenças mentais na sociedade brasileira",
  "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil",
  "Valorização de comunidades e povos tradicionais no Brasil",
  "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil",
  "Desafios para a valorização da herança cultural e histórica africana no Brasil",
  "Caminhos para combater o analfabetismo funcional e expandir a leitura crítica entre jovens brasileiros"
];
