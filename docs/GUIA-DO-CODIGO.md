# Guia do código

Este guia explica **como o site funciona por dentro**, pensando em quem está começando. Todos os arquivos `.js` e o `.css` também têm comentários explicando cada parte.

## 1. Visão geral

O site é **estático**: só HTML, CSS e JavaScript, sem servidor e sem etapa de build. O navegador baixa os arquivos e o JavaScript monta o conteúdo usando os dados de `js/dados.js`.

```
 dados.js ──► utils.js / carrinho.js / favoritos.js ──► layout.js ──► pagina-*.js
 (o que vender)   (ferramentas e regras)               (partes comuns)  (cada página)
```

### Ordem dos scripts
Cada página carrega os scripts nesta ordem (a ordem importa, porque um arquivo usa o que o anterior criou):

```html
<script src="js/dados.js"></script>        <!-- 1. dados -->
<script src="js/ilustracoes.js"></script>  <!-- 2. desenhos -->
<script src="js/utils.js"></script>        <!-- 3. funções auxiliares -->
<script src="js/carrinho.js"></script>     <!-- 4. sacola -->
<script src="js/favoritos.js"></script>    <!-- 5. favoritos -->
<script src="js/layout.js"></script>       <!-- 6. cabeçalho/rodapé -->
<script src="js/pagina-xxx.js"></script>   <!-- 7. código da página -->
```

Usamos scripts comuns (não módulos ES) de propósito: assim o site funciona até abrindo o arquivo com dois cliques.

## 2. Arquivo por arquivo

### `js/dados.js` — o “banco de dados”
- `LOJA`: nome, endereço, telefone, WhatsApp, horários e coordenadas do mapa.
- `REGRAS`: valores de frete, parcelas, desconto do Pix e cupons.
- `COLECOES`, `CATEGORIAS`: usados nos filtros e na página inicial.
- `PRODUTOS`: a lista de peças. Cada campo está explicado no comentário acima da lista.
- `TABELA_MEDIDAS`: guia de tamanhos.

**Exemplo — novo produto:**
```js
{
  id: "short-pina",              // único, sem espaços (vai na URL)
  nome: "Short de Linho Pina",
  categoria: "calcas",           // vestidos | camisas | blusas | calcas | saias | acessorios
  colecao: "capibaribe",         // capibaribe | frevo | mangue
  preco: 159.9,
  precoAntigo: 189.9,            // opcional: mostra o selo "Promo"
  tamanhos: ["P", "M", "G"],
  modelo: "calca",               // formato do desenho
  cor: "#EADBC4", detalhe: "#1B3A4B", estampa: "liso",
  novo: true,                    // opcional: selo "Novo"
  descricao: "Short leve para o verão.",
  composicao: "100% linho",
},
```

### `js/ilustracoes.js` — os desenhos das peças
Cada produto é desenhado como SVG a partir de `modelo`, `cor`, `detalhe` e `estampa`. Isso evita depender de fotos.

**Usando fotos reais:** coloque as imagens em `assets/produtos/` e adicione `foto: "assets/produtos/vestido.jpg"` ao produto. Depois, no começo de `desenharProduto()`, adicione:
```js
if (produto.foto) return `<img src="${produto.foto}" alt="${produto.nome}" loading="lazy">`;
```

### `js/utils.js` — ferramentas
- `formatarPreco(289.9)` → `"R$ 289,90"`
- `$("#id")` e `$$(".classe")` → atalhos para buscar elementos
- `buscarProduto(id)`, `criarCardProduto(produto)`, `mostrarAviso("texto")`
- `escaparHtml(texto)` → **sempre** use antes de colocar texto digitado pela pessoa em `innerHTML` (segurança contra injeção de código).

