/* =========================================================================
 * utils.js — Funções auxiliares usadas em todas as páginas
 * ========================================================================= */

/** Formatador de moeda brasileira: 289.9 -> "R$ 289,90" */
const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Converte um número em texto no formato de reais. */
function formatarPreco(valor) {
  return formatadorMoeda.format(valor);
}

/** Atalho para document.querySelector. */
function $(seletor, raiz = document) {
  return raiz.querySelector(seletor);
}

/** Atalho para document.querySelectorAll (já devolve um array). */
function $$(seletor, raiz = document) {
  return Array.from(raiz.querySelectorAll(seletor));
}

/** Procura um produto pelo id. Devolve undefined se não existir. */
function buscarProduto(id) {
  return PRODUTOS.find((produto) => produto.id === id);
}

/**
 * Texto de parcelamento: "ou 6x de R$ 48,32 sem juros".
 * Valores pequenos são parcelados em menos vezes (parcela mínima de R$ 30).
 */
function textoParcelamento(valor) {
  const parcelas = Math.min(REGRAS.parcelasSemJuros, Math.floor(valor / 30));
  if (parcelas < 2) return "à vista no Pix ou cartão";
  return `ou ${parcelas}x de ${formatarPreco(valor / parcelas)} sem juros`;
}

/**
 * Mostra uma notificação rápida ("toast") no canto da tela.
 * @param {string} mensagem texto exibido
 */
function mostrarAviso(mensagem) {
  let area = $("#avisos");
  if (!area) {
    area = document.createElement("div");
    area.id = "avisos";
    area.className = "avisos";
    area.setAttribute("aria-live", "polite"); // leitores de tela anunciam o aviso
    document.body.appendChild(area);
  }
  const aviso = document.createElement("div");
  aviso.className = "aviso";
  aviso.textContent = mensagem;
  area.appendChild(aviso);
  // Remove o aviso depois de 3 segundos
  setTimeout(() => aviso.remove(), 3000);
}

/** Cria o HTML de um card de produto (usado na vitrine e nas sugestões). */
function criarCardProduto(produto) {
  const selo = produto.precoAntigo
    ? `<span class="selo selo--promo">Promo</span>`
    : produto.novo
    ? `<span class="selo">Novo</span>`
    : "";

  const precoAntigo = produto.precoAntigo
    ? `<s class="card__preco-antigo">${formatarPreco(produto.precoAntigo)}</s>`
    : "";

  return `
    <article class="card">
      <button class="card__favorito" type="button" data-favoritar="${produto.id}"
              aria-label="Favoritar ${produto.nome}" aria-pressed="false">${ICONES.coracao}</button>
      <a class="card__link" href="produto.html?id=${produto.id}">
        <div class="card__imagem">${selo}${desenharProduto(produto)}</div>
        <div class="card__info">
          <p class="card__colecao">Coleção ${nomeColecao(produto.colecao)}</p>
          <h3 class="card__nome">${produto.nome}</h3>
          <p class="card__preco">${precoAntigo} ${formatarPreco(produto.preco)}</p>
        </div>
      </a>
    </article>`;
}

/** Nome da coleção a partir do id ("frevo" -> "Frevo"). */
function nomeColecao(id) {
  const colecao = COLECOES.find((c) => c.id === id);
  return colecao ? colecao.nome : "";
}

/** Monta a URL do mapa do OpenStreetMap (gratuito, sem chave de API). */
function urlMapa() {
  const { latitude, longitude } = LOJA.mapa;
  const d = 0.004; // "zoom": quanto de área aparece ao redor da loja
  const caixa = [longitude - d, latitude - d, longitude + d, latitude + d].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${caixa}&layer=mapnik&marker=${latitude},${longitude}`;
}

/** Gera o HTML de uma tabela de medidas. */
function criarTabelaMedidas() {
  const th = TABELA_MEDIDAS.cabecalho.map((c) => `<th scope="col">${c}</th>`).join("");
  const linhas = TABELA_MEDIDAS.linhas
    .map(([t, ...medidas]) => `<tr><th scope="row">${t}</th>${medidas.map((m) => `<td>${m}</td>`).join("")}</tr>`)
    .join("");
  return `<table class="tabela"><thead><tr>${th}</tr></thead><tbody>${linhas}</tbody></table>`;
}

/** Máscara de CEP: "50030040" -> "50030-040". */
function mascararCep(valor) {
  return valor.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

/**
 * Escapa caracteres especiais antes de colocar texto digitado pela pessoa
 * dentro de innerHTML. Evita que alguém injete HTML/JavaScript na página.
 */
function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
