# RastroSim - Rastreamento Logístico Simulado

Uma plataforma corporativa e profissional de **simulação e rastreamento de encomendas**, desenvolvida com **React (Vite)** no frontend e **Express** no backend. O sistema simula de forma totalmente autônoma o deslocamento de cargas e triagem de pacotes entre CEPs de origem e destino no Brasil, sem depender de integrações com APIs reais dos Correios ou de transportadoras.

---

## 🚀 Objetivo & Transparência

O sistema foi concebido como um ambiente seguro, performático e didático para **demonstração comercial, treinamento de equipes de suporte ao cliente e aprendizado logístico**. 
- **Sem APIs reais**: Todas as rotas, CEPs, cidades intermediárias e tempos de trânsito são gerados por um motor de simulação interno de alta fidelidade.
- **Transparência**: De acordo com as diretrizes e boas práticas, o rodapé público e os termos de uso exibem de forma discreta que a plataforma se trata de um simulador de fluxo logístico.

---

## ✨ Principais Funcionalidades

### 🌐 Área Pública de Consulta (Sem Login)
- **Painel de Busca**: Pesquisa instantânea por código localizador de 13 dígitos.
- **Status Geral**: Visualização detalhada contendo peso, cidade atual, destino, CEPs e data/hora de postagem.
- **Barra de Progresso Dinâmica**: Percentual do percurso percorrido (10% a 100%).
- **Mapa Esquemático de Rota**: Diagrama visual interativo que conecta os pontos geográficos (Origem $\rightarrow$ Hubs de Triagem $\rightarrow$ CDD Regional $\rightarrow$ Destino Final).
- **Linha do Tempo Completa**: Histórico cronológico detalhado de atualizações, ordenado do evento mais recente para o mais antigo.
- **Comprovante de Postagem**: Impressão de etiqueta de rastreio otimizada em CSS para papel térmico ou A4.
- **Deep-Links**: Geração automática de links compartilháveis no formato `?track=CÓDIGO` para visualização direta.

### 🛡️ Painel Administrativo de Controle (Acesso Restrito)
- **Login Seguro**: Sistema de sessões criptografadas em Node.js com credenciais pré-configuradas.
- **Dashboard Operacional**: KPIs com totais de encomendas, cargas em trânsito, entregas concluídas, rastreios suspensos e logs gerados nas últimas 24h.
- **Controle de Automação**: Ativação ou pausa da progressão automática individualmente para cada encomenda.
- **Simulador Manual**: Avanço ou retrocesso instantâneo de etapas com um clique.
- **Editor de Encomendas**:
  - Código personalizado ou geração automática padrão dos Correios (ex: `RS123456789BR`).
  - Campo destinatário, peso, observações internas e data/hora retroativa.
  - **Autocomplete de CEP**: Ao digitar um CEP brasileiro válido (8 dígitos), o sistema autocompleta instantaneamente a cidade e estado correspondentes baseados em regras postais geográficas.
- **Lançador de Ocorrências**: Adição de eventos customizados em qualquer data/hora com status personalizado (ex: "Em análise", "Em conferência", etc.).
- **Duplicador**: Duplicação ágil de pacotes para testes rápidos de fluxo.
- **Configurações Gerais**: Edição do nome da plataforma, cor de destaque da marca, intervalo de tempo simulado e termos institucionais.
- **Logs de Auditoria**: Visualização e limpeza de logs internos de auditoria de todas as ações de automação e administrativas.

---

## ⚙️ Arquitetura de Simulação Avançada

### 🕒 Motor de Catch-Up Temporal (Automação Inteligente)
Em vez de depender de servidores rodando cronjobs pesados em background (que poderiam falhar caso a infraestrutura de hospedagem entrasse em modo de suspensão por inatividade), o RastroSim implementa um **Motor de Catch-Up sob Demanda**.
- Quando um rastreamento é consultado (seja pelo cliente ou pelo administrador), o servidor compara a hora atual com a data de postagem original.
- Com base no intervalo de dias configurado (padrão de **2 dias** por etapa), o servidor calcula exatamente quais marcos temporais já deveriam ter sido atingidos.
- Se novas etapas estiverem atrasadas, o servidor as gera retroativamente de forma sequencial no banco de dados e calcula os novos status geográficos de trânsito em milissegundos.
- **Escala de Progressão**:
  - **Dia 1 (0-2 dias)**: Objeto postado na agência de origem $\rightarrow$ Progresso: **10%**
  - **Dia 3 (2-4 dias)**: Em transferência para a unidade de tratamento $\rightarrow$ Progresso: **30%**
  - **Dia 5 (4-6 dias)**: Recebido no Centro Logístico Nacional $\rightarrow$ Progresso: **50%**
  - **Dia 7 (6-8 dias)**: Recebido na Unidade Regional de Distribuição $\rightarrow$ Progresso: **70%**
  - **Dia 9 (8-10 dias)**: Saiu para entrega ao destinatário $\rightarrow$ Progresso: **90%**
  - **Dia 11 (10+ dias)**: Entregue ao destinatário com sucesso $\rightarrow$ Progresso: **100%** (Neste ponto, a automação é concluída e o status é travado).

### 📍 Gerador de Rotas Geográficas Reais
O sistema possui um algoritmo interno em `server.ts` que analisa os prefixos do CEP digitado e:
1. Identifica a **Região e Estado brasileiro** geográfico correto baseando-se no padrão dos Correios do Brasil (ex: CEPs iniciados em `0` e `1` mapeiam para São Paulo, `2` para Rio de Janeiro, `3` para Minas Gerais, `8` para Paraná/Santa Catarina, etc.).
2. Gera uma rota lógica de 6 etapas passando por **cidades reais e centros de distribuição metropolitanos** coerentes com a rota de trânsito interestadual.

---

## 💻 Instalação & Desenvolvimento Local

### Pré-requisitos
- **Node.js** (v18+)
- **NPM** (v9+)

### Passos para Execução
1. **Instalar Dependências**:
   ```bash
   npm install
   ```
2. **Executar em modo de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   *O servidor Express e a interface Vite iniciarão juntos na porta **3000**.*
   *Abra [http://localhost:3000](http://localhost:3000) no seu navegador.*

3. **Credenciais do Administrador Padrão**:
   - **Usuário**: `admin`
   - **Senha**: `admin123`
   *(Essas credenciais podem ser redefinidas na aba "Perfil" do Painel de Controle)*

---

## 📦 Compilação & Produção (Deploy na Vercel/Cloud Run)

Para compilar o servidor e o cliente em uma única estrutura otimizada:
```bash
npm run build
```
Isso executará duas ações sequenciais:
1. `vite build`: Compila o frontend React Single Page Application (SPA) para a pasta `/dist`.
2. `esbuild server.ts`: Compila o servidor TypeScript Express para o arquivo otimizado `/dist/server.cjs` no formato CommonJS, resolvendo todas as dependências e eliminando caminhos relativos para garantir compatibilidade máxima com contêineres e arquiteturas serverless.

Para iniciar o servidor em ambiente de produção:
```bash
npm start
```

---

## 🎨 Especificação de Design e Identidade
- **Tipografia**: Uso da fonte **Inter** para alta legibilidade de dados estruturados e **JetBrains Mono** para códigos de rastreamento e timestamps de auditoria.
- **Paleta de Cores**: Baseada em **Slate Dark**, cinzas grafite e vermelho corporativo escuro (`#B30000`), estabelecendo um visual confiável de alta precisão.
- **Animações**: Transições suaves e efeitos de pulsar no mapa de rotas logísticas para chamar atenção do usuário aos pontos críticos.
