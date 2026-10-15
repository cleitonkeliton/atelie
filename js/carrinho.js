/* =========================================================================
 * carrinho.js — Lógica do carrinho de compras
 * -------------------------------------------------------------------------
 * O carrinho é salvo no localStorage do navegador. Assim, se a pessoa
 * fechar a aba e voltar depois, os itens continuam lá.
 *
 * Cada item do carrinho tem o formato:
 *   { id: "vestido-capibaribe", tamanho: "M", quantidade: 2 }
 *
 * Sempre que o carrinho muda, disparamos o evento "carrinho:atualizado"
 * para que as partes da tela (contador do menu, gaveta, checkout)
 * se redesenhem sozinhas.
 * ========================================================================= */

const Carrinho = {
  CHAVE: "arrecife:carrinho", // nome usado no localStorage

  /** Lê os itens salvos. Se não houver nada (ou der erro), devolve []. */
  itens() {
    try {
      const salvo = JSON.parse(localStorage.getItem(this.CHAVE));
      // Descarta itens de produtos que não existem mais no catálogo
      return Array.isArray(salvo) ? salvo.filter((item) => buscarProduto(item.id)) : [];
    } catch {
      return [];
    }
  },

  /** Salva a lista de itens e avisa a página que algo mudou. */
  salvar(itens) {
    try {
      localStorage.setItem(this.CHAVE, JSON.stringify(itens));
    } catch {
      // Navegação anônima ou armazenamento cheio: o carrinho só não persiste.
    }
    document.dispatchEvent(new CustomEvent("carrinho:atualizado"));
  },

  /** Adiciona um produto. Se o mesmo produto+tamanho já existir, soma a quantidade. */
  adicionar(id, tamanho, quantidade = 1) {
    const itens = this.itens();
    const existente = itens.find((i) => i.id === id && i.tamanho === tamanho);
    if (existente) {
      existente.quantidade += quantidade;
    } else {
      itens.push({ id, tamanho, quantidade });
    }
    this.salvar(itens);
  },

  /** Muda a quantidade de um item. Quantidade 0 remove o item. */
  alterarQuantidade(id, tamanho, quantidade) {
    let itens = this.itens();
    if (quantidade <= 0) {
      itens = itens.filter((i) => !(i.id === id && i.tamanho === tamanho));
    } else {
      const item = itens.find((i) => i.id === id && i.tamanho === tamanho);
      if (item) item.quantidade = Math.min(quantidade, 10); // limite de 10 por item
    }
    this.salvar(itens);
  },

  /** Remove um item do carrinho. */
  remover(id, tamanho) {
    this.alterarQuantidade(id, tamanho, 0);
  },

  /** Esvazia o carrinho (usado depois de finalizar a compra). */
  limpar() {
    this.salvar([]);
  },

  /** Quantidade total de peças (para o contador do menu). */
  contarPecas() {
    return this.itens().reduce((soma, i) => soma + i.quantidade, 0);
  },

  /** Soma dos preços (sem frete e sem desconto). */
  subtotal() {
    return this.itens().reduce(
      (soma, i) => soma + buscarProduto(i.id).preco * i.quantidade,
      0
    );
  },
};

/**
 * Calcula o frete a partir do CEP e do subtotal.
 * - CEPs de 50000-000 a 56999-999 são de Pernambuco; consideramos
 *   50 a 54 como Região Metropolitana do Recife (RMR).
 * - Retirada na loja é sempre grátis.
 * @returns {{valor:number, descricao:string}|null} null se o CEP for inválido
 */
function calcularFrete(cep, subtotal, retirarNaLoja = false) {
  if (retirarNaLoja) {
    return { valor: 0, descricao: "Retirada na loja (Recife Antigo)" };
  }
  const numeros = String(cep).replace(/\D/g, ""); // deixa só os dígitos
  if (numeros.length !== 8) return null;

  const prefixo = Number(numeros.slice(0, 2));
  const ehRMR = prefixo >= 50 && prefixo <= 54;

  if (ehRMR) {
    return subtotal >= REGRAS.freteGratisAcimaDe
      ? { valor: 0, descricao: "Entrega Recife e RMR — grátis 🎉" }
      : { valor: REGRAS.freteRMR, descricao: "Entrega Recife e RMR (1 a 2 dias úteis)" };
  }
  return { valor: REGRAS.freteNacional, descricao: "Entrega nacional (5 a 10 dias úteis)" };
}

/**
 * Valida um cupom.
 * @returns {number} percentual de desconto (ex.: 0.1) ou 0 se inválido
 */
function validarCupom(codigo) {
  return REGRAS.cupons[String(codigo).trim().toUpperCase()] || 0;
}
