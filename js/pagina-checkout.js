/* =========================================================================
 * pagina-checkout.js — Finalização da compra
 * -------------------------------------------------------------------------
 * Responsável por:
 *  - mostrar o resumo do pedido e recalcular os totais a cada mudança
 *  - preencher o endereço automaticamente pelo CEP (API pública ViaCEP)
 *  - aplicar cupom, desconto do Pix e frete
 *  - validar o formulário (CPF, cartão etc.) e registrar o pedido
 *
 * IMPORTANTE: é uma DEMONSTRAÇÃO. Em uma loja real o pagamento seria
 * processado por um gateway (Mercado Pago, PagSeguro, Stripe…) no
 * servidor, e os dados do cartão nunca passariam pelo seu código.
 * ========================================================================= */

let cupomAplicado = ""; // código do cupom válido em uso

/* ---------- Máscaras de digitação ---------- */
const mascaras = {
  cpf: (v) => v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  telefone: (v) => v.replace(/\D/g, "").slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2"),
  cep: mascararCep,
  "cartao-numero": (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
  "cartao-validade": (v) => v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2"),
  "cartao-cvv": (v) => v.replace(/\D/g, "").slice(0, 4),
};

/* ---------- Validações ---------- */

/** Valida CPF pelos dígitos verificadores (algoritmo oficial da Receita). */
function cpfValido(cpf) {
  const n = cpf.replace(/\D/g, "");
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false; // 111.111.111-11 etc.
  const digito = (tamanho) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(n[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(n[9]) && digito(10) === Number(n[10]);
}

/** Valida número de cartão pelo algoritmo de Luhn. */
function cartaoValido(numero) {
  const n = numero.replace(/\D/g, "");
  if (n.length < 13) return false;
  let soma = 0;
  for (let i = 0; i < n.length; i++) {
    let d = Number(n[n.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    soma += d;
  }
  return soma % 10 === 0;
}

/** Validade MM/AA ainda não vencida. */
function validadeOk(texto) {
  const [mes, ano] = texto.split("/").map(Number);
  if (!mes || mes > 12 || ano === undefined) return false;
  const fimDoMes = new Date(2000 + ano, mes, 0, 23, 59);
  return fimDoMes >= new Date();
}

/* ---------- Cálculo dos totais ---------- */

/** Calcula todos os valores do pedido com base no formulário atual. */
function calcularTotais() {
  const form = $("#form-checkout");
  const subtotal = Carrinho.subtotal();
  const retirada = form.entrega.value === "loja";
  const frete = calcularFrete(form.cep.value, subtotal, retirada);

  const descontoCupom = subtotal * validarCupom(cupomAplicado);
  const descontoPix = form.pagamento.value === "pix" ? (subtotal - descontoCupom) * REGRAS.descontoPix : 0;
  const desconto = descontoCupom + descontoPix;
  const total = subtotal - desconto + (frete ? frete.valor : 0);

  return { subtotal, desconto, frete, total, retirada };
}

/** Redesenha o resumo lateral. */
function atualizarResumo() {
  const itens = Carrinho.itens();
  const temItens = itens.length > 0;
  $("#form-checkout").hidden = !temItens;
  $("#checkout-vazio").hidden = temItens || !$("#checkout-sucesso").hidden;
  if (!temItens) return;

  $("#resumo-itens").innerHTML = itens.map(criarLinhaItem).join("");

  const t = calcularTotais();
  $("#resumo-subtotal").textContent = formatarPreco(t.subtotal);
  $("#linha-desconto").hidden = t.desconto === 0;
  $("#resumo-desconto").textContent = "− " + formatarPreco(t.desconto);
  $("#resumo-frete").textContent = t.frete ? (t.frete.valor ? formatarPreco(t.frete.valor) : "Grátis") : "Informe o CEP";
  $("#preco-entrega-casa").textContent =
    t.retirada ? "—" : t.frete ? (t.frete.valor ? formatarPreco(t.frete.valor) : "Grátis") : "Informe o CEP";
  $("#resumo-total").textContent = formatarPreco(t.total);
  $("#resumo-parcelas").textContent = $("#form-checkout").pagamento.value === "cartao" ? textoParcelamento(t.total) : "";

  // Opções de parcelamento (parcela mínima de R$ 30)
  const maxParcelas = Math.max(1, Math.min(REGRAS.parcelasSemJuros, Math.floor(t.total / 30)));
  const selecionada = $("#parcelas").value;
  $("#parcelas").innerHTML = Array.from({ length: maxParcelas }, (_, i) => {
    const n = i + 1;
    return `<option value="${n}">${n}x de ${formatarPreco(t.total / n)} sem juros</option>`;
  }).join("");
  if (selecionada && selecionada <= maxParcelas) $("#parcelas").value = selecionada;
}

/* ---------- Endereço pelo CEP (ViaCEP) ---------- */

async function buscarEnderecoPorCep(cep) {
  const numeros = cep.replace(/\D/g, "");
  if (numeros.length !== 8) return;
  const status = $("#status-cep");
  status.textContent = "Buscando endereço…";
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
    const dados = await resposta.json();
    if (dados.erro) throw new Error("CEP não encontrado");
    $("#rua").value = dados.logradouro || "";
    $("#bairro").value = dados.bairro || "";
    $("#cidade").value = `${dados.localidade} / ${dados.uf}`;
    status.textContent = "";
    $("#numero").focus();
  } catch {
    // Sem internet ou CEP inexistente: a pessoa preenche manualmente
    status.textContent = "Não encontramos o CEP — preencha o endereço manualmente.";
  }
}

/* ---------- Validação e envio ---------- */

/** Mostra/limpa a mensagem de erro de um campo. Devolve se está válido. */
function marcarCampo(campo, valido, mensagem) {
  let erro = campo.parentElement.querySelector(".erro");
  if (!erro) {
    erro = document.createElement("span");
    erro.className = "erro";
    campo.parentElement.appendChild(erro);
  }
  erro.textContent = valido ? "" : mensagem;
  campo.setAttribute("aria-invalid", String(!valido));
  return valido;
}

/** Valida todos os campos visíveis. Devolve true se tudo estiver ok. */
function validarFormulario() {
  const form = $("#form-checkout");
  const resultados = [];

  // Campos obrigatórios simples (usa a validação nativa do HTML)
  $$("input[required]", form).forEach((campo) => {
    if (campo.closest("[hidden]")) return; // ignora campos escondidos
    resultados.push(marcarCampo(campo, campo.checkValidity(), "Preencha este campo corretamente."));
  });

  resultados.push(marcarCampo(form.cpf, cpfValido(form.cpf.value), "CPF inválido."));

  if (form.entrega.value === "casa") {
    resultados.push(marcarCampo(form.cep, !!calcularFrete(form.cep.value, 0), "CEP inválido."));
  }

  if (form.pagamento.value === "cartao") {
    resultados.push(marcarCampo($("#cartao-numero"), cartaoValido($("#cartao-numero").value), "Número de cartão inválido."));
    resultados.push(marcarCampo($("#cartao-nome"), $("#cartao-nome").value.trim().length > 3, "Informe o nome do cartão."));
    resultados.push(marcarCampo($("#cartao-validade"), validadeOk($("#cartao-validade").value), "Validade inválida."));
    resultados.push(marcarCampo($("#cartao-cvv"), /^\d{3,4}$/.test($("#cartao-cvv").value), "CVV inválido."));
  }

  const ok = resultados.every(Boolean);
  if (!ok) form.querySelector('[aria-invalid="true"]')?.focus();
  return ok;
}

/** Cria o pedido, limpa a sacola e mostra a tela de sucesso. */
function finalizarPedido(evento) {
  evento.preventDefault();
  const erroGeral = $("#erro-checkout");
  if (!validarFormulario()) {
    erroGeral.textContent = "Confira os campos destacados.";
    erroGeral.hidden = false;
    return;
  }
  erroGeral.hidden = true;

  const form = $("#form-checkout");
  const t = calcularTotais();
  const pagamento = form.pagamento.value;

  const numero = Pedidos.criar({
    cliente: {
      nome: form.nome.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      telefone: form.telefone.value,
    },
    itens: Carrinho.itens().map((i) => ({ ...i, nome: buscarProduto(i.id).nome, preco: buscarProduto(i.id).preco })),
    retirada: t.retirada,
    endereco: t.retirada
      ? LOJA.endereco
      : `${form.rua.value}, ${form.numero.value} ${form.complemento.value} — ${form.bairro.value}, ${form.cidade.value} — CEP ${form.cep.value}`,
    pagamento:
      pagamento === "cartao"
        ? `Cartão final ${$("#cartao-numero").value.replace(/\D/g, "").slice(-4)} em ${$("#parcelas").value}x` // só os 4 últimos dígitos!
        : pagamento === "pix" ? "Pix" : "Boleto",
    cupom: cupomAplicado,
    subtotal: t.subtotal,
    desconto: t.desconto,
    frete: t.frete.valor,
    total: t.total,
  });

  Carrinho.limpar();
  mostrarSucesso(numero, pagamento, t.total, form.nome.value.trim().split(" ")[0]);
}

function mostrarSucesso(numero, pagamento, total, primeiroNome) {
  const instrucoes = {
    pix: `<p>Escaneie o QR Code abaixo no app do seu banco (demonstração):</p><div class="pix-qr" aria-hidden="true"></div>`,
    boleto: `<p>O boleto foi enviado para o seu e-mail e vence em 3 dias úteis.</p>`,
    cartao: `<p>Pagamento aprovado! 💳</p>`,
  };
  const area = $("#checkout-sucesso");
  area.innerHTML = `
    <div class="caixa" style="max-width: 640px; margin: 24px auto 72px; text-align: center">
      <p style="font-size: 3rem; margin: 0">🌊</p>
      <h2></h2>
      <p>Seu pedido <strong>${numero}</strong> foi recebido. Total: <strong>${formatarPreco(total)}</strong>.</p>
      ${instrucoes[pagamento]}
      <p class="texto-suave">Enviamos a confirmação para o seu e-mail. Você pode acompanhar o status a qualquer momento.</p>
      <div class="hero__botoes" style="justify-content: center">
        <a class="botao botao--cheio" href="conta.html?pedido=${numero}#rastreio">Acompanhar pedido</a>
        <a class="botao" href="catalogo.html">Continuar comprando</a>
      </div>
    </div>`;
  // O nome digitado entra via textContent (nunca via innerHTML), evitando injeção de HTML
  area.querySelector("h2").textContent = `Pedido confirmado, ${primeiroNome}!`;
  area.hidden = false;
  $("#form-checkout").hidden = true;
  $("#checkout-vazio").hidden = true;
  window.scrollTo({ top: 0 });
}

/* ---------- Inicialização ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const form = $("#form-checkout");
  $("#info-parcelas").textContent = `até ${REGRAS.parcelasSemJuros}x`;
  $("#info-retirada").textContent =
    `Retire em ${LOJA.endereco}. Avisaremos pelo WhatsApp quando estiver pronto (geralmente no mesmo dia).`;

  // Se a cliente estiver logada, já preenche nome e e-mail
  const usuario = Conta.atual();
  if (usuario) {
    form.nome.value = usuario.nome;
    form.email.value = usuario.email;
    $("#aviso-conta").textContent = `Comprando como ${usuario.email}.`;
  } else {
    $("#aviso-conta").innerHTML = `Já tem conta? <a href="conta.html">Entrar</a> para acompanhar seus pedidos.`;
  }

  // Máscaras enquanto digita
  Object.entries(mascaras).forEach(([id, mascara]) => {
    const campo = $(`#${id}`);
    campo.addEventListener("input", () => (campo.value = mascara(campo.value)));
  });

  // CEP completo -> busca endereço e recalcula frete
  form.cep.addEventListener("input", () => {
    if (form.cep.value.replace(/\D/g, "").length === 8) buscarEnderecoPorCep(form.cep.value);
    atualizarResumo();
  });

  // Troca entre "receber em casa" e "retirar na loja", e entre formas de pagamento
  form.addEventListener("change", (e) => {
    if (e.target.name === "entrega") {
      const retirada = form.entrega.value === "loja";
      $("#campos-endereco").hidden = retirada;
      $("#info-retirada").hidden = !retirada;
    }
    if (e.target.name === "pagamento") {
      $("#campos-cartao").hidden = form.pagamento.value !== "cartao";
    }
    atualizarResumo();
  });

  // Cupom
  $("#aplicar-cupom").addEventListener("click", () => {
    const codigo = $("#cupom").value.trim().toUpperCase();
    const desconto = validarCupom(codigo);
    cupomAplicado = desconto ? codigo : "";
    $("#status-cupom").textContent = desconto
      ? `Cupom ${codigo} aplicado: ${Math.round(desconto * 100)}% de desconto 🎉`
      : "Cupom inválido.";
    atualizarResumo();
  });

  // Ao corrigir um campo, a mensagem de erro dele some
  form.addEventListener("input", (e) => {
    if (e.target.getAttribute("aria-invalid") === "true") marcarCampo(e.target, true, "");
  });

  form.addEventListener("submit", finalizarPedido);
  document.addEventListener("carrinho:atualizado", atualizarResumo);
  atualizarResumo();
});