### `js/carrinho.js` — sacola, frete e cupom
- O objeto `Carrinho` guarda os itens no `localStorage` (memória do navegador), no formato `{ id, tamanho, quantidade }`.
- Toda alteração dispara o evento `carrinho:atualizado`. Qualquer parte da tela que mostra o carrinho escuta esse evento e se redesenha. Assim, nenhum código precisa “saber” quem mais depende do carrinho.
- `calcularFrete(cep, subtotal, retirada)`: CEPs que começam de 50 a 54 = Região Metropolitana do Recife.
- `validarCupom(codigo)`: devolve o percentual ou 0.

### `js/favoritos.js`
Mesma ideia do carrinho, para a lista de desejos. Qualquer botão com `data-favoritar="id-do-produto"` vira um botão de favoritar automaticamente (delegação de eventos).

### `js/conta.js` — conta e pedidos (demonstração)
- `Conta.cadastrar / entrar / sair / atual`. A senha é guardada como *hash* SHA-256, nunca em texto puro.
- `Pedidos.criar / buscar / doEmail / status`. O status avança sozinho a cada 2 minutos só para demonstrar a linha do tempo.

### `js/layout.js` — partes repetidas
Monta cabeçalho, menu, rodapé, botão de WhatsApp e a gaveta da sacola em todas as páginas. No HTML basta ter `<div id="cabecalho"></div>` e `<div id="rodape"></div>`.

### `js/pagina-*.js` — uma por página
| Arquivo | Responsabilidade |
|---|---|
| `pagina-inicial.js` | Preenche vitrines, coleções e mapa da home |
| `pagina-catalogo.js` | Filtros → `filtrarProdutos()` → `renderizar()`; mantém a URL sincronizada |
| `pagina-produto.js` | Lê `?id=` da URL, monta galeria, tamanhos, frete e relacionados |
| `pagina-checkout.js` | Máscaras, ViaCEP, totais, validação (CPF, Luhn do cartão) e criação do pedido |
| `pagina-conta.js` | Login/cadastro, lista de pedidos e rastreio |
| `pagina-institucional.js` | Preenche endereço, horários e mapa nas páginas de texto via atributos `data-*` |

### `css/estilos.css`
Dividido em 6 blocos numerados: variáveis → base → componentes → layout → seções → responsividade. Para mudar as cores da marca, altere só as variáveis em `:root`.

## 3. Como os dados são salvos

| Chave no localStorage | Conteúdo |
|---|---|
| `arrecife:carrinho` | Itens da sacola |
| `arrecife:favoritos` | Ids favoritados |
| `arrecife:usuarios` | Contas (nome + hash da senha) |
| `arrecife:sessao` | E-mail da conta logada |
| `arrecife:pedidos` | Pedidos feitos (o cartão guarda apenas os 4 últimos dígitos) |

Para “zerar” a loja: abra o DevTools (F12) → *Application* → *Local Storage* → apague as chaves.

## 4. Serviços externos usados

| Serviço | Para quê | Precisa de chave? |
|---|---|---|
| Google Fonts | Fontes Fraunces e Inter | Não |
| OpenStreetMap | Mapa da loja | Não |
| ViaCEP | Preencher endereço pelo CEP | Não |

Se algum estiver fora do ar, o site continua funcionando (fonte padrão, mapa vazio, endereço digitado à mão).

## 5. Próximos passos para virar uma loja real

1. **Back-end e banco de dados** para produtos, estoque, contas e pedidos (ex.: Node.js + PostgreSQL, Firebase ou Supabase), ou uma plataforma pronta (Shopify, Nuvemshop).
2. **Pagamento de verdade** com um gateway (Mercado Pago, PagSeguro, Stripe). Os dados do cartão nunca devem passar pelo seu código.
3. **Frete real** via API dos Correios ou Melhor Envio.
4. **Formulários** (contato e newsletter) ligados a um serviço de e-mail (Formspree, Mailchimp, Brevo).
5. **Fotos reais** das peças (veja a seção sobre ilustrações).
6. **Dados legais**: CNPJ, razão social e política de privacidade revisada (LGPD).
