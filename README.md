# André da Empada — Website Oficial & Plataforma de Pedidos 🥧

> **"Fala Comigo! Feita pra você com amor e ingredientes de verdade."**

Plataforma web moderna, rápida e responsiva para o **André da Empada**, localizada em Indaiatuba/SP. O projeto foi concebido seguindo integralmente as diretrizes e frameworks do repositório **`claude-promptvault`** e das skills de design e engenharia avançada.

---

## 🎨 Branding & Identidade Visual

O projeto conta com manual de identidade visual e especificações completas em [docs/BRANDING_ANDRE_DA_EMPADA.md](file:///root/andre/docs/BRANDING_ANDRE_DA_EMPADA.md):

* **Cores Oficiais:**
  * 🟡 **Ouro Empada:** `#FBBA14` (Energia, massa folhada artesanal)
  * 🔴 **Vinho Bordô:** `#910C11` (Nobreza, títulos e ação principal)
  * ⚪ **Creme Baunilha:** `#F9F1DE` (Fundo aconchegante)
  * 🟤 **Café Expresso:** `#2E1308` (Tipografia e contornos de alto contraste)
  * 🟢 **Verde WhatsApp:** `#25D366` (Conversão e atendimento ágil)
* **Tipografia:** `Fredoka` e `Poppins` para títulos amigáveis e curvilíneos; `Plus Jakarta Sans` para interface e legibilidade perfeita em smartphones.
* **Tokens de Design:** Sincronizados em [assets/tokens.css](file:///root/andre/assets/tokens.css) e [assets/tokens.json](file:///root/andre/assets/tokens.json).
* **Ativos da Marca:** Mascote oficial André com toque blanche, selos recortados e a famosa marca da empada mordida.

---

## 🚀 Skills do `claude-promptvault` Utilizadas

1. **`brand` & `brandkit` & `logo-design`:**
   * Extração vetorial e cromática dos boards de branding.
   * Criação do manual de marca e tokens de design unificados.
2. **`ui-ux-pro-max` & `design-taste-frontend`:**
   * Arquitetura *mobile-first* (foco em conversão em smartphones).
   * Navegação sticky com abas deslizantes de categorias.
   * Busca instantânea debounced e chips de filtro (Vegetariano, Mais Pedidos, Combos, Empadões).
   * Feedback tátil com toasts animados e transições suaves.
3. **`whatsapp-conversion-funnel`:**
   * Gerador dinâmico de mensagens estruturadas para WhatsApp (`(19) 98949-0912`).
   * Elimina atritos formatando pedidos completos com código único `#AE-XXXX`, itens, adicionais, observações, dados do cliente e cálculo de entrega.
4. **`brazilian-payments-pix`:**
   * Integração de PIX Copia e Cola instantâneo com payload EMV dinâmico.
   * QR Code para leitura rápida e botão nativo de cópia com feedback de clipboard.
   * Temporizador regressivo de expiração de 15 minutos.
5. **`seo-local` & `seo-schema`:**
   * Marcação estruturada JSON-LD (`FastFoodRestaurant` / `LocalBusiness`) contendo dados completos do estabelecimento, horários e geolocalização em Indaiatuba/SP.
   * Meta tags OpenGraph otimizadas para compartilhamento no WhatsApp e redes sociais.

---

## 📦 Catálogo de Produtos

Todos os **183 produtos em 15 categorias** foram organizados com precisão a partir do cardápio oficial:
* **Empadas Salgadas (20 variações):** Camarão com Catupiry, Costela, Carne Seca, Palmito, 4 Queijos, etc.
* **Empadas Doces:** Romeu e Julieta, Banana com Doce de Leite, Morango com Chocolate.
* **Empadões Família (Até as 22h):** Serve de 2 a 3 pessoas.
* **Pastéis Artesanais (58 opções):** Tradicionais, especiais com brócolis e opções doces.
* **Lanches da Casa:** Hambúrguer de 200g, X-Tudo, X-Churrasco com maionese caseira.
* **Porções e Combos:** Combo Família, Combo Casal, Batata na Caixa de Pizza, Quarteto Fantástico.
* **Caldos Quentes, Monte Seu Macarrão, Salgados Assados e Fritos, Bebidas e Sobremesas.**

---

## 💻 Como Rodar o Projeto

Como o projeto é construído em tecnologia web estática pura e de alta performance, ele não requer build complexo nem dependências pesadas:

### Opção 1: Abrir diretamente no navegador
Basta abrir o arquivo [index.html](file:///root/andre/index.html) no seu navegador favorito.

### Opção 2: Servidor local com Python ou Node
```bash
cd /root/andre

# Com Python:
python3 -m http.server 8080

# Ou com Node:
npx serve .
```
Acesse em: `http://localhost:8080`.

### Opção 3: Publicar no GitHub Pages
Como o arquivo principal é o `index.html` na raiz do repositório, basta ativar o **GitHub Pages** nas configurações do repositório `Taiwansz/andre` apontando para a branch `main`.

---

## 📍 Informações do Estabelecimento

* **Nome:** André da Empada
* **CNPJ:** 46.134.717/0001-27
* **Endereço:** Av. Geraldo Hackmann, 742, Núcleo Habitacional Brigadeiro Faria Lima, Indaiatuba/SP
* **Telefone / WhatsApp:** (19) 98949-0912
* **Horário:** Terça a Domingo das 18h00 às 23h30 (Segunda: Fechado)
