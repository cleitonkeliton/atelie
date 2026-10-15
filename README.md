# 🌊 Arrecife Ateliê — E-commerce de moda feita no Recife

> **Marca fictícia** criada para demonstração. Nome, endereço, telefone e depoimentos são inventados.

A **Arrecife Ateliê** é uma loja de roupas autorais do Recife (PE). O nome vem dos *arrecifes*, a linha de pedras que deu nome à cidade e acalma o mar. A loja física fica no **Recife Antigo** (Rua da Moeda, 140 — Bairro do Recife; endereço fictício) e este repositório contém o **site de vendas completo**.

![Logo da Arrecife Ateliê](assets/logo.svg)

---

## ✨ O que o site faz

| Página | Arquivo | O que tem |
|---|---|---|
| Início | `index.html` | Destaque principal, vantagens, coleções, mais vendidos, promoção, novidades, depoimentos, loja física com mapa, newsletter |
| Loja / Catálogo | `catalogo.html` | Filtros (categoria, coleção, tamanho, preço, promoção), busca sem acentos, ordenação, link compartilhável |
| Produto | `produto.html?id=...` | Galeria, tamanhos, quantidade, sacola, favoritar, guia de medidas, cálculo de frete por CEP, descrição e cuidados, produtos relacionados |
| Sacola | gaveta lateral (todas as páginas) | Alterar quantidade, remover, subtotal, barra de “faltam R$ X para frete grátis” |
| Checkout | `checkout.html` | Dados pessoais, endereço automático pelo CEP (ViaCEP), entrega ou retirada na loja, cupom, Pix (5% off), cartão (até 6x) ou boleto, validação de CPF e cartão, confirmação do pedido |
| Minha conta | `conta.html` | Cadastro, login, histórico de pedidos e **acompanhamento do pedido** pelo número |
| Favoritos | `favoritos.html` | Lista de desejos (♥) |
| Sobre | `sobre.html` | História, valores, loja física, como chegar, mapa |
| Contato | `contato.html` | Formulário, WhatsApp, telefone, e-mail, horários |
| Ajuda | `ajuda.html` | Perguntas frequentes, entregas, pagamentos, trocas e devoluções, guia de tamanhos, privacidade |
| Identidade visual | `marca.html` | Logo, paleta, tipografia e tom de voz |
| Erro 404 | `404.html` | Página para endereços inexistentes |

Também tem: botão flutuante de WhatsApp, menu para celular, layout responsivo, acessibilidade (navegação por teclado, textos para leitores de tela) e avisos rápidos (“toasts”).

### Cupons para testar
- `RECIFE10` — 10% de desconto
- `MARE15` — 15% de desconto

### Dados de teste no checkout
- **CPF válido de exemplo:** `529.982.247-25`
- **Cartão de teste:** `4111 1111 1111 1111`, qualquer nome, validade futura (ex.: `12/30`), CVV `123`
- **CEP do Recife:** `50030-040` (frete local) · **CEP de São Paulo:** `01310-100` (frete nacional)

> ⚠️ Nenhum pagamento é real. Contas, carrinho e pedidos ficam salvos **só no seu navegador** (localStorage).

---

## 🚀 Como rodar

Não precisa instalar nada: é HTML, CSS e JavaScript puros.

**Opção 1 — abrir direto:** dê dois cliques no `index.html`.
(Quase tudo funciona; a parte de *conta* pode exigir a opção 2 em alguns navegadores.)

**Opção 2 — servidor local (recomendado):** na pasta do projeto, rode um destes comandos e acesse <http://localhost:8000>:

```bash
python3 -m http.server 8000
# ou
npx serve .
```

**Publicar grátis no GitHub Pages:** no repositório, vá em *Settings → Pages*, escolha a branch e a pasta `/ (root)` e salve. Em alguns minutos o site estará no ar.

---

## 📁 Estrutura de pastas

```
atelie/
├── index.html, catalogo.html, produto.html, checkout.html, ...   ← páginas
├── css/
│   └── estilos.css          ← todo o visual (cores da marca no topo)
├── js/
│   ├── dados.js             ← PRODUTOS, coleções, dados da loja, frete, cupons
│   ├── ilustracoes.js       ← desenha as peças em SVG
│   ├── utils.js             ← funções auxiliares (preço, card de produto…)
│   ├── carrinho.js          ← lógica da sacola, frete e cupom
│   ├── favoritos.js         ← lista de desejos
│   ├── conta.js             ← cadastro/login e pedidos (demonstração)
│   ├── layout.js            ← cabeçalho, rodapé e gaveta da sacola
│   └── pagina-*.js          ← código específico de cada página
├── assets/
│   ├── logo.svg             ← logo completo
│   └── simbolo.svg          ← símbolo / favicon
└── docs/
    ├── IDENTIDADE-VISUAL.md ← manual da marca
    └── GUIA-DO-CODIGO.md    ← como o código funciona e como alterar
```

---

## 🛠️ Tarefas comuns

| Quero… | Onde mexer |
|---|---|
| Cadastrar/editar um produto | `js/dados.js` → lista `PRODUTOS` |
| Mudar preço do frete ou criar cupom | `js/dados.js` → `REGRAS` |
| Mudar endereço, telefone, horários | `js/dados.js` → `LOJA` |
| Mudar cores ou fontes | `css/estilos.css` → bloco `:root` no topo |
| Mudar links do menu | `js/layout.js` → `MENU` |
| Usar fotos reais no lugar dos desenhos | veja `docs/GUIA-DO-CODIGO.md` |

Para entender cada parte com mais calma, leia **[docs/GUIA-DO-CODIGO.md](docs/GUIA-DO-CODIGO.md)**.
Para a marca, leia **[docs/IDENTIDADE-VISUAL.md](docs/IDENTIDADE-VISUAL.md)**.
