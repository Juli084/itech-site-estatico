export const empresa = {
  nome: "iTech Soluções Digitais",
  nomeCurto: "iTech",
  cidade: "Sorocaba",
  uf: "SP",
  dominio: "itechsolucoesdigitais.com",
} as const;

export const atendimento = {
  presencial: "Sorocaba",
  remoto: "todo o Brasil",
  resumo: "Presencial em Sorocaba, e remoto para todo o Brasil",
} as const;

export const envioValidadoEmProducao = true;

export const textoCartaoCompartilhamento =
  "Desenvolvimento de sites e sistemas, tráfego pago e cibersegurança " +
  "para pequenas e médias empresas. Atendimento em Sorocaba, " +
  "além de atendimento remoto em todo o Brasil.";

export const contato = {
  email: "contato@itechsolucoesdigitais.com",
  whatsapp: "(15) 99753-4529",
  whatsappNumero: "5515997534529",
} as const;

export const linkWhatsapp = `https://wa.me/${contato.whatsappNumero}`;

export const organizacaoJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: empresa.nome,
  url: `https://${empresa.dominio}/`,
  email: contato.email,
  telephone: "+5515997534529",
  areaServed: [
    { "@type": "City", name: empresa.cidade },
    { "@type": "Country", name: "Brasil" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: contato.email,
    telephone: "+5515997534529",
    availableLanguage: "pt-BR",
  },
} as const;

export type Frente = {
  id: "desenvolvimento" | "ciberseguranca" | "trafego";
  slug: string;
  titulo: string;
  rotulo: string;
  problema: string;
  resumo: string;
};

export const frentes: Frente[] = [
  {
    id: "desenvolvimento",
    slug: "desenvolvimento-web",
    titulo: "Desenvolvimento web e sistemas",
    rotulo: "Frente 01",
    problema: "Site antigo, ruim no celular e sem gerar contato",
    resumo:
      "Site institucional, landing page ou sistema interno, construído para funcionar bem no celular, ser encontrado na busca e facilitar o contato de quem chega nele.",
  },
  {
    id: "ciberseguranca",
    slug: "ciberseguranca",
    titulo: "Cibersegurança",
    rotulo: "Frente 02",
    problema: "Sem saber se a empresa está protegida, e sem saber o que perguntar",
    resumo:
      "Um retrato do que está exposto hoje, os riscos em ordem de prioridade e os primeiros controles no lugar. O limite do trabalho fica escrito antes de mexer em qualquer coisa.",
  },
  {
    id: "trafego",
    slug: "trafego-pago",
    titulo: "Tráfego pago",
    rotulo: "Frente 03",
    problema: "Verba gasta em anúncio sem saber o que dá retorno",
    resumo:
      "Campanha estruturada com a medição ligada antes do primeiro anúncio, para saber de onde veio cada contato e o que vale a pena continuar pagando.",
  },
];

export const escopoCiberseguranca = {
  inclui: [
    "diagnóstico e priorização de riscos",
    "orientação e implementação inicial de controles",
    "configuração inicial de rotina de backup",
    "conscientização pontual da equipe",
    "orientação técnica relacionada à segurança e à LGPD",
  ],
  naoInclui: [
    "SOC 24/7",
    "pentest (teste de intrusão)",
    "resposta a incidentes",
    "auditorias formais de conformidade ou certificações para terceiros",
    "monitoramento contínuo",
    "parecer jurídico",
  ],
} as const;

export const comoTrabalhamos = [
  {
    n: "01",
    titulo: "Conversa inicial",
    texto: "Entendemos o objetivo, o público, o cenário atual e as necessidades da empresa.",
  },
  {
    n: "02",
    titulo: "Proposta",
    texto: "O serviço recomendado, as entregas previstas, o valor e o prazo estimado.",
  },
  {
    n: "03",
    titulo: "Planejamento e execução",
    texto: "Depois da aprovação: escopo, requisitos técnicos, cuidados de segurança e construção em etapas, com validações.",
  },
  {
    n: "04",
    titulo: "Acompanhamento",
    texto: "Depois da entrega, correções e melhorias conforme o escopo contratado.",
  },
];

export const diferenciais = [
  {
    titulo: "O problema vem antes da ferramenta",
    texto:
      "A pergunta é sempre o que precisa ser resolvido. A tecnologia entra depois, quando fica claro qual delas serve, e às vezes a resposta é que nenhuma serve.",
  },
  {
    titulo: "Estratégia antes da execução",
    texto:
      "Objetivos, entregas e escopo são alinhados com você antes de o trabalho começar, e não descobertos no meio dele.",
  },
  {
    titulo: "Você entende o que está sendo feito",
    texto:
      "O que será feito, por que será feito e como dá para avaliar o resultado, em linguagem de quem toca o negócio, não de quem escreve o código.",
  },
  {
    titulo: "Os três serviços conversam",
    texto:
      "Quem constrói o site entende de segurança, e quem cuida do anúncio controla a página que recebe o clique. Quando o seu caso pede mais de uma, elas se encaixam em vez de disputar.",
  },
];

export const compromissos = [
  {
    promessa: "Medição ligada antes do primeiro anúncio.",
    limite:
      "Resultado de campanha depende de oferta, preço e concorrência. A medição ajuda a entender quais campanhas geram contatos e onde vale ajustar o investimento.",
  },
  {
    promessa: "Base técnica para o site ser encontrado.",
    limite:
      "Estrutura, desempenho e acessibilidade são o que o buscador lê. Posição também depende de conteúdo e de tempo.",
  },
  {
    promessa: "Risco reduzido onde ele mais pesa.",
    limite:
      "Proteção total não existe. O trabalho é diminuir as chances certas, nas prioridades certas.",
  },
];

export const amostraTipografica = {
  titulo: "Escopo escrito antes de começar",
  corrido:
    "A iTech resolve presença digital, proteção e aquisição como um só problema. Antes de propor tecnologia, entendemos o que precisa ser resolvido e definimos o que faz parte e o que não faz parte da oferta. Acentuação do português em corpo de texto: ação, inspeção, manutenção, três, você, portão.",
  numeros: "01 02 03 04 — 1.280 px — 4,5:1 — 24 px — 8.2",
  rotulo: "Faz parte da oferta",
};
