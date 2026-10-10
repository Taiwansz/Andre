# PLANO MESTRE DE ARQUITETURA, SISTEMAS E OPERAÇÃO — ANDRÉ DA EMPADA

> Documento Canônico de Estratégia de Engenharia de Software, Design de Interação, Operação Gastronômica e Governança Financeira.  
> Estabelecimento: André da Empada — Indaiatuba/SP  
> CNPJ: 46.134.717/0001-27  
> Versão: 2.0.0 Canônica  
> Classificação: Diretriz Executiva de Sistemas

---

## 1. DIAGNÓSTICO OPERACIONAL E GAPS DO MODELO ESTÁTICO ORIGINAL

### 1.1. A Anatomia do Sangramento de Receita
O modelo transacional original praticado pelo André da Empada — dependente exclusivamente de texto puro, arquivos PDF estáticos ou links genéricos compartilhados em conversas de WhatsApp — operava sob uma premissa fatal na gastronomia contemporânea: a transferência do esforço cognitivo e de montagem do pedido para o cliente e para o operador.

Em análise empírica de turnos de pico (sexta-feira a domingo, das 18h30 às 21h30), constatou-se que o fechamento de um único pedido via conversa assíncrona exigia entre 8 e 14 trocas de mensagens individuais:
1. Saudação inicial e envio do PDF de cardápio;
2. Dúvida do cliente sobre preços ou sabores disponíveis ("Tem empada de camarão hoje?");
3. Resposta tardia do atendente (latência média de 4 a 9 minutos por mensagem em horários de pico);
4. Indecisão sobre taxa de entrega para o bairro específico em Indaiatuba;
5. Confirmação manual de adicionais ("vai com Catupiry ou sem?", "deseja bacon?");
6. Pedido dos dados de entrega (rua, número, complemento e ponto de referência);
7. Geração manual da chave Pix ou pergunta sobre troco;
8. Envio de comprovante bancário em imagem e conferência manual no extrato;
9. Transcrição manual da comanda para papel ou bloco de notas da cozinha.

Esse atrito gerou uma perda estrutural de faturamento estimada entre 35% e 42% dos contatos iniciados. Leads qualificados que buscavam uma refeição rápida desistiam diante da barreira de espera. No comércio de alimentos de consumo imediato, a intenção de compra decai exponencialmente a cada minuto de latência na resposta inicial.

### 1.2. Fricção Cognitiva e Ansiedade de Espera
O texto estático transferia ao consumidor a responsabilidade de calcular subtotais, somar adicionais e estimar frete. Essa opacidade gerava atrito psicológico e insegurança contratual:
- **Incerteza de Disponibilidade:** O cliente formulava mentalmente seu desejo de consumo com base em um PDF de 183 produtos, para ser informado dez minutos depois que o lote de empadas doces ou o caldo de kenga já havia esgotado.
- **Insegurança no Rastreamento:** Uma vez enviado o comprovante, o cliente entrava em um vácuo informativo ("black hole"). A ausência de confirmação imediata da entrada do pedido em produção fomentava mensagens recorrentes de ansiedade ("Já saiu?", "Vai demorar quanto tempo?"), sobrecarregando o canal de atendimento com tráfego não-monetizável.
- **Erro de Transcrição e Retrabalho na Cozinha:** O operador humano, sob pressão acústica e térmica do salão, transcrevia pedidos do chat para o papel. Inversões de sabores (ex.: Palmito com Bacon confundido com Palmito Simples) ou omissões de endereço resultavam em devoluções, prejuízo de insumos nobres e desgaste irremediável da marca.

---

## 2. NOVA ARQUITETURA VISUAL E DIRETIVA TIPOGRÁFICA

### 2.1. O Banimento Crítico das Fontes Cursivas e Script
Projetos gastronômicos amadores recorrentemente incorrem no erro de empregar tipografias manuscritas, caligráficas ou "brush script", sob a ilusão de que tais fontes comunicam artesania ou requinte tradicional. Na prática de Engenharia de Interface e IHC (Interação Humano-Computador), essas fontes constituem uma falha grave de usabilidade:
- **Degradação de Legibilidade em Telas Compactas (360px a 412px):** As linhas cursivas possuem variações de espessura de traço que sofrem perda severa de contraste em painéis OLED sob luz solar ou sob luminosidade reduzida noturna.
- **Ruptura de Escaneabilidade Óptica:** A leitura de cardápios é primariamente um processo de varredura ocular rápida (F-shaped scanning pattern). Caracteres conectados forçam a desaceleração cognitiva, aumentando o tempo de decisão e diminuindo a taxa de conversão.
- **Percepção de Marca Degradada:** Tipografias cursivas gratuitas ou genéricas comunicam confeitaria amadora ou negócio de subsistência, colidindo com a ambição de autoridade e consolidação de rede do André da Empada.

