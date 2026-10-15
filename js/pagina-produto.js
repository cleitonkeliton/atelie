/* =========================================================================
 * pagina-produto.js — Detalhes de um produto
 * -------------------------------------------------------------------------
 * A página é a mesma para todos os produtos: o id vem na URL
 * (produto.html?id=vestido-capibaribe) e o conteúdo é montado a partir
 * do item correspondente em PRODUTOS.
 * ========================================================================= */

/**
 * "Fotos" da galeria: variações da ilustração (fundo, zoom).
 * Com fotos reais, isto viraria uma lista de URLs de imagens.
 */
const VISTAS = [
  { nome: "Frente", fundo: "var(--areia)", zoom: 1 },
  { nome: "Detalhe do tecido", fundo: "var(--areia-escura)", zoom: 2.2 },
  { nome: "Look praia", fundo: "#d8e6ea", zoom: 1 },
  { nome: "Look noite", fundo: "var(--azul-mare)", zoom: 1 },
];

function mostrarVista(produto, indice) {
  const vista = VISTAS[indice];
  const caixa = $(".produto__imagem");
  caixa.style.background = vista.fundo;
  caixa.querySelector(".produto__arte").innerHTML = desenharProduto(produto);
  caixa.querySelector("svg").style.transform = `scale(${vista.zoom})`;
  $$(".produto__miniaturas button").forEach((b, i) => b.setAttribute("aria-pressed", String(i === indice)));
}

/** Monta a página inteira do produto. */
function renderizarProduto(p) {
  document.title = `${p.nome} — ${LOJA.nome}`;
  $('meta[name="description"]')?.setAttribute("content", p.descricao);

  $("#migalhas").innerHTML = `
    <a href="index.html">Início</a> /
    <a href="catalogo.html?categoria=${p.categoria}">${CATEGORIAS[p.categoria]}</a> /
    ${p.nome}`;

  const tamanhos = p.tamanhos
    .map((t) => `<label><input type="radio" name="tamanho" value="${t}" ${p.tamanhos.length === 1 ? "checked" : ""}><span>${t}</span></label>`)
    .join("");

  const miniaturas = VISTAS.map(
    (v, i) => `<button type="button" aria-label="${v.nome}" style="background:${v.fundo}" data-vista="${i}">${desenharProduto(p)}</button>`
  ).join("");

  $("#produto").innerHTML = `
    <div class="produto__galeria">
      <div class="produto__imagem">
        ${p.precoAntigo ? `<span class="selo selo--promo">Promo</span>` : p.novo ? `<span class="selo">Novo</span>` : ""}
        <div class="produto__arte" style="overflow:hidden;width:100%;display:grid;place-items:center"></div>
      </div>
      <div class="produto__miniaturas">${miniaturas}</div>
    </div>

    <div>
      <p class="sobretitulo">Coleção ${nomeColecao(p.colecao)}</p>
      <h1 style="font-size: clamp(2rem, 4vw, 2.8rem)">${p.nome}</h1>
      <p class="produto__preco">
        ${p.precoAntigo ? `<s>${formatarPreco(p.precoAntigo)}</s>` : ""} ${formatarPreco(p.preco)}
      </p>
      <p class="texto-suave">${textoParcelamento(p.preco)} · ${formatarPreco(p.preco * (1 - REGRAS.descontoPix))} no Pix</p>

      <form id="form-comprar">
        <div class="produto__bloco">
          <div class="produto__bloco-topo">
            <strong id="rotulo-tamanho">Tamanho</strong>
            ${p.categoria !== "acessorios" ? `<button class="botao-link" type="button" id="abrir-guia">📏 Guia de medidas</button>` : ""}
          </div>
          <fieldset class="tamanhos" aria-labelledby="rotulo-tamanho">${tamanhos}</fieldset>
          <p class="campo"><span class="erro" id="erro-tamanho" role="alert"></span></p>
        </div>

        <div class="produto__bloco produto__comprar">
          <div class="quantidade" aria-label="Quantidade">
            <button type="button" data-qtd="-1" aria-label="Diminuir quantidade">−</button>
            <span id="qtd">1</span>
            <button type="button" data-qtd="1" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="botao botao--cheio" type="submit">Adicionar à sacola</button>
          <button class="botao-icone" type="button" data-favoritar="${p.id}" aria-label="Favoritar" aria-pressed="false">${ICONES.coracao}</button>
        </div>
      </form>

      <div class="produto__bloco">
        <strong>Calcular frete</strong>
        <form class="frete-produto" id="form-frete" style="margin-top: 8px">
          <label class="sr-only" for="cep-produto">CEP</label>
          <input class="entrada" id="cep-produto" inputmode="numeric" placeholder="00000-000" maxlength="9" required>
          <button class="botao" type="submit">Calcular</button>
        </form>
        <p class="texto-suave" id="resultado-frete" aria-live="polite"></p>
      </div>

      <div class="acordeao abas">
        <details open>
          <summary>Descrição</summary>
          <p>${p.descricao}</p>
        </details>
        <details>
          <summary>Composição e cuidados</summary>
          <p><strong>Composição:</strong> ${p.composicao}.<br>
          Lavar à mão ou em ciclo delicado com água fria. Secar à sombra. Passar em temperatura baixa.</p>
        </details>
        <details>
          <summary>Trocas e devoluções</summary>
          <p>Primeira troca grátis em até 30 dias. Devolução por arrependimento em até 7 dias após o recebimento.
          <a href="ajuda.html#trocas">Saiba mais</a>.</p>
        </details>
        <details>
          <summary>Feito no Recife</summary>
          <p>Modelada e costurada no nosso ateliê do Recife Antigo, em pequenas tiragens, por costureiras da região metropolitana.</p>
        </details>
      </div>
    </div>`;

  mostrarVista(p, 0);
  $("#tabela-medidas").innerHTML = criarTabelaMedidas();
  configurarInteracoes(p);

  // Relacionados: mesma coleção ou mesma categoria, exceto o próprio produto
  const relacionados = PRODUTOS.filter(
    (x) => x.id !== p.id && (x.colecao === p.colecao || x.categoria === p.categoria)
  ).slice(0, 4);
  $("#relacionados").innerHTML = relacionados.map(criarCardProduto).join("");
  sincronizarCoracoes();
}

