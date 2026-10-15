/* =========================================================================
 * pagina-institucional.js — Preenche dados da loja em páginas de texto
 * -------------------------------------------------------------------------
 * Em vez de repetir endereço/telefone em vários HTMLs, usamos atributos:
 *   <span data-loja="telefone"></span>   -> recebe LOJA.telefone
 *   <ul data-loja-horarios></ul>         -> recebe a lista de horários
 *   <iframe data-mapa></iframe>          -> recebe o mapa da loja
 *   <div data-tabela-medidas></div>      -> recebe a tabela de medidas
 * ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  $$("[data-loja]").forEach((el) => (el.textContent = LOJA[el.dataset.loja]));
  $$("[data-loja-horarios]").forEach((el) => (el.innerHTML = LOJA.horarios.map((h) => `<li>${h}</li>`).join("")));
  $$("[data-mapa]").forEach((el) => (el.src = urlMapa()));
  $$("[data-tabela-medidas]").forEach((el) => (el.innerHTML = criarTabelaMedidas()));
  $$("[data-whatsapp]").forEach((el) => (el.href = `https://wa.me/${LOJA.whatsapp}`));
  $$("[data-rota]").forEach(
    (el) => (el.href = `https://www.google.com/maps/dir/?api=1&destination=${LOJA.mapa.latitude},${LOJA.mapa.longitude}`)
  );
});
