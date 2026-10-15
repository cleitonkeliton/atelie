/* =========================================================================
 * pagina-conta.js — Login, cadastro, histórico e rastreio de pedidos
 * ========================================================================= */

/** HTML da linha do tempo de status de um pedido. */
function criarLinhaTempo(pedido) {
  const { etapas, indice } = Pedidos.status(pedido);
  return `<ol class="linha-tempo">${etapas
    .map((etapa, i) => `<li class="${i <= indice ? "feito" : ""} ${i === indice ? "atual" : ""}">${etapa}</li>`)
    .join("")}</ol>`;
}

/** Card completo de um pedido. Textos digitados passam por escaparHtml. */
function criarCardPedido(pedido) {
  const data = new Date(pedido.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const itens = pedido.itens
    .map((i) => `<li>${i.quantidade}× ${escaparHtml(i.nome)} (${escaparHtml(i.tamanho)}) — ${formatarPreco(i.preco * i.quantidade)}</li>`)
    .join("");
  return `
    <article class="pedido-card">
      <header>
        <strong>Pedido ${escaparHtml(pedido.numero)}</strong>
        <span class="texto-suave">${data}</span>
      </header>
      <ul>${itens}</ul>
      <p class="texto-suave">
        ${pedido.retirada ? "Retirada na loja" : "Entrega"}: ${escaparHtml(pedido.endereco)}<br>
        Pagamento: ${escaparHtml(pedido.pagamento)} · Total: <strong>${formatarPreco(pedido.total)}</strong>
      </p>
      ${criarLinhaTempo(pedido)}
    </article>`;
}

/** Mostra a área certa (visitante ou logada). */
function renderizarConta() {
  const usuario = Conta.atual();
  $("#area-visitante").hidden = !!usuario;
  $("#area-cliente").hidden = !usuario;
  if (!usuario) return;

  $("#titulo-conta").textContent = `Olá, ${usuario.nome.split(" ")[0]}!`;
  $("#subtitulo-conta").textContent = usuario.email;

  const pedidos = Pedidos.doEmail(usuario.email);
  $("#lista-pedidos").innerHTML = pedidos.length
    ? pedidos.map(criarCardPedido).join("")
    : `<div class="vazio"><p>Você ainda não fez pedidos com este e-mail.</p><a class="botao botao--cheio" href="catalogo.html">Começar a comprar</a></div>`;
}

/** Procura e exibe um pedido pelo número. */
function rastrear(numero) {
  const pedido = Pedidos.buscar(numero);
  $("#resultado-rastreio").innerHTML = pedido
    ? criarCardPedido(pedido)
    : `<p class="mensagem mensagem--erro">Pedido não encontrado. Confira o número e tente novamente.</p>`;
}

/** Executa uma ação assíncrona do formulário e mostra o erro, se houver. */
function tratarFormulario(form, caixaErro, acao) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    caixaErro.hidden = true;
    try {
      await acao();
      form.reset();
      renderizarConta();
      mostrarAviso("Bem-vinda(o) à Arrecife! 🌊");
    } catch (erro) {
      caixaErro.textContent = erro.message;
      caixaErro.hidden = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  tratarFormulario($("#form-entrar"), $("#erro-entrar"), () =>
    Conta.entrar($("#entrar-email").value, $("#entrar-senha").value)
  );
  tratarFormulario($("#form-cadastro"), $("#erro-cadastro"), () =>
    Conta.cadastrar($("#cad-nome").value, $("#cad-email").value, $("#cad-senha").value)
  );

  $("#sair").addEventListener("click", () => {
    Conta.sair();
    location.reload();
  });

  $("#form-rastreio").addEventListener("submit", (e) => {
    e.preventDefault();
    rastrear($("#numero-pedido").value);
  });

  // Vindo da tela de sucesso do checkout: conta.html?pedido=ARC-12345#rastreio
  const numero = new URLSearchParams(location.search).get("pedido");
  if (numero) {
    $("#numero-pedido").value = numero;
    rastrear(numero);
  }

  renderizarConta();
});