/** Liga os botões da página (galeria, quantidade, sacola, frete, guia). */
function configurarInteracoes(p) {
  let quantidade = 1;

  $(".produto__miniaturas").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-vista]");
    if (botao) mostrarVista(p, Number(botao.dataset.vista));
  });

  $$("[data-qtd]").forEach((botao) =>
    botao.addEventListener("click", () => {
      quantidade = Math.min(10, Math.max(1, quantidade + Number(botao.dataset.qtd)));
      $("#qtd").textContent = quantidade;
    })
  );

  // Adicionar à sacola: exige um tamanho escolhido
  $("#form-comprar").addEventListener("submit", (e) => {
    e.preventDefault();
    const escolhido = $('input[name="tamanho"]:checked');
    if (!escolhido) {
      $("#erro-tamanho").textContent = "Escolha um tamanho para continuar.";
      return;
    }
    $("#erro-tamanho").textContent = "";
    Carrinho.adicionar(p.id, escolhido.value, quantidade);
    abrirGaveta();
  });
  $(".tamanhos").addEventListener("change", () => ($("#erro-tamanho").textContent = ""));

  // Frete: aplica máscara 00000-000 enquanto digita
  const campoCep = $("#cep-produto");
  campoCep.addEventListener("input", () => (campoCep.value = mascararCep(campoCep.value)));
  $("#form-frete").addEventListener("submit", (e) => {
    e.preventDefault();
    const frete = calcularFrete(campoCep.value, p.preco * quantidade);
    $("#resultado-frete").innerHTML = frete
      ? `${frete.descricao}: <strong>${frete.valor ? formatarPreco(frete.valor) : "Grátis"}</strong> · ou retire grátis na loja`
      : "CEP inválido. Digite os 8 números.";
  });

  // Guia de medidas (usa o elemento <dialog> nativo do navegador)
  $("#abrir-guia")?.addEventListener("click", () => $("#guia-medidas").showModal());
  $("[data-fechar-dialog]").addEventListener("click", () => $("#guia-medidas").close());
}

document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(location.search).get("id");
  const produto = buscarProduto(id);

  if (!produto) {
    $("#produto").innerHTML = `
      <div class="vazio" style="grid-column: 1 / -1">
        <h1>Produto não encontrado</h1>
        <p>Essa peça pode ter esgotado ou o link está incorreto.</p>
        <a class="botao botao--cheio" href="catalogo.html">Voltar para a loja</a>
      </div>`;
    $("#relacionados").innerHTML = PRODUTOS.filter((p) => p.destaque).slice(0, 4).map(criarCardProduto).join("");
    return;
  }
  renderizarProduto(produto);
});
