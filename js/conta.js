/* =========================================================================
 * conta.js — Conta da cliente e histórico de pedidos (DEMONSTRAÇÃO)
 * -------------------------------------------------------------------------
 * ATENÇÃO: este site não tem servidor. Contas e pedidos ficam salvos
 * apenas no navegador (localStorage) para que todas as telas funcionem.
 * A senha nunca é salva em texto puro: guardamos só um "hash" SHA-256.
 * Em produção, cadastro, login e pedidos devem ficar em um back-end.
 * ========================================================================= */

const Conta = {
  CHAVE_USUARIOS: "arrecife:usuarios",
  CHAVE_SESSAO: "arrecife:sessao",

  /** Lê um valor JSON do localStorage com segurança. */
  _ler(chave, padrao) {
    try {
      return JSON.parse(localStorage.getItem(chave)) ?? padrao;
    } catch {
      return padrao;
    }
  },

  _gravar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      /* sem armazenamento disponível */
    }
  },

  /** Gera o hash SHA-256 (em hexadecimal) de um texto. */
  async _hash(texto) {
    if (!window.crypto || !crypto.subtle) {
      throw new Error("Abra o site por um servidor local (veja o README) para usar a conta.");
    }
    const bytes = new TextEncoder().encode(texto);
    const resumo = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(resumo))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  /** Usuária logada no momento (ou null). */
  atual() {
    const email = this._ler(this.CHAVE_SESSAO, null);
    if (!email) return null;
    const usuario = this._ler(this.CHAVE_USUARIOS, {})[email];
    return usuario ? { nome: usuario.nome, email } : null;
  },

  /** Cria uma conta nova e já faz login. Lança erro se o e-mail já existir. */
  async cadastrar(nome, email, senha) {
    email = email.trim().toLowerCase();
    const usuarios = this._ler(this.CHAVE_USUARIOS, {});
    if (usuarios[email]) throw new Error("Já existe uma conta com este e-mail.");
    if (senha.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
    usuarios[email] = { nome: nome.trim(), senha: await this._hash(email + senha) };
    this._gravar(this.CHAVE_USUARIOS, usuarios);
    this._gravar(this.CHAVE_SESSAO, email);
  },

  /** Faz login. Lança erro se e-mail ou senha estiverem errados. */
  async entrar(email, senha) {
    email = email.trim().toLowerCase();
    const usuario = this._ler(this.CHAVE_USUARIOS, {})[email];
    if (!usuario || usuario.senha !== (await this._hash(email + senha))) {
      throw new Error("E-mail ou senha incorretos.");
    }
    this._gravar(this.CHAVE_SESSAO, email);
  },

  sair() {
    localStorage.removeItem(this.CHAVE_SESSAO);
  },
};

const Pedidos = {
  CHAVE: "arrecife:pedidos",

  /** Todos os pedidos feitos neste navegador (mais recentes primeiro). */
  todos() {
    return Conta._ler(this.CHAVE, []);
  },

  /** Pedidos de um e-mail específico. */
  doEmail(email) {
    return this.todos().filter((p) => p.cliente.email === email.trim().toLowerCase());
  },

  /** Busca um pedido pelo número (ex.: "ARC-48213"). */
  buscar(numero) {
    return this.todos().find((p) => p.numero === numero.trim().toUpperCase());
  },

  /** Salva um pedido novo e devolve o número gerado. */
  criar(pedido) {
    const numero = "ARC-" + Math.floor(10000 + Math.random() * 90000);
    const completo = { ...pedido, numero, data: new Date().toISOString() };
    Conta._gravar(this.CHAVE, [completo, ...this.todos()]);
    return numero;
  },

  /**
   * Status simulado: avança conforme o tempo passa desde a compra,
   * só para demonstrar a tela de acompanhamento.
   */
  status(pedido) {
    const minutos = (Date.now() - new Date(pedido.data)) / 60000;
    const etapas = pedido.retirada
      ? ["Pedido recebido", "Pagamento aprovado", "Separando suas peças", "Pronto para retirada"]
      : ["Pedido recebido", "Pagamento aprovado", "Separando suas peças", "Enviado", "Entregue"];
    const indice = Math.min(etapas.length - 1, Math.floor(minutos / 2)); // 1 etapa a cada 2 min
    return { etapas, indice };
  },
};
