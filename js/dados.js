/* =========================================================================
 * dados.js — "Banco de dados" da loja
 * -------------------------------------------------------------------------
 * Este arquivo concentra TODAS as informações que mudam com frequência:
 * dados da loja física, coleções e produtos. Para cadastrar um produto novo
 * basta copiar um item da lista PRODUTOS, mudar o "id" e os demais campos.
 *
 * Em um projeto maior, estes dados viriam de uma API ou de um painel
 * administrativo. Aqui eles ficam em um arquivo simples para facilitar
 * o entendimento.
 * ========================================================================= */

/** Informações da loja física e de contato. */
const LOJA = {
  nome: "Arrecife Ateliê",
  slogan: "Moda leve, feita no Recife, com a calma da maré.",
  endereco: "Rua da Moeda, 140 — Bairro do Recife (Recife Antigo)",
  cidade: "Recife — PE",
  cep: "50030-040",
  telefone: "(81) 3000-0000",
  whatsapp: "5581900000000", // somente números, com DDI (55) e DDD (81)
  email: "ola@arrecife.com.br",
  instagram: "@arrecife.atelie",
  horarios: [
    "Segunda a sexta: 10h às 19h",
    "Sábado: 9h às 17h",
    "Domingo: 10h às 15h (Recife Antigo de Boa)",
  ],
  // Coordenadas usadas no mapa (Recife Antigo).
  mapa: { latitude: -8.0637, longitude: -34.8713 },
};

/** Regras comerciais usadas no carrinho e no checkout. */
const REGRAS = {
  freteGratisAcimaDe: 299, // R$ — frete grátis para a Região Metropolitana
  freteRMR: 12.9,          // R$ — Região Metropolitana do Recife
  freteNacional: 29.9,     // R$ — demais regiões do Brasil
  parcelasSemJuros: 6,
  descontoPix: 0.05,       // 5% de desconto pagando no Pix
  // Cupons de desconto: código -> percentual (0.10 = 10%)
  cupons: {
    RECIFE10: 0.1,
    MARE15: 0.15,
  },
};

/** Coleções exibidas na página inicial. */
const COLECOES = [
  {
    id: "capibaribe",
    nome: "Capibaribe",
    descricao: "Tons de rio e de fim de tarde. Linho, viscose e caimento solto.",
    cor: "#1B3A4B",
  },
  {
    id: "frevo",
    nome: "Frevo",
    descricao: "Cor que pula na rua: amarelos, corais e estampas alegres.",
    cor: "#F2B134",
  },
  {
    id: "mangue",
    nome: "Mangue",
    descricao: "Inspirada no Manguebeat: verdes, terrosos e atitude.",
    cor: "#4F6F52",
  },
];

/** Nomes amigáveis das categorias (usados nos filtros). */
const CATEGORIAS = {
  vestidos: "Vestidos",
  camisas: "Camisas",
  blusas: "Blusas",
  calcas: "Calças",
  saias: "Saias",
  acessorios: "Acessórios",
};

/**
 * Lista de produtos.
 * Campos:
 *  - id:          identificador único (aparece na URL: produto.html?id=...)
 *  - nome:        nome exibido
 *  - categoria:   uma das chaves de CATEGORIAS
 *  - colecao:     uma das chaves de COLECOES
 *  - preco:       preço atual em reais
 *  - precoAntigo: (opcional) preço "de", para mostrar promoção
 *  - tamanhos:    tamanhos disponíveis
 *  - modelo:      formato da ilustração (ver ilustracoes.js)
 *  - cor/detalhe: cores da ilustração
 *  - estampa:     "liso", "listras" ou "bolinhas"
 *  - destaque:    true = aparece em "Mais amados"
 *  - novo:        true = recebe o selo "Novo"
 */
