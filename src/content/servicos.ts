export type ItemOferta = { entrega: string; para: string };

export type Escopo = {
  quandoProcurar: string[];
  inclui: (string | ItemOferta)[];
  naoInclui: string[];
  terEmMaos?: string[];
};

export type PaginaServico = {
  slug: string;
  titulo: string;
  tituloSeo: string;
  h1: string;
  descricao: string;
  intro: string;
  escopo: Escopo;
  acao: string;
  ressalva?: string;
  tituloQuando?: string;
  tituloPerguntas?: string;
  fecho?: { titulo: string; texto: string };
  processo: { n: string; titulo: string; texto: string }[];
  perguntas: { p: string; r: string }[];
  tom: {
    enfase: 'oferta' | 'escopo' | 'ressalva';
    colunas: 1 | 2 | 3;
    ressalvaNoTopo?: boolean;
    heroi: 'dividido' | 'imersivo' | 'tipografico';
  };
};

const desenvolvimento: PaginaServico = {
  slug: "desenvolvimento-web",
  perguntas: [
    {
      p: "Vocês trabalham em um site que já existe?",
      r: "Sim. Dá para corrigir e evoluir o que já está no ar, e muitas vezes é o caminho mais curto e mais barato. Na conversa, com o endereço do site atual, já dá para indicar o caminho mais provável. A avaliação técnica detalhada faz parte do trabalho contratado, e a proposta diz em que informações a estimativa se baseia.",
    },
    {
      p: "O site vai aparecer no Google?",
      r: "O site é construído para poder ser encontrado: estrutura semântica, desempenho e acessibilidade são a base técnica que o Google lê. Aparecer bem posicionado, porém, depende também de conteúdo, concorrência e tempo. Por isso é uma base que se entrega, não uma posição que se promete.",
    },
    {
      p: "Quem escreve os textos e fornece as imagens?",
      r: "Os textos e as imagens são seus. A iTech não escreve o conteúdo, mas aproveita o que já existir, mesmo incompleto, e aponta o que falta para a página funcionar. Se não houver nada pronto, dá para começar pela estrutura e encaixar o conteúdo depois.",
    },
  ],
  titulo: "Desenvolvimento web e sistemas",
  tituloSeo: "Criação de sites e sistemas para empresas | iTech",
  h1: "Criação de sites e sistemas<br />sob medida",
  descricao:
    "Criação de sites institucionais, landing pages e sistemas internos para empresas. Projetos com foco em navegação, desempenho e facilidade de contato.",
  intro:
    "O seu site está trabalhando pela sua empresa ou só está no ar? A iTech começa entendendo o que o projeto precisa resolver: apresentar sua empresa, facilitar o pedido de orçamento ou organizar um processo que hoje depende de planilhas.",
  acao: "Conversar sobre o seu projeto",
  tituloQuando: "Quando vale criar ou melhorar um site ou sistema",
  tituloPerguntas: "Perguntas sobre sites e sistemas",
  fecho: {
    titulo: "Vamos conversar sobre seu site ou sistema",
    texto:
      "Se já existe um site ou sistema, envie o endereço e conte o que precisa mudar. Se o projeto ainda está no papel, explique o que sua empresa precisa fazer ou facilitar. Com essas informações, a iTech indica o caminho mais adequado e prepara uma proposta com as entregas previstas.",
  },
  tom: { enfase: 'oferta', colunas: 2, heroi: 'dividido' },
  processo: [
    {
      n: "01",
      titulo: "O que a página precisa fazer",
      texto:
        "O objetivo da página, para quem ela fala e como vamos saber se está cumprindo o que foi combinado.",
    },
    {
      n: "02",
      titulo: "Estrutura e requisitos",
      texto:
        "Estrutura das páginas, requisitos técnicos e integrações necessárias. Sai por escrito antes da primeira linha de código.",
    },
    {
      n: "03",
      titulo: "Construção",
      texto:
        "Estrutura semântica e navegação responsiva, com cuidados de acessibilidade, SEO técnico e atenção ao desempenho.",
    },
    {
      n: "04",
      titulo: "Entrega e evolução",
      texto:
        "Correções depois da entrega e manutenção evolutiva, conforme o escopo contratado.",
    },
  ],
  escopo: {
    quandoProcurar: [
      "Site antigo, que não acompanha o celular e perde o visitante no caminho",
      "Página no ar sem nenhuma forma clara de a pessoa pedir contato",
      "Necessidade de uma página específica para uma campanha ou oferta",
      "Sistema interno ou área de gestão que hoje é feito em planilha",
      "Projeto existente que precisa de correção e evolução, não de recomeço",
    ],
    inclui: [
      {
        entrega: "Site institucional",
        para: "Para apresentar sua empresa com clareza, organizar as informações importantes e facilitar que o visitante encontre o que procura e entre em contato.",
      },
      {
        entrega: "Landing page",
        para: "Para concentrar as informações de uma oferta ou campanha e conduzir o visitante à próxima ação, como solicitar um orçamento.",
      },
      {
        entrega: "Acessibilidade, SEO técnico e desempenho",
        para: "Para facilitar a navegação, tornar as páginas mais acessíveis e ajudar os mecanismos de busca a compreender o conteúdo. É base técnica, não posição prometida no Google.",
      },
      {
        entrega: "Painel administrativo e área de gestão",
        para: "Para que pessoas autorizadas consultem ou atualizem informações sem depender do desenvolvedor a cada alteração, quando essa função estiver prevista no projeto.",
      },
      {
        entrega: "Integrações",
        para: "Para conectar o site às ferramentas que sua empresa já usa e reduzir tarefas manuais, conforme o que a integração permitir.",
      },
      {
        entrega: "Correções e melhorias no que já existe",
        para: "Para corrigir problemas e acrescentar funcionalidades aproveitando o que já funciona, quando a estrutura atual permitir.",
      },
    ],
    naoInclui: [
      "aplicativo nativo para iOS ou Android",
      "loja virtual com meio de pagamento e gestão de estoque",
      "produção de conteúdo e redação dos textos do site",
      "hospedagem e administração de servidor como serviço contínuo",
      "manutenção fora do escopo contratado",
    ],
  },
};