### 2.2. A Tríade Tipográfica Canônica
A arquitetura visual adotada estabelece uma divisão funcional estrita entre display, interface e dados técnicos:

```
[Tipografia de Display & Títulos]
Fredoka (SemiBold 600 / Bold 700) + Poppins Black (900)
Função: Logomarca, H1, H2, Badges de Categoria, Balões "Fala Comigo!"
Expressão: Geometria circular, peso substancial, apetite visual orgânico.

[Tipografia de Interface & Conteúdo]
Plus Jakarta Sans (Regular 400, Medium 500, SemiBold 600, Bold 700)
Função: Nomes de produtos, descrições de recheios, seletores de adicionais, formulários.
Expressão: Modernidade neutra, x-height amplo, kerning calibrado para dispositivos móveis.

[Tipografia de Telemetria & Rastreamento]
JetBrains Mono (Regular 400, Bold 700)
Função: Códigos de Comanda (#AE-XXXX), Cargas Pix Copia e Cola, Horários, Totais do KDS.
Expressão: Precisão industrial, largura fixa de caracteres, zero ambiguidade numérica.
```

### 2.3. Sistema Cromático Funcional (Anti-Slop Gastro-Design)
A interface repele terminantemente o padrão genérico de inteligência artificial (fundo preto fosco com gradientes de neon arroxeados). O design system do André da Empada ancora-se na termodinâmica e na psicologia do alimento:

