/* =========================================================================
 * layout.js — Partes que se repetem em todas as páginas
 * -------------------------------------------------------------------------
 * Cabeçalho, menu, rodapé e a "gaveta" lateral do carrinho são criados
 * aqui uma única vez. Cada página HTML só precisa ter:
 *     <div id="cabecalho"></div>  ...conteúdo...  <div id="rodape"></div>
 * Assim, para mudar um link do menu, você altera só este arquivo.
 * ========================================================================= */

/** Ícones em SVG (desenhados com traço, herdam a cor do texto). */
const svg = (d) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONES = {
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  busca: svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  coracao: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  usuario: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  sacola: svg('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  fechar: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  whatsapp: svg('<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1.2-1.2 2 1-.5 1.6c-3.5.4-7.5-3.6-7.1-7.1l1.6-.5 1 2L10.5 11"/>'),
};

/** Links do menu principal. */
const MENU = [
  { texto: "Novidades", href: "catalogo.html?ordem=novidades" },
  { texto: "Loja", href: "catalogo.html" },
  { texto: "Vestidos", href: "catalogo.html?categoria=vestidos" },
  { texto: "Promoções", href: "catalogo.html?promo=1" },
  { texto: "Sobre", href: "sobre.html" },
  { texto: "Contato", href: "contato.html" },
];

/** Monta o cabeçalho (barra de aviso + logo + menu + ícones). */
function montarCabecalho() {
  const alvo = $("#cabecalho");
  if (!alvo) return;

  const links = MENU.map((item) => `<li><a href="${item.href}">${item.texto}</a></li>`).join("");

  alvo.outerHTML = `
    <a class="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
    <div class="faixa-aviso">
      Frete grátis no Recife e RMR acima de ${formatarPreco(REGRAS.freteGratisAcimaDe)}
      · 1ª compra? Use o cupom <strong>RECIFE10</strong>
    </div>
    <header class="cabecalho">
      <div class="container cabecalho__linha">
        <button class="botao-icone menu-mobile" type="button" aria-label="Abrir menu"
                aria-expanded="false" aria-controls="menu-principal">${ICONES.menu}</button>

        <a class="cabecalho__logo" href="index.html" aria-label="${LOJA.nome} — página inicial">
          <img src="assets/logo.svg" alt="${LOJA.nome}" width="168" height="48">
        </a>

        <nav class="menu" id="menu-principal" aria-label="Menu principal">
          <ul>${links}</ul>
        </nav>

        <div class="cabecalho__acoes">
          <form class="busca" action="catalogo.html" role="search">
            <label class="sr-only" for="campo-busca">Buscar produtos</label>
            <input id="campo-busca" name="busca" type="search" placeholder="Buscar…">
            <button class="botao-icone" type="submit" aria-label="Buscar">${ICONES.busca}</button>
          </form>
          <a class="botao-icone" href="favoritos.html" aria-label="Favoritos">
            ${ICONES.coracao}<span class="contador" id="contador-favoritos" hidden></span>
          </a>
          <a class="botao-icone" href="conta.html" aria-label="Minha conta">${ICONES.usuario}</a>
          <button class="botao-icone" type="button" id="abrir-carrinho" aria-label="Abrir sacola">
            ${ICONES.sacola}<span class="contador" id="contador-carrinho" hidden></span>
          </button>
        </div>
      </div>
    </header>`;

  // Destaca o link da página atual no menu
  const paginaAtual = location.pathname.split("/").pop() + location.search;
  $$(".menu a").forEach((a) => {
    if (a.getAttribute("href") === paginaAtual) a.setAttribute("aria-current", "page");
  });

  // Menu sanduíche (celular)
  const botaoMenu = $(".menu-mobile");
  botaoMenu.addEventListener("click", () => {
    const aberto = $(".menu").classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
  });

  // Mantém o termo pesquisado visível no campo de busca
  const termo = new URLSearchParams(location.search).get("busca");
  if (termo) $("#campo-busca").value = termo;

  $("#abrir-carrinho").addEventListener("click", abrirGaveta);
}

/** Monta o rodapé com links institucionais, contato e newsletter. */
function montarRodape() {
  const alvo = $("#rodape");
  if (!alvo) return;

  alvo.outerHTML = `
    <footer class="rodape">
      <div class="container rodape__grade">
        <div>
          <img src="assets/logo.svg" alt="${LOJA.nome}" width="190" height="54" class="rodape__logo">
          <p>${LOJA.slogan}</p>
          <p class="rodape__social">Instagram ${LOJA.instagram}</p>
        </div>
        <div>
          <h3>Institucional</h3>
          <ul>
            <li><a href="sobre.html">Nossa história</a></li>
            <li><a href="sobre.html#loja">Loja no Recife Antigo</a></li>
            <li><a href="marca.html">Identidade visual</a></li>
            <li><a href="contato.html">Fale conosco</a></li>
          </ul>
        </div>
        <div>
          <h3>Ajuda</h3>
          <ul>
            <li><a href="ajuda.html#perguntas">Perguntas frequentes</a></li>
            <li><a href="ajuda.html#entregas">Entregas e frete</a></li>
            <li><a href="ajuda.html#trocas">Trocas e devoluções</a></li>
            <li><a href="ajuda.html#tamanhos">Guia de tamanhos</a></li>
            <li><a href="conta.html#rastreio">Acompanhar pedido</a></li>
            <li><a href="ajuda.html#privacidade">Privacidade</a></li>
          </ul>
        </div>
        <div>
          <h3>Receba novidades</h3>
          <p>Lançamentos e promoções em primeira mão.</p>
          <form class="newsletter" data-newsletter>
            <label class="sr-only" for="news-email">Seu e-mail</label>
            <input id="news-email" type="email" required placeholder="seu@email.com">
            <button class="botao" type="submit">Assinar</button>
          </form>
          <p class="rodape__contato">${LOJA.endereco}<br>${LOJA.cidade}<br>${LOJA.telefone}</p>
        </div>
      </div>
      <div class="container rodape__base">
        <p>Pix · Cartão de crédito (até ${REGRAS.parcelasSemJuros}x) · Boleto</p>
        <p>© ${new Date().getFullYear()} ${LOJA.nome}. Marca fictícia criada para fins de demonstração.</p>
      </div>
    </footer>
    <a class="whatsapp-flutuante" href="https://wa.me/${LOJA.whatsapp}" target="_blank" rel="noopener"
       aria-label="Falar no WhatsApp">${ICONES.whatsapp}</a>`;
}

/** Cria a gaveta lateral do carrinho (fica escondida até ser aberta). */
function montarGaveta() {
  const gaveta = document.createElement("div");
  gaveta.innerHTML = `
    <div class="gaveta-fundo" data-fechar-gaveta hidden></div>
    <aside class="gaveta" id="gaveta" aria-label="Sacola de compras" aria-hidden="true">
      <div class="gaveta__topo">
        <h2>Sua sacola</h2>
        <button class="botao-icone" type="button" data-fechar-gaveta aria-label="Fechar sacola">${ICONES.fechar}</button>
      </div>
      <div class="gaveta__itens" id="gaveta-itens"></div>
      <div class="gaveta__rodape">
        <p class="gaveta__frete" id="gaveta-frete"></p>
        <p class="linha-total"><span>Subtotal</span><strong id="gaveta-subtotal"></strong></p>
        <a class="botao botao--cheio" href="checkout.html">Finalizar compra</a>
        <button class="botao-link" type="button" data-fechar-gaveta>Continuar comprando</button>
      </div>
    </aside>`;
  document.body.append(...gaveta.children);

  $$("[data-fechar-gaveta]").forEach((el) => el.addEventListener("click", fecharGaveta));
  // Tecla Esc fecha a gaveta
  document.addEventListener("keydown", (e) => e.key === "Escape" && fecharGaveta());
}

function abrirGaveta() {
  $("#gaveta").classList.add("aberta");
  $("#gaveta").setAttribute("aria-hidden", "false");
  $(".gaveta-fundo").hidden = false;
  document.body.classList.add("sem-rolagem");
}

function fecharGaveta() {
  const gaveta = $("#gaveta");
  if (!gaveta) return;
  gaveta.classList.remove("aberta");
  gaveta.setAttribute("aria-hidden", "true");
  $(".gaveta-fundo").hidden = true;
  document.body.classList.remove("sem-rolagem");
}

/**
 * HTML de uma linha de item do carrinho. Reaproveitado na gaveta e
 * no resumo do checkout.
 */
function criarLinhaItem(item) {
  const p = buscarProduto(item.id);
  return `
    <div class="item-carrinho" data-id="${item.id}" data-tamanho="${item.tamanho}">
      <a class="item-carrinho__imagem" href="produto.html?id=${p.id}">${desenharProduto(p)}</a>
      <div class="item-carrinho__info">
        <a href="produto.html?id=${p.id}"><strong>${p.nome}</strong></a>
        <span class="texto-suave">Tamanho: ${item.tamanho}</span>
        <div class="quantidade">
          <button type="button" data-acao="menos" aria-label="Diminuir quantidade">−</button>
          <span aria-live="polite">${item.quantidade}</span>
          <button type="button" data-acao="mais" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <div class="item-carrinho__direita">
        <strong>${formatarPreco(p.preco * item.quantidade)}</strong>
        <button class="botao-link" type="button" data-acao="remover">Remover</button>
      </div>
    </div>`;
}

/* Botões +, − e Remover de qualquer item do carrinho (delegação de eventos). */
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".item-carrinho [data-acao]");
  if (!botao) return;
  const linha = botao.closest(".item-carrinho");
  const { id, tamanho } = linha.dataset;
  const atual = Carrinho.itens().find((i) => i.id === id && i.tamanho === tamanho);
  if (!atual) return;

  if (botao.dataset.acao === "mais") Carrinho.alterarQuantidade(id, tamanho, atual.quantidade + 1);
  if (botao.dataset.acao === "menos") Carrinho.alterarQuantidade(id, tamanho, atual.quantidade - 1);
  if (botao.dataset.acao === "remover") Carrinho.remover(id, tamanho);
});