const ciberseguranca: PaginaServico = {
  slug: "ciberseguranca",
  perguntas: [
    {
      p: "Vocês fazem teste de intrusão?",
      r: "Não. O trabalho aqui é anterior a isso: levantar o que está exposto, colocar os riscos em ordem e implantar os primeiros controles. Teste de intrusão faz sentido depois que esses controles estão no lugar.",
    },
    {
      p: "Isso resolve a LGPD da minha empresa?",
      r: "Resolve a parte técnica, que é uma das partes. Controle de acesso, backup e cuidado com dados pessoais entram no trabalho, com orientação sobre o que a lei espera em cada ponto. A parte jurídica, como base legal e contratos, é com advogado.",
    },
    {
      p: "O que acontece depois que os controles são implantados?",
      r: "A equipe fica sabendo o que mudou e por quê, e a orientação técnica combinada continua disponível. Acompanhamento contínuo é outro tipo de serviço, e dá para conversar sobre ele depois, com os primeiros controles já rodando.",
    },
  ],
  titulo: "Cibersegurança",
  tituloSeo: "Cibersegurança para pequenas e médias empresas | iTech",
  h1: "Cibersegurança para empresas<br />sem equipe de tecnologia",
  descricao:
    "Um retrato do que está exposto hoje, os riscos em ordem de prioridade e os primeiros controles no lugar. O limite do trabalho fica escrito antes.",
  intro:
    "Segurança de empresa pequena não se resolve com antivírus, e também não precisa de um centro de operações. Precisa de alguém que olhe a estrutura inteira, identifique os riscos que merecem atenção e ajude a definir por onde começar, deixando por escrito o que será feito e o que fica fora do trabalho.",
  acao: "Conversar sobre a sua segurança",
  tituloQuando: "Quando vale olhar para a segurança da empresa",
  tituloPerguntas: "Perguntas sobre segurança e LGPD",
  fecho: {
    titulo: "Vamos olhar a segurança da sua empresa?",
    texto:
      "Conte como a empresa trabalha hoje e o que mais preocupa. A iTech avalia o cenário, aponta o que merece atenção primeiro e explica quais ações fazem sentido e o que fica fora do trabalho.",
  },
  tom: { enfase: 'escopo', colunas: 2, heroi: 'imersivo' },
  processo: [
    {
      n: "01",
      titulo: "Diagnóstico",
      texto:
        "Levantamento da estrutura que existe hoje: o que está em uso, quem acessa o quê e por onde.",
    },
    {
      n: "02",
      titulo: "Priorização dos riscos",
      texto:
        "Os riscos em ordem de importância, e o limite do que entra. O escopo sai por escrito antes de qualquer mudança.",
    },
    {
      n: "03",
      titulo: "Controles iniciais",
      texto:
        "Implementação dos controles priorizados e configuração inicial de rotina de backup.",
    },
    {
      n: "04",
      titulo: "Orientação",
      texto:
        "Conscientização pontual da equipe e orientação técnica relacionada à segurança e à LGPD.",
    },
  ],
  escopo: {
    quandoProcurar: [
      "Dúvida se a empresa está protegida, e sem saber o que perguntar",
      "Backup que ninguém sabe se está funcionando",
      "Senhas compartilhadas entre pessoas e sistemas",
      "Acesso de alguém que saiu da empresa e talvez continue valendo",
      "Exigência de um cliente ou de um contrato sobre cuidados de segurança",
    ],
    inclui: [
      {
        entrega: "Diagnóstico e priorização de riscos",
        para: "Para identificar os riscos mais relevantes da estrutura atual e saber onde ficam os arquivos que importam. Sai uma lista em ordem, para a empresa decidir onde mexer primeiro em vez de tentar tudo de uma vez.",
      },
      {
        entrega: "Implementação inicial de controles",
        para: "Para transformar o diagnóstico em ações, e não apenas em uma lista de recomendações. Os controles previstos para a etapa inicial são implementados, com os acessos organizados conforme as necessidades da empresa.",
      },
      {
        entrega: "Configuração inicial de rotina de backup",
        para: "Para a cópia dos arquivos deixar de depender de alguém lembrar. Fica definido o que é copiado, para onde vai e com que frequência. Ter backup configurado não é o mesmo que ter recuperação testada, e essa diferença é esclarecida antes do início do trabalho.",
      },
      {
        entrega: "Conscientização pontual da equipe",
        para: "Para explicar à equipe quais cuidados adotar e por que eles importam. Assim, as orientações não ficam apenas no papel e podem ser incorporadas à rotina.",
      },
      {
        entrega: "Orientação técnica sobre segurança e LGPD",
        para: "Para orientar cuidados técnicos com dados pessoais, como controle de acesso, backup e uso das informações. Questões jurídicas, como bases legais e contratos, precisam de avaliação profissional específica.",
      },
    ],
    naoInclui: [
      "SOC 24/7",
      "pentest (teste de intrusão)",
      "resposta a incidentes",
      "auditorias formais de conformidade ou certificações para terceiros",
      "monitoramento contínuo",
      "parecer jurídico",
    ],
    terEmMaos: [
      "Quantas pessoas usam computador na empresa",
      "Quais sistemas e serviços a empresa usa no dia a dia",
      "Onde ficam os arquivos importantes hoje",
      "Se existe backup, e quem cuida dele",
    ],
  },
  ressalva:
    "Segurança reduz risco, não elimina: proteção total não existe. O trabalho é diminuir as chances onde elas mais pesam, e o diagnóstico serve justamente para descobrir onde isso está na sua empresa.",
};

