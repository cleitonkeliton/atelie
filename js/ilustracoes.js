/* =========================================================================
 * ilustracoes.js — Desenhos das peças em SVG
 * -------------------------------------------------------------------------
 * Em vez de depender de fotos, cada produto é desenhado na hora como um
 * SVG (imagem vetorial) a partir do seu "modelo", "cor", "detalhe" e
 * "estampa". Isso deixa o projeto leve e sem arquivos de imagem.
 *
 * Quando a loja tiver fotos reais, basta trocar a função
 * desenharProduto() por uma tag <img src="..."> com o caminho da foto.
 * ========================================================================= */

/**
 * Contornos (paths SVG) de cada modelo de peça.
 * Todos usam a mesma área de desenho: 200 de largura x 240 de altura.
 * - corpo:   a silhueta preenchida com a cor/estampa
 * - linhas:  costuras e detalhes desenhados por cima
 */
const MODELOS = {
  camisa: {
    corpo:
      "M70 30 L55 36 L20 72 L40 102 L56 90 L56 212 L144 212 L144 90 L160 102 L180 72 L145 36 L130 30 Q100 48 70 30 Z",
    linhas: "M70 30 L100 60 L130 30 M100 60 L100 212",
    botoes: [80, 110, 140, 170, 200],
  },
  bata: {
    corpo:
      "M68 40 Q100 60 132 40 L172 62 L160 104 L140 94 L148 206 Q100 216 52 206 L60 94 L40 104 L28 62 Z",
    linhas: "M68 40 Q100 60 132 40 M60 94 Q100 104 140 94",
  },
  vestido: {
    corpo:
      "M76 24 L84 24 Q100 44 116 24 L124 24 L130 62 L122 102 L172 222 Q100 234 28 222 L78 102 L70 62 Z",
    linhas: "M78 102 Q100 108 122 102 M76 24 L74 10 M124 24 L126 10",
  },
  saia: {
    corpo: "M68 38 L132 38 L136 58 L172 212 Q100 226 28 212 L64 58 Z",
    linhas: "M64 58 L136 58 M100 58 L100 70",
  },
  calca: {
    corpo: "M62 24 L138 24 L152 216 L112 216 L100 92 L88 216 L48 216 Z",
    linhas: "M63 42 L137 42 M100 42 L100 92 M80 42 L82 64",
  },
  bolsa: {
    corpo: "M38 96 L162 96 L150 206 Q100 216 50 206 Z",
    linhas: "M38 96 L162 96",
    alca: "M68 98 Q68 40 100 40 Q132 40 132 98",
  },
};

// Contador usado para criar ids únicos nos <pattern> do SVG
// (ids repetidos na mesma página fariam todas as estampas ficarem iguais).
let contadorIlustracao = 0;

/**
 * Gera o conteúdo do <pattern> (estampa) do SVG.
 * @param {string} estampa "liso" | "listras" | "bolinhas"
 * @param {string} cor     cor de fundo da peça
 * @param {string} detalhe cor dos detalhes da estampa
 */
function criarEstampa(estampa, cor, detalhe) {
  if (estampa === "listras") {
    return `<rect width="16" height="16" fill="${cor}"/>
            <rect width="16" height="6" fill="${detalhe}" opacity=".85"/>`;
  }
  if (estampa === "bolinhas") {
    return `<rect width="16" height="16" fill="${cor}"/>
            <circle cx="8" cy="8" r="2.6" fill="${detalhe}"/>`;
  }
  return `<rect width="16" height="16" fill="${cor}"/>`; // liso
}

/**
 * Desenha um produto e devolve o SVG em forma de texto (string),
 * pronto para ser inserido no HTML com innerHTML.
 * @param {object} produto item da lista PRODUTOS
 * @returns {string} código SVG
 */
function desenharProduto(produto) {
  const modelo = MODELOS[produto.modelo] || MODELOS.camisa;
  const idEstampa = `estampa-${produto.id}-${contadorIlustracao++}`;
  const traco = "rgba(0,0,0,.18)"; // cor das costuras

  // Botões (só camisas têm)
  const botoes = (modelo.botoes || [])
    .map((y) => `<circle cx="100" cy="${y}" r="3" fill="${produto.detalhe}" stroke="${traco}"/>`)
    .join("");

  // Alça (só bolsas têm)
  const alca = modelo.alca
    ? `<path d="${modelo.alca}" fill="none" stroke="${produto.detalhe}" stroke-width="7" stroke-linecap="round"/>`
    : "";

  return `
    <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg"
         role="img" aria-label="Ilustração: ${produto.nome}">
      <defs>
        <pattern id="${idEstampa}" width="16" height="16" patternUnits="userSpaceOnUse">
          ${criarEstampa(produto.estampa, produto.cor, produto.detalhe)}
        </pattern>
      </defs>
      <ellipse cx="100" cy="228" rx="70" ry="7" fill="rgba(0,0,0,.08)"/>
      ${alca}
      <path d="${modelo.corpo}" fill="url(#${idEstampa})" stroke="${traco}" stroke-width="2" stroke-linejoin="round"/>
      <path d="${modelo.linhas}" fill="none" stroke="${traco}" stroke-width="2" stroke-linecap="round"/>
      ${botoes}
    </svg>`;
}