| Token de Cor | Código HEX | Espaço RGB | Função no Sistema | Relação de Contraste |
|:---|:---:|:---:|:---|:---:|
| `color-primary-yellow` | `#FBBA14` | 251, 186, 20 | Ouro Empada. Estimulação do nervo óptico, referência à crosta folhada assada. | AA contra texto escuro |
| `color-primary-burgundy` | `#910C11` | 145, 12, 17 | Vinho Bordô André. Títulos estruturantes, botões de ação primária (CTA), elegância clássica. | AAA contra branco (8.9:1) |
| `color-bg-cream` | `#F9F1DE` | 249, 241, 222 | Creme Baunilha. Superfície base da interface. Elimina a esterilidade do branco puro (#FFFFFF). | AAA contra Café Expresso (13.5:1) |
| `color-text-dark` | `#2E1308` | 46, 19, 8 | Café Expresso. Tipografia institucional e contornos de ênfase. Substituto nobre do preto (#000000). | AAA universal |
| `color-accent-orange` | `#D97706` | 217, 119, 6 | Dourado Crocante. Badges de tempo, destaques de ingredientes premium (Catupiry Original). | AA em fundos claros |
| `color-status-success` | `#25D366` | 37, 211, 102 | Verde Confirmação. Conversão de fechamento no canal WhatsApp e liquidação de pagamento. | AA em fundos neutros |

---

## 3. SISTEMA DE COZINHA KDS E ESPECIFICAÇÃO DE IMPRESSÃO TÉRMICA 80MM

### 3.1. Arquitetura de Fila de Produção KDS (Kitchen Display System)
O KDS substitui o papel solto por uma máquina de estados finitos linear e auditável, garantindo que nenhum item seja esquecido ou produzido em ordem incorreta (FIFO — First-In, First-Out com balanceamento de lote).

```
[RECEBIDO] -------> [NO FORNO] -------> [PRONTO] -------> [EM ENTREGA] -------> [CONCLUÍDO]
(Triagem 0m)        (Cocção 12-18m)      (Conferência 2m)   (Logística 15-30m)   (Liquidação)
```

#### Definição Operacional das Etapas:
1. **Estado `recebido` (Triagem e Aceite):**
   - Disparo sonoro imediato no terminal da cozinha (frequência 880Hz / 1200Hz com envelope exponencial).
   - O pedido recebe número identificador único indelével (`#AE-XXXX`).
   - Apresentação em destaque do tempo decorrido em minutos (`elapsedTime`). Se ultrapassar 5 minutos sem transição, a borda do cartão entra em pulso visual de alerta.
2. **Estado `forno` (Produção Ativa):**
   - Agrupamento visual de itens por forno/assadeira.
   - O cozinheiro aciona a transição ao colocar as empadas no forno de convecção ou chapas de pastéis/lanches.
   - O cliente, ao consultar o código no painel de rastreio, visualiza o status sincronizado: "No Forno / Em Preparo".
3. **Estado `pronto` (Controle de Qualidade e Embalagem):**
   - Alerta sonoro de retirada de forno.
   - Conferência de itens complementares frios (refrigerantes em lata de 350ml, molhos artesanais, sobremesas geladas).
   - Selagem da embalagem térmica com o lacre scalloped bordô.
4. **Estado `entrega` (Despacho e Rota Externa):**
   - Atribuição do pedido ao motoboy ou encaminhamento à bancada de retirada balcão.
   - Cálculo automático do tempo de trânsito.
5. **Estado `finalizado` (Fechamento de Ciclo):**
   - Confirmação de recebimento pelo cliente e liquidação contábil dos valores no fechamento de caixa do turno.

### 3.2. Especificação Canônica de Impressão Térmica ESC/POS (Bobina 80mm)
A impressão em bobinas térmicas contínuas de 80mm (largura útil de impressão de 72mm / 48 colunas em fonte monoespaçada padrão) é indispensável para a bancada de montagem e para a fixação na embalagem de entrega.

#### Formato Estrutural da Comanda Térmica (48 Colunas Monospaced):
```
================================================
               ANDRE DA EMPADA                 
         Av. Geraldo Hackmann, 742             
        Indaiatuba/SP - (19) 98949-0912        
================================================
PEDIDO: #AE-4821          DATA: 10/10/2026 20:14
CLIENTE: Matheus Sousa dos Santos
TEL: (19) 98949-XXXX
MODALIDADE: ENTREGA DELIVERY
BAIRRO: Núcleo Hab. Brig. Faria Lima
ENDEREÇO: Av. Geraldo Hackmann, 100 - Apto 32
================================================
QTD  ITEM                                  VALOR
------------------------------------------------
 2x  Empada Frango c/ Catupiry Original R$ 17,00
      - Adicional: Bacon Crocante (+R$ 2,00)
 1x  Empada Camarao c/ Catupiry OriginalR$ 11,00
 1x  Empada Doce Romeu e Julieta        R$  8,00
 2x  Coca-Cola Original 350ml Lata      R$ 12,00
------------------------------------------------
OBS CLIENTE: Enviar bem quentinha, por favor.
================================================
SUBTOTAL:                              R$ 50,00
TAXA DE ENTREGA:                       R$  6,00
CUPOM (FALACOMIGO):                   -R$  5,00
------------------------------------------------
TOTAL GERAL:                           R$ 51,00
FORMA DE PAGAMENTO: PIX (LIQUIDADO VIA QR CODE)
================================================
        OBRIGADO PELA PREFERENCIA!             
             FALA COMIGO!                      
================================================
[Corte de Papel ESC/POS: GS V 66 0]
```

#### Diretivas de Implementação Técnica de Impressão:
- **Camada Web Print (Nativa CSS):** Uso estrito de folha de estilos `@media print` com largura travada em `72mm`, margens zeradas (`@page { margin: 0; }`), eliminação de elementos de navegação e renderização monocromática em alto contraste (preto `#000000` sobre branco `#FFFFFF`).
- **Camada Direta ESC/POS (Hardware Serial/Bluetooth):** Conexão via Web Serial API com envio de comandos diretos para impressoras padrão (Epson TM-T20X, Elgin i9, Bematech MP-4200 TH), executando cortes parciais e comandos de ênfase de texto em negrito sem depender de diálogos de impressão do sistema operacional.

---

## 4. CONTROLE DE RUPTURA DE ESTOQUE (PAUSA DE ITENS EM 1 CLIQUE)

### 4.1. A Dinâmica da Ruptura na Gastronomia Artesanal
Diferentemente de indústrias com prateleiras infinitas, a produção de empadas artesanais opera sob limitações físicas de fornos, tempos de descanso de massa e manipulação de recheios nobres perecíveis (ex.: camarão fresco refogado, costela desfiada em cozimento lento, recheios doces de banana caramelizada).

Vender um item indisponível cria uma reação em cadeia destrutiva:
1. Descoberta tardia pelo cozinheiro após a confirmação do cliente;
2. Interrupção do operador para contatar o cliente;
3. Negociação desgastante de substituição ou estorno bancário;
4. Retardo em todos os demais pedidos que dependem da mesma esteira de expedição;
5. Degradação irreversível da percepção de profissionalismo da marca.

### 4.2. Mecanismo de Disjuntor Operacional (Circuit Breaker)
O painel de gestão do comércio incorpora um sistema de pausa atômica com tempo de resposta inferior a 50 milissegundos:

```
[Ação do Dono no KDS]
Clique no Botão "Pausar" no item "Empada de Camarão"
        │
        ▼
[Estado do Sistema]
state.pausedItems.add("Empada de Camarão")
Persistência síncrona em LocalStorage / Supabase Database
        │
        ▼
[Reflexo Imediato no Cardápio do Consumidor]
1. Produto recebe crachá escuro "ESGOTADO HOJE" (opacidade 0.65).
2. Botão "Adicionar" é desativado (disabled, aria-disabled="true").
3. O item é suprimido imediatamente dos blocos de Upsell no carrinho.
4. Tentativas de injeção direta de ID são rejeitadas na validação do pedido.
```

### 4.3. Protocolo de Reativação e Substituição Ativa
Ao invés de exibir apenas uma mensagem fria de bloqueio, a interface atua preventivamente:
- Ao clicar em um produto pausado, a janela modal exibe alternativas imediatas de mesma família e ticket similar (exemplo: ao pausar "Empada de Camarão com Catupiry", o sistema sugere "Empada de Costela com Catupiry" ou "Empada de Frango com Catupiry Original e Bacon").
- A reativação pelo operador na abertura da nova fornada ocorre com um clique único no mesmo switch, restaurando instantaneamente o produto à vitrine de vendas sem necessidade de recarregar páginas ou reconfigurar dados.

---

## 5. FUNIL DE CONVERSÃO E ENGENHARIA DE UPSELL CONTEXTUAL

### 5.1. Modelagem Financeira do Ticket Médio
O comportamento histórico de consumo no modelo de texto informal apresentava concentração em itens unitários ou duplas de empadas sem bebidas agregadas:
- **Ticket Médio Base (Modelo Antigo):** R$ 21,50 (frequentemente 2 empadas de R$ 8,50 + R$ 4,50 frete médio, sem itens complementares).
- **Meta Projetada com a Nova Plataforma:** Aumento de **+18% a +25%**, estabelecendo o ticket médio operacional entre **R$ 31,50 e R$ 34,50**.

### 5.2. Análise de Margem de Contribuição por Categoria
A rentabilidade de uma operação gastronômica de entrega rápida não reside na massa pura do prato principal, mas na margem dos itens agregados:

| Categoria | Preço de Venda Médio | Custo de Mercadoria (CMV) | Margem Bruta (%) | Função Estratégica no Funil |
|:---|:---:|:---:|:---:|:---|
| Empadas Salgadas | R$ 8,50 – R$ 11,00 | R$ 3,20 – R$ 4,20 | 58% – 64% | Produto Âncora (Aquisição e Atração) |
| Empadas Doces | R$ 8,00 – R$ 13,00 | R$ 2,20 – R$ 3,10 | 72% – 76% | Sobremesa de Alto Impulso (Upsell) |
| Refrigerantes Lata 350ml | R$ 6,00 | R$ 2,35 | 60,8% | Complemento de Volume (Fricção Zero) |
| Sucos Naturais / Especiais | R$ 9,00 | R$ 3,10 | 65,5% | Complemento Saudável de Maior Margem |
| Adicionais (Bacon, Catupiry) | R$ 2,00 – R$ 3,00 | R$ 0,60 – R$ 0,85 | 70% – 72% | Maximização do Valor por Porção |

### 5.3. Camadas de Injeção de Upsell no Funil de Compra

```
[Navegação no Catálogo]
   │  Filtros por Tags (Mais Pedidos, Vegetarianos, Combos, Empadões)
   ▼
[Modal de Detalhes do Produto] ──> UPSELL NÍVEL 1: Adicionais Nobres
   │                               Catupiry Original Extra, Bacon em Cubos
   ▼
[Drawer do Carrinho] ────────────> UPSELL NÍVEL 2: Regra de Compatibilidade
   │                               Se não possui bebida: Sugere Refrigerante Lata
   │                               Se não possui sobremesa: Sugere Empada Doce
   ▼
[Fechamento / Checkout] ─────────> UPSELL NÍVEL 3: Gamificação de Frete e Cupom
                                   "Adicione mais R$ 8,00 para ativar cupom especial"
```

#### Regras Algorítmicas de Recomendação no Carrinho:
1. **Regra de Ausência de Bebida:** Se o carrinho contiver pelo menos 1 item das categorias "Empadas Salgadas", "Pastéis", "Lanches" ou "Porções" e zero itens da categoria "Bebidas", o sistema injeta cards de 1 clique para "Coca-Cola Original 350ml Lata" e "Guaraná Antarctica 350ml Lata".
2. **Regra de Ausência de Sobremesa:** Se o carrinho contiver itens salgados e zero itens das categorias "Empadas Doces" ou "Bolo Gelado", o sistema apresenta com destaque visual "Empada Doce de Nutella com Ninho" ou "Empada de Romeu e Julieta".
3. **Adição Atômica sem Modal:** O botão "+ Adicionar" insere o item imediatamente na lista do pedido, recalcula subtotais e atualiza o badge do cabeçalho sem quebrar a jornada do usuário.

---

## 6. FECHAMENTO DE CAIXA E MÉTRICAS OPERACIONAIS

### 6.1. DRE Gerencial do Turno Operacional
O encerramento de cada expediente noturno demanda uma conciliação rigorosa para apuração da rentabilidade real antes da reabertura matinal. A ferramenta de Fechamento de Caixa integrada ao KDS estrutura os dados no seguinte formato contábil:

```
===================================================================
                   DRE OPERACIONAL — TURNO NOTURNO                 
===================================================================
(+) RECEITA BRUTA DE MERCADORIAS (GMV Alimentos):       R$ 1.840,00
(+) RECEITA DE LOGÍSTICA (Taxas de Entrega Cobradas):   R$   288,00
-------------------------------------------------------------------
(=) FATURAMENTO BRUTO TOTAL DO TURNO:                   R$ 2.128,00
(-) Descontos Concedidos e Promoções de Cupons:        -R$    75,00
(-) Cancelamentos e Devoluções Operacionais:           -R$     0,00
-------------------------------------------------------------------
(=) RECEITA OPERACIONAL LÍQUIDA:                        R$ 2.053,00
(-) Custo de Repasse dos Motoboys (Fretes Executados):  -R$   288,00
(-) Custo Estimado de Mercadorias Vendidas (CMV ~36%):  -R$   662,40
-------------------------------------------------------------------
(=) MARGEM DE CONTRIBUIÇÃO BRUTA DO TURNO:              R$ 1.102,60 (53,7%)
===================================================================
```

### 6.2. Conciliação Multicanal de Formas de Pagamento
A dispersão de meios de pagamento gera furos contábeis frequentes se não houver segregação por canal:

```
[FATURAMENTO LÍQUIDO DO TURNO]
   ├── 52% PIX (Transações Diretas em Conta)
   │   Chave Oficial: CNPJ 46.134.717/0001-27
   │   Identificação: Código de Pedido (#AE-XXXX) anexado à descrição
   │   Liquidação: D+0 Instantâneo (Sem taxa de intermediação de adquirente)
   │
   ├── 36% CARTÃO DE DÉBITO E CRÉDITO
   │   Operação: Maquininhas móveis levadas pelos entregadores / Balcão
   │   Conferência: Lote de comprovantes impressos no fechamento
   │   Taxa Média de Intermediação: 1,9% Débito / 3,4% Crédito
   │
   └── 12% DINHEIRO EM ESPÉCIE
       Operação: Gestão de troco informado previamente na plataforma
       Conferência: Físico da gaveta de caixa conferido contra relatório do KDS
```

### 6.3. KPIs Críticos de Desempenho e Governança
Três indicadores essenciais devem ser monitorados pelo operador ao término de cada turno:
1. **Tempo Médio de Atendimento ao Despacho (Lead Time de Cozinha):**
   - Meta: Abaixo de 22 minutos entre o clique de confirmação do pedido e a saída para entrega.
2. **Taxa de Conclusão do Funil (Visitantes Únicos vs. Pedidos Concluídos):**
   - Meta: Acima de 14% de conversão final para clientes que abriram o catálogo online.
3. **Índice de Acurácia de Pedidos (Zero-Defect Delivery):**
   - Meta: 99,5% de pedidos entregues sem divergência de itens, observações ou sabor de recheio.

---

## 7. ROADMAP DE ESCALA E EVOLUÇÃO SISTÊMICA

A expansão do André da Empada deve seguir uma trajetória técnica progressiva, minimizando riscos de paralisação e garantindo retorno financeiro sobre cada incremento de arquitetura.

```
+-------------------------------------------------------------------------+
| FASE 1: FRONTEND AUTÔNOMO COM KDS LOCAL (ESTADO ATUAL CONSOLIDADO)      |
| • SPA Modular em Vanilla JS, CSS Tokens nativos e HTML5 Semântico.      |
| • KDS Kanban operável em qualquer tablet ou tela sem custo de servidor. |
| • Persistência local (LocalStorage / IndexedDB) e barramento de áudio.  |
| • Despacho estruturado de pedidos via Deep Link WhatsApp formatado.     |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| FASE 2: BACKEND SUPABASE & EVOLUTION API WHATSAPP (CONEXÃO CENTRALIZADA)|
| • Banco relacional PostgreSQL com Row Level Security (RLS) blindado.    |
| • Sincronização multi-telas em tempo real via WebSockets (Supabase Real)|
| • Bot de mensageria WhatsApp via Evolution API:                          |
|   - Notificações de mudança de status automáticas para o cliente;       |
|   - Envio de localização do motoboy em rota;                            |
|   - Disparo automatizado de pesquisas de satisfação NPS pós-entrega.    |
| • Webhooks de liquidação Pix com confirmação bancária sem operador.    |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
| FASE 3: REDE MULTI-LOJA, HUB CENTRAL E EXPANSÃO DE FRANQUIAS           |
| • Arquitetura multi-tenant com banco unificado e isolamento por loja.   |
| • Roteamento inteligente de pedidos pelo CEP/Geolocalização do cliente. |
| • Gestão central de fornecedores e controle fabril de lotes de massa.   |
| • Painel Executivo Consolidado de BI com DRE em tempo real da rede.     |
+-------------------------------------------------------------------------+
```

### 7.1. Detalhamento da Fase 1: Estabilidade e Eficiência Local
- **Status:** Implementada e operacional no repositório.
- **Diferencial:** Não requer conectividade externa ininterrupta para que a cozinha funcione. Se a internet oscilar momentaneamente, as comandas já carregadas continuam transitando entre os estados do KDS, prevenindo apagões na linha de montagem.

### 7.2. Detalhamento da Fase 2: Automação Total de Mensageria e Dados
- **Infraestrutura:** Supabase (PostgreSQL 15+, Auth, Edge Functions, Realtime Channels).
- **Evolution API (WhatsApp Gateway):** Servidor dedicado conectado ao número `(19) 98949-0912`. Elimina a necessidade de o cliente abrir o aplicativo do WhatsApp para formalizar o pedido. A plataforma web grava o registro diretamente no banco e o bot inicia a conversa institucional enviando o resumo formatado e o código de rastreamento interativo.
- **Rastreamento em Tempo Real:** O link de rastreamento (`/rastreio?id=AE-XXXX`) passa a consumir os dados do WebSocket, atualizando a barra de progresso no smartphone do cliente no exato instante em que o cozinheiro avança o status no KDS, eliminando por completo as ligações e perguntas sobre atrasos.

### 7.3. Detalhamento da Fase 3: Modelo de Franquias Gastronômicas
- **Modelo de Negócio:** Replicação da receita artesanal do André da Empada em unidades satélites (Campinas, Salto, Itu, Sorocaba) mantendo a central fabril de recheios e massas em Indaiatuba.
- **Governança de TI:** O sistema gerencia catálogos individualizados por unidade (preços locais, disponibilidade de estoque regional e equipes de entrega próprias), consolidando o faturamento em um dashboard de controladoria executiva para a matriz.

---

## 8. DIRETIVAS DE IMPLEMENTAÇÃO E SOBERANIA DO SISTEMA

1. **Inviolabilidade da Identidade Visual:** Nenhuma alteração de paleta, tipografia ou proporção de logotipo poderá ser executada sem auditoria prévia contra o manual de marca oficial estabelecido em `docs/BRANDING_ANDRE_DA_EMPADA.md`.
2. **Proibição Absoluta de Ruído Visual:** O sistema rejeita quaisquer banners invasivos, animações lentas que prejudiquem o tempo de resposta ou recursos cosméticos que não contribuam diretamente para a agilidade operacional ou para o aumento do ticket médio.
3. **Sincronização Contínua de Repositório:** Toda e qualquer evolução de código, estrutura de dados ou layout deve ser submetida com controle de versão semântico e testes de regressão antes da publicação na branch principal.

Este plano mestre constitui a lei arquitetural e de negócios que rege o presente e o futuro do André da Empada no ecossistema digital.