/** Redesenha a gaveta e os contadores do cabeçalho. */
function atualizarResumoCarrinho() {
  const itens = Carrinho.itens();
  const pecas = Carrinho.contarPecas();
  const subtotal = Carrinho.subtotal();

  const contador = $("#contador-carrinho");
  if (contador) {
    contador.textContent = pecas;
    contador.hidden = pecas === 0;
  }

  const lista = $("#gaveta-itens");
  if (!lista) return;
  lista.innerHTML = itens.length
    ? itens.map(criarLinhaItem).join("")
    : `<div class="vazio"><p>Sua sacola está vazia.</p>
         <a class="botao" href="catalogo.html">Ver a loja</a></div>`;

  $("#gaveta-subtotal").textContent = formatarPreco(subtotal);
  $(".gaveta__rodape").hidden = itens.length === 0;

  // Barra "faltam R$ X para o frete grátis"
  const falta = REGRAS.freteGratisAcimaDe - subtotal;
  $("#gaveta-frete").innerHTML =
    falta > 0
      ? `Faltam <strong>${formatarPreco(falta)}</strong> para frete grátis no Recife 🌊`
      : `Você ganhou <strong>frete grátis</strong> no Recife e RMR! 🎉`;
}

/** Atualiza o número de favoritos no cabeçalho. */
function atualizarContadorFavoritos() {
  const contador = $("#contador-favoritos");
  if (!contador) return;
  const total = Favoritos.ids().length;
  contador.textContent = total;
  contador.hidden = total === 0;
}

/* Formulários de newsletter (rodapé e página inicial). */
document.addEventListener("submit", (evento) => {
  const form = evento.target.closest("[data-newsletter]");
  if (!form) return;
  evento.preventDefault();
  form.reset();
  mostrarAviso("Pronto! Você vai receber nossas novidades 💌");
});

/* Quando o HTML terminar de carregar, monta tudo. */
document.addEventListener("DOMContentLoaded", () => {
  montarCabecalho();
  montarRodape();
  montarGaveta();
  atualizarResumoCarrinho();
  atualizarContadorFavoritos();
  sincronizarCoracoes();
});
document.addEventListener("carrinho:atualizado", atualizarResumoCarrinho);
document.addEventListener("favoritos:atualizado", atualizarContadorFavoritos);
