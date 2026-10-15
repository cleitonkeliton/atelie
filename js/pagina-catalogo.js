/* =========================================================================
 * pagina-catalogo.js — Vitrine com filtros, busca e ordenação
 * -------------------------------------------------------------------------
 * Fluxo:
 *  1. Lê os filtros que vieram na URL (ex.: catalogo.html?categoria=saias)
 *  2. Marca os campos do formulário de acordo
 *  3. Sempre que algo muda, filtra + ordena PRODUTOS e redesenha a grade
 *  4. Atualiza a URL para que o link possa ser compartilhado
 * ========================================================================= */

const parametros = new URLSearchParams(location.search);

/** Cria os checkboxes de categoria, coleção e tamanho a partir dos dados. */
function montarFiltros() {
  $("#filtro-categorias").innerHTML = Object.entries(CATEGORIAS)
    .map(([id, nome]) => `<label><input type="checkbox" name="categoria" value="${id}"> ${nome}</label>`)
    .join("");

  $("#filtro-colecoes").innerHTML = COLECOES
    .map((c) => `<label><input type="checkbox" name="colecao" value="${c.id}"> ${c.nome}</label>`)
    .join("");

  // Junta todos os tamanhos existentes, sem repetir (Set remove duplicados)
  const tamanhos = [...new Set(PRODUTOS.flatMap((p) => p.tamanhos))];
  $("#filtro-tamanhos").innerHTML = tamanhos
    .map((t) => `<label><input type="checkbox" name="tamanho" value="${t}"><span>${t}</span></label>`)
    .join("");
}

/** Marca no formulário os filtros que vieram pela URL. */
function aplicarFiltrosDaUrl() {
  ["categoria", "colecao", "tamanho"].forEach((nome) => {
    parametros.getAll(nome).forEach((valor) => {
      const campo = $(`input[name="${nome}"][value="${CSS.escape(valor)}"]`);
      if (campo) campo.checked = true;
    });
  });
  const preco = parametros.get("preco");
  if (preco) {
    const campo = $(`input[name="preco"][value="${CSS.escape(preco)}"]`);
    if (campo) campo.checked = true;
  }
  if (parametros.get("promo")) $('input[name="promo"]').checked = true;
  if (parametros.get("ordem")) $("#ordem").value = parametros.get("ordem");
}

/** Lê o estado atual dos filtros do formulário. */
function lerFiltros() {
  const form = $("#form-filtros");
  const marcados = (nome) => $$(`input[name="${nome}"]:checked`, form).map((i) => i.value);
  const [min, max] = (form.preco.value || "0-99999").split("-").map(Number);
  return {
    categorias: marcados("categoria"),
    colecoes: marcados("colecao"),
    tamanhos: marcados("tamanho"),
    min,
    max,
    promo: form.promo.checked,
    busca: (parametros.get("busca") || "").trim(),
    ordem: $("#ordem").value,
  };
}

/** Remove acentos e deixa minúsculo, para a busca achar "calca" em "Calça". */
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Aplica filtros e ordenação, devolvendo a lista final de produtos. */
function filtrarProdutos(f) {
  const termo = normalizar(f.busca);

  const lista = PRODUTOS.filter((p) => {
    if (f.categorias.length && !f.categorias.includes(p.categoria)) return false;
    if (f.colecoes.length && !f.colecoes.includes(p.colecao)) return false;
    if (f.tamanhos.length && !p.tamanhos.some((t) => f.tamanhos.includes(t))) return false;
    if (p.preco < f.min || p.preco > f.max) return false;
    if (f.promo && !p.precoAntigo) return false;
    if (termo) {
      const texto = normalizar(`${p.nome} ${p.descricao} ${CATEGORIAS[p.categoria]} ${nomeColecao(p.colecao)}`);
      if (!texto.includes(termo)) return false;
    }
    return true;
  });

  // Ordenação ("relevancia" mantém a ordem do cadastro, com destaques primeiro)
  const ordenadores = {
    relevancia: (a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0),
    novidades: (a, b) => (b.novo ? 1 : 0) - (a.novo ? 1 : 0),
    menor: (a, b) => a.preco - b.preco,
    maior: (a, b) => b.preco - a.preco,
    az: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
  };
  return lista.sort(ordenadores[f.ordem] || ordenadores.relevancia);
}

/** Atualiza título, contagem e grade. */
function renderizar() {
  const filtros = lerFiltros();
  const produtos = filtrarProdutos(filtros);

  // Título muda conforme o filtro principal
  let titulo = "Loja";
  if (filtros.busca) titulo = `Busca: “${filtros.busca}”`;
  else if (filtros.promo) titulo = "Promoções";
  else if (filtros.categorias.length === 1) titulo = CATEGORIAS[filtros.categorias[0]];
  else if (filtros.colecoes.length === 1) titulo = `Coleção ${nomeColecao(filtros.colecoes[0])}`;
  $("#titulo-catalogo").textContent = titulo;
  document.title = `${titulo} — ${LOJA.nome}`;

  const colecao = filtros.colecoes.length === 1 && COLECOES.find((c) => c.id === filtros.colecoes[0]);
  $("#descricao-catalogo").textContent = colecao ? colecao.descricao : "Peças autorais feitas no Recife.";

  $("#contagem").textContent = `${produtos.length} ${produtos.length === 1 ? "peça" : "peças"}`;

  $("#lista-produtos").innerHTML = produtos.length
    ? produtos.map(criarCardProduto).join("")
    : `<div class="vazio" style="grid-column: 1 / -1">
         <p>Nenhuma peça encontrada com esses filtros.</p>
         <a class="botao" href="catalogo.html">Ver todas as peças</a>
       </div>`;

  sincronizarCoracoes();
  atualizarUrl(filtros);
}

/** Grava os filtros na URL sem recarregar a página (history.replaceState). */
function atualizarUrl(f) {
  const nova = new URLSearchParams();
  f.categorias.forEach((v) => nova.append("categoria", v));
  f.colecoes.forEach((v) => nova.append("colecao", v));
  f.tamanhos.forEach((v) => nova.append("tamanho", v));
  if ($("#form-filtros").preco.value) nova.set("preco", $("#form-filtros").preco.value);
  if (f.promo) nova.set("promo", "1");
  if (f.busca) nova.set("busca", f.busca);
  if (f.ordem !== "relevancia") nova.set("ordem", f.ordem);
  const texto = nova.toString();
  history.replaceState(null, "", texto ? `?${texto}` : location.pathname);
}

document.addEventListener("DOMContentLoaded", () => {
  montarFiltros();
  aplicarFiltrosDaUrl();
  renderizar();

  $("#form-filtros").addEventListener("change", renderizar);
  $("#ordem").addEventListener("change", renderizar);
  // "Limpar filtros": o reset acontece depois do evento, por isso o setTimeout
  $("#form-filtros").addEventListener("reset", () => {
    parametros.delete("busca");
    $("#campo-busca").value = "";
    setTimeout(renderizar);
  });

  // Botão "Filtros" no celular abre/fecha o painel
  const botao = $(".botao-filtros");
  botao.addEventListener("click", () => {
    const aberto = $("#filtros").classList.toggle("aberto");
    botao.setAttribute("aria-expanded", String(aberto));
  });
});
