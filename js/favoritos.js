/* =========================================================================
 * favoritos.js — Lista de desejos (produtos favoritados com o ♥)
 * -------------------------------------------------------------------------
 * Funciona igual ao carrinho: uma lista de ids salva no localStorage e um
 * evento ("favoritos:atualizado") avisando quando ela muda.
 * ========================================================================= */

const Favoritos = {
  CHAVE: "arrecife:favoritos",

  /** Lista de ids favoritados. */
  ids() {
    try {
      const salvo = JSON.parse(localStorage.getItem(this.CHAVE));
      return Array.isArray(salvo) ? salvo.filter((id) => buscarProduto(id)) : [];
    } catch {
      return [];
    }
  },

  /** O produto está nos favoritos? */
  contem(id) {
    return this.ids().includes(id);
  },

  /** Adiciona se não estiver; remove se já estiver. Devolve o novo estado. */
  alternar(id) {
    const ids = this.ids();
    const estava = ids.includes(id);
    const novos = estava ? ids.filter((x) => x !== id) : [...ids, id];
    try {
      localStorage.setItem(this.CHAVE, JSON.stringify(novos));
    } catch {
      /* sem armazenamento disponível */
    }
    document.dispatchEvent(new CustomEvent("favoritos:atualizado"));
    return !estava;
  },
};

/*
 * Clique em qualquer botão com o atributo data-favoritar="<id>" em qualquer
 * página. Usamos "delegação de eventos": um único ouvinte no documento
 * funciona até para cards criados depois que a página carregou.
 */
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-favoritar]");
  if (!botao) return;
  evento.preventDefault();
  const id = botao.dataset.favoritar;
  const agora = Favoritos.alternar(id);
  mostrarAviso(agora ? "Adicionado aos favoritos ♥" : "Removido dos favoritos");
});

/* Mantém todos os corações da página pintados de acordo com a lista. */
function sincronizarCoracoes() {
  const ids = Favoritos.ids();
  $$("[data-favoritar]").forEach((botao) => {
    const ativo = ids.includes(botao.dataset.favoritar);
    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });
}
document.addEventListener("favoritos:atualizado", sincronizarCoracoes);