const trafego: PaginaServico = {
  slug: "trafego-pago",
  perguntas: [
    {
      p: "A verba dos anúncios está incluída?",
      r: "Não. A verba vai direto para o Google ou a Meta, no seu cartão ou boleto, e você vê quanto gastou na própria plataforma. A iTech cuida do planejamento, da estruturação, da medição e dos ajustes. Quanto investir por mês é uma das primeiras conversas.",
    },
    {
      p: "Em quais plataformas vocês anunciam?",
      r: "Google, Meta e LinkedIn. Qual delas usar sai do objetivo e de onde está o seu público. Nem toda empresa precisa das três, e começar por uma costuma dar mais clareza do que espalhar a verba.",
    },
    {
      p: "Quem vai cuidar das minhas campanhas?",
      r: "Quem responde pela iTech cuida das campanhas diretamente. Anuncia para a própria empresa desde aproximadamente 2020, e hoje faz gestão diária de campanhas de e-commerce. O estudo na área é continuado, por conta própria.",
    },
    {
      p: "Vocês garantem quantos contatos vou receber?",
      r: "Não. Volume de contato depende da oferta, do preço, da concorrência e do comportamento de quem vê o anúncio. A medição é configurada conforme as ferramentas e integrações previstas no projeto, e ainda assim algumas conversões podem não ser associadas aos anúncios. Por isso o custo por contato serve como indicador para decidir se vale continuar, não como valor exato.",
    },
  ],
  titulo: "Tráfego pago",
  tituloSeo: "Tráfego pago com medição antes do anúncio | iTech",
  h1: "Tráfego pago, com medição<br />antes do primeiro anúncio",
  descricao:
    "Campanha estruturada com a medição ligada antes do primeiro anúncio, para saber de onde veio cada contato e o que vale continuar pagando.",
  intro:
    "Anúncio sem medição é verba saindo sem ninguém saber o que voltou. Por isso a medição entra antes do primeiro anúncio, e não depois que a verba já começou a sair.",
  acao: "Conversar sobre as suas campanhas",
  tom: { enfase: 'ressalva', colunas: 1, ressalvaNoTopo: true, heroi: 'tipografico' },
  processo: [
    {
      n: "01",
      titulo: "Objetivo e medição",
      texto:
        "O que a campanha precisa gerar, e o que será medido. A medição é configurada antes do primeiro anúncio subir.",
    },
    {
      n: "02",
      titulo: "Público e mensagem",
      texto:
        "Definição de público, segmentação e mensagens alinhadas ao objetivo do negócio. Orçamento e escopo por escrito.",
    },
    {
      n: "03",
      titulo: "Estruturação",
      texto:
        "Campanhas no Google, Meta ou LinkedIn, com rastreamento e API de conversões no servidor, quando aplicável.",
    },
    {
      n: "04",
      titulo: "Otimização",
      texto:
        "Testes de criativos e mensagens, ajuste de orçamento, e relatório do que foi feito e do que mudou.",
    },
  ],
  escopo: {
    quandoProcurar: [
      "Verba gasta em anúncio sem saber o que deu retorno",
      "Campanha que alguém criou e ninguém acompanha desde então",
      "Contato chegando sem ninguém saber de onde veio",
      "Vontade de anunciar, sem saber se faz sentido para o negócio",
    ],
    inclui: [
      "planejamento e estruturação de campanhas no Google, Meta e LinkedIn",
      "definição de público, segmentação e mensagens alinhadas ao objetivo do negócio",
      "configuração de rastreamento e API de conversões no servidor, quando aplicável",
      "testes de criativos e mensagens, com ajuste de orçamento",
      "otimização com base nos dados e acompanhamento das conversões",
      "relatórios claros do que foi feito e do que mudou",
    ],
    naoInclui: [
      "garantia de resultado, de posição ou de volume de contatos",
      "produção de vídeo e fotografia para os anúncios",
      "gestão de perfil e publicação orgânica em rede social",
      "atendimento comercial dos contatos que chegarem",
      "a verba de mídia, que é paga por você direto à plataforma",
    ],
  },
  ressalva:
    "Resultado de campanha depende de oferta, preço, concorrência e do comportamento de quem vê o anúncio. Boa parte disso fica fora do controle de quem gerencia a conta. Os dados disponíveis ajudam a avaliar o desempenho e orientar ajustes, mas não permitem identificar com precisão a origem de todos os contatos.",
};