const PRODUTOS = [
  {
    id: "vestido-capibaribe",
    nome: "Vestido Capibaribe",
    categoria: "vestidos",
    colecao: "capibaribe",
    preco: 289.9,
    tamanhos: ["P", "M", "G", "GG"],
    modelo: "vestido",
    cor: "#1B3A4B",
    detalhe: "#F4EBDD",
    estampa: "liso",
    destaque: true,
    novo: true,
    descricao:
      "Vestido midi em viscose fluida, com alças finas e saia evasê. Cor de rio no fim da tarde, perfeito para um passeio pela Rua da Aurora.",
    composicao: "100% viscose",
  },
  {
    id: "camisa-aurora",
    nome: "Camisa de Linho Aurora",
    categoria: "camisas",
    colecao: "capibaribe",
    preco: 219.9,
    tamanhos: ["P", "M", "G", "GG"],
    modelo: "camisa",
    cor: "#EADBC4",
    detalhe: "#1B3A4B",
    estampa: "liso",
    destaque: true,
    descricao:
      "Camisa de linho com modelagem ampla e botões de coco. Fresca para o calor do Recife e elegante para a noite.",
    composicao: "70% linho, 30% algodão",
  },
  {
    id: "saia-frevo",
    nome: "Saia Midi Frevo",
    categoria: "saias",
    colecao: "frevo",
    preco: 179.9,
    precoAntigo: 219.9,
    tamanhos: ["PP", "P", "M", "G"],
    modelo: "saia",
    cor: "#F2B134",
    detalhe: "#E2725B",
    estampa: "listras",
    destaque: true,
    descricao:
      "Saia midi com cós alto e listras em amarelo e coral, como as sombrinhas do frevo. Gira bonito!",
    composicao: "100% algodão",
  },
  {
    id: "pantalona-boa-viagem",
    nome: "Pantalona Boa Viagem",
    categoria: "calcas",
    colecao: "frevo",
    preco: 239.9,
    tamanhos: ["P", "M", "G", "GG"],
    modelo: "calca",
    cor: "#E2725B",
    detalhe: "#F4EBDD",
    estampa: "liso",
    destaque: true,
    novo: true,
    descricao:
      "Pantalona de cintura alta e pernas amplas, cor coral. Do calçadão de Boa Viagem para o happy hour.",
    composicao: "97% poliéster, 3% elastano",
  },
  {
    id: "bata-olinda",
    nome: "Bata Bordada Olinda",
    categoria: "blusas",
    colecao: "frevo",
    preco: 159.9,
    tamanhos: ["P", "M", "G"],
    modelo: "bata",
    cor: "#FFFFFF",
    detalhe: "#E2725B",
    estampa: "bolinhas",
    descricao:
      "Bata branca com pontinhos bordados à mão por artesãs de Olinda. Mangas soltinhas e decote canoa.",
    composicao: "100% algodão",
  },
  {
    id: "camisa-mangue",
    nome: "Camisa Manguebeat",
    categoria: "camisas",
    colecao: "mangue",
    preco: 199.9,
    tamanhos: ["P", "M", "G", "GG", "XG"],
    modelo: "camisa",
    cor: "#4F6F52",
    detalhe: "#F4EBDD",
    estampa: "liso",
    destaque: true,
    descricao:
      "Camisa em tricoline verde-mangue, gola clássica e modelagem reta. Uma homenagem à antena parabólica fincada na lama.",
    composicao: "100% algodão",
  },
  {
    id: "calca-marco-zero",
    nome: "Calça Alfaiataria Marco Zero",
    categoria: "calcas",
    colecao: "capibaribe",
    preco: 259.9,
    tamanhos: ["36", "38", "40", "42", "44"],
    modelo: "calca",
    cor: "#2E5266",
    detalhe: "#F2B134",
    estampa: "liso",
    descricao:
      "Calça de alfaiataria com pregas e barra italiana. O ponto de partida de qualquer look.",
    composicao: "65% poliéster, 35% viscose",
  },
  {
    id: "saia-brennand",
    nome: "Saia Brennand",
    categoria: "saias",
    colecao: "mangue",
    preco: 189.9,
    tamanhos: ["P", "M", "G"],
    modelo: "saia",
    cor: "#B5603C",
    detalhe: "#F4EBDD",
    estampa: "bolinhas",
    novo: true,
    descricao:
      "Saia terracota com poás cor de areia, inspirada na cerâmica da Várzea.",
    composicao: "100% viscose",
  },
  {
    id: "bolsa-pina",
    nome: "Bolsa de Palha Pina",
    categoria: "acessorios",
    colecao: "capibaribe",
    preco: 129.9,
    tamanhos: ["Único"],
    modelo: "bolsa",
    cor: "#D9B77E",
    detalhe: "#1B3A4B",
    estampa: "listras",
    descricao:
      "Bolsa de palha trançada por artesãos pernambucanos, com alça de couro. Cabe a canga, o protetor e a água de coco.",
    composicao: "Palha natural e couro",
  },
  {
    id: "bata-casa-forte",
    nome: "Blusa de Linho Casa Forte",
    categoria: "blusas",
    colecao: "mangue",
    preco: 149.9,
    precoAntigo: 179.9,
    tamanhos: ["P", "M", "G", "GG"],
    modelo: "bata",
    cor: "#A3B18A",
    detalhe: "#4F6F52",
    estampa: "liso",
    descricao:
      "Blusa de linho verde-folha, leve como uma manhã na Praça de Casa Forte.",
    composicao: "100% linho",
  },
  {
    id: "vestido-ciranda",
    nome: "Vestido Ciranda",
    categoria: "vestidos",
    colecao: "frevo",
    preco: 269.9,
    tamanhos: ["P", "M", "G"],
    modelo: "vestido",
    cor: "#E2725B",
    detalhe: "#F2B134",
    estampa: "bolinhas",
    destaque: true,
    descricao:
      "Vestido rodado com poás amarelos, feito para entrar na roda de ciranda e não sair mais.",
    composicao: "100% algodão",
  },
  {
    id: "bolsa-maracatu",
    nome: "Bolsa Tiracolo Maracatu",
    categoria: "acessorios",
    colecao: "mangue",
    preco: 149.9,
    tamanhos: ["Único"],
    modelo: "bolsa",
    cor: "#1B3A4B",
    detalhe: "#F2B134",
    estampa: "bolinhas",
    novo: true,
    descricao:
      "Bolsa tiracolo em lona com pontos dourados, que lembram o brilho das golas do maracatu rural.",
    composicao: "Lona de algodão e metais dourados",
  },
];

/** Tabela de medidas (cm). Usada na página do produto e na ajuda. */
const TABELA_MEDIDAS = {
  cabecalho: ["Tamanho", "Busto", "Cintura", "Quadril"],
  linhas: [
    ["PP", "80–84", "62–66", "88–92"],
    ["P", "85–89", "67–71", "93–97"],
    ["M", "90–95", "72–77", "98–103"],
    ["G", "96–101", "78–83", "104–109"],
    ["GG", "102–108", "84–90", "110–116"],
    ["XG", "109–115", "91–97", "117–123"],
  ],
};
