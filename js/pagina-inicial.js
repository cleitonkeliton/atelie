/* =========================================================================
 * pagina-inicial.js — Preenche a home (index.html) com os dados da loja
 * ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Hero: duas peças em destaque
  $("#hero-arte").innerHTML = ["vestido-capibaribe", "saia-frevo"]
    .map((id) => `<div>${desenharProduto(buscarProduto(id))}</div>`)
    .join("");

  // Coleções: card colorido + uma peça de exemplo de cada uma
  $("#lista-colecoes").innerHTML = COLECOES.map((colecao) => {
    const exemplo = PRODUTOS.find((p) => p.colecao === colecao.id && p.modelo !== "bolsa");
    return `
      <a class="colecao" href="catalogo.html?colecao=${colecao.id}" style="background:${colecao.cor}">
        <div class="colecao__arte">${desenharProduto({ ...exemplo, cor: "#fffdf9" })}</div>
        <h3>${colecao.nome}</h3>
        <p>${colecao.descricao}</p>
        <span>Explorar coleção →</span>
      </a>`;
  }).join("");

  // Vitrines
  $("#lista-destaques").innerHTML = PRODUTOS.filter((p) => p.destaque).slice(0, 4).map(criarCardProduto).join("");
  $("#lista-novidades").innerHTML = PRODUTOS.filter((p) => p.novo).slice(0, 4).map(criarCardProduto).join("");

  // Loja física
  $("#loja-endereco").textContent = `${LOJA.endereco}, ${LOJA.cidade}`;
  $("#loja-horarios").innerHTML = LOJA.horarios.map((h) => `<li>${h}</li>`).join("");
  $("#loja-mapa").src = urlMapa();

  sincronizarCoracoes(); // pinta os ♥ dos produtos já favoritados
});