export const paginasServico: PaginaServico[] = [
  desenvolvimento,
  ciberseguranca,
  trafego,
];

export const porSlug = (slug: string) =>
  paginasServico.find((p) => p.slug === slug);

export const perguntas = [
  {
    p: "Vocês atendem empresa pequena?",
    r: "Sim. Os três serviços são pensados para empresas que precisam resolver algo de tecnologia e não têm uma equipe interna para isso. O trabalho é dimensionado conforme a necessidade e a prioridade de cada negócio, no ritmo que fizer sentido para você.",
  },
  {
    p: "Preciso contratar os três serviços juntos?",
    r: "Não. Desenvolvimento web, cibersegurança e tráfego pago podem ser contratados separadamente. Se durante o trabalho aparecer um ganho em juntar dois serviços, isso é apresentado a você, e só acontece se estiver no escopo contratado.",
  },
  {
    p: "Quanto custa?",
    r: "Depende do que precisa ser feito, e por isso não há tabela de preço aqui. Primeiro entendemos a necessidade e definimos o escopo; depois vem a proposta, com o que está incluído, o valor e o prazo estimado. Se você já tem um orçamento em mente, diga desde o começo: dá para avaliar o que cabe nele, e dizer com clareza o que não cabe.",
  },
  {
    p: "Vocês atendem fora de Sorocaba?",
    r: "Sim. O atendimento é presencial em Sorocaba, e remoto para empresas de outras cidades do Brasil. O formato depende do serviço e do que o projeto exigir.",
  },
  {
    p: "Quanto tempo leva?",
    r: "Depende do escopo e da complexidade do trabalho. Um site institucional e uma revisão de segurança passam por etapas bem diferentes. O prazo estimado vai na proposta, depois da conversa. Se existe uma data importante, dá para organizar as entregas por etapas e priorizar o que for essencial.",
  },
  {
    p: "Mandei a mensagem. E agora?",
    r: "O próximo passo é uma conversa para entender o objetivo, o cenário atual e o que precisa ser resolvido. A partir daí avaliamos as alternativas e os próximos passos. Essa conversa não gera compromisso de contratação, e quanto mais detalhe você mandar, melhor dá para entender a necessidade.",
  },
];
