# Documento de Requisitos — Plataforma de Energia Renovável com TOPSIS

## 1. Contextualização

O acesso à energia renovável é um dos pilares do desenvolvimento sustentável (ODS 7 da ONU). Comunidades em situação de vulnerabilidade social frequentemente enfrentam barreiras no acesso a fontes limpas de energia.

**Objetivo geral:** desenvolver uma plataforma computacional que mensure indicadores multicritério de vulnerabilidade social ligados ao acesso, uso e impacto de fontes de energia renovável, usando o método TOPSIS.

**Objetivos específicos e onde são atendidos:**

| Objetivo | Atendimento |
| --- | --- |
| Identificar e catalogar indicadores de vulnerabilidade energética | Critérios C1–C7 (Cap. 7.1) cadastrados em `criterios`; CRUD na tela **Configuração TOPSIS** |
| Implementar o TOPSIS para ranquear municípios/comunidades | `backend/src/services/topsis/topsis.engine.js` |
| Visualização georreferenciada | Tela **Mapa** (Leaflet, pontos por faixa e mapa de calor) a partir de latitude/longitude |
| Análise comparativa entre unidades | Tela **Resultado** (ranking, barras, radar com até 5 municípios) |
| Relatórios para políticas públicas | Exportação PDF/CSV de cada simulação |

## 2. Stakeholders

| Stakeholder | Papel | Interesse | Perfil no sistema |
| --- | --- | --- | --- |
| Gestor Público | Usuário primário | Identificar comunidades vulneráveis para políticas públicas | `gestor` — consulta, executa TOPSIS e exporta relatórios |
| Pesquisador | Usuário especialista | Analisar correlações entre indicadores | `pesquisador` — além do gestor, cadastra municípios, critérios, pesos e importa dados |
| Administrador | Operação | Manter usuários e dados | `admin` — acesso total, inclusive usuários e exclusão de simulações |
| Comunidade | Beneficiária | Acesso a energia limpa e acessível | — |
| Equipe de Desenvolvimento | Produtora | Entregar software funcional e documentado | — |
| Professor orientador | Validador / Product Owner | Rigor metodológico e acadêmico | — |

## 3. Requisitos funcionais

| ID | Descrição | Prioridade | Situação | Implementação |
| --- | --- | --- | --- | --- |
| RF01 | Cadastrar municípios/comunidades com dados socioeconômicos | Alta | ✅ | `POST/PUT/DELETE /api/municipios`; tela **Municípios** (formulário validado) |
| RF02 | Cadastrar indicadores e critérios de vulnerabilidade | Alta | ✅ | `POST/PUT/DELETE /api/criterios`; tela **Configuração TOPSIS** |
| RF03 | Configurar pesos dos critérios TOPSIS | Alta | ✅ | `PUT /api/criterios/pesos` (soma = 1,0); sliders com normalização |
| RF04 | Executar cálculo TOPSIS e gerar ranking | Alta | ✅ | `POST /api/topsis/executar`; tela **Executar TOPSIS** |
| RF05 | Visualizar resultados em dashboard com gráficos | Média | ✅ | **Dashboard** (KPIs, barras, rosca por faixa, mapa) e **Resultado** (barras, radar) |
| RF06 | Exportar relatórios em PDF/CSV | Média | ✅ | `GET /api/relatorios/:id/pdf` e `/csv` |
| RF07 | Visualização georreferenciada (mapa) | Média | ✅ | Tela **Mapa** (Leaflet + leaflet.heat) com latitude/longitude dos municípios |
| RF08 | Gerenciar usuários e perfis de acesso | Alta | ✅ | `/api/usuarios` (admin); perfis admin/pesquisador/gestor; tela **Usuários** |
| RF09 | Importar dados de fontes externas (IBGE, ANEEL) | Baixa | ✅ (simplificado) | Importação em lote por planilha CSV com os dados extraídos dessas fontes (`/api/importacao`); sem integração direta com as APIs |
| RF10 | Histórico de simulações TOPSIS | Baixa | ✅ | Tabelas `simulacoes`/`resultados_ranking`; `GET /api/simulacoes`; tela **Histórico** |

## 4. Requisitos não funcionais

| ID | Descrição | Categoria ISO 25010 | Situação | Evidência |
| --- | --- | --- | --- | --- |
| RNF01 | Cálculo TOPSIS < 3 s para 500 alternativas | Eficiência de desempenho | ✅ | Algoritmo vetorizado em `topsis.engine.js` (uma passada por matriz) |
| RNF02 | Interface responsiva (desktop, tablet, mobile) | Usabilidade | ✅ | Tailwind com breakpoints; menu lateral vira gaveta em telas < 1024 px; tabelas com rolagem própria e cards no mobile |
| RNF03 | Disponibilidade ≥ 99,5% | Confiabilidade | ⚙️ Infra | healthcheck do banco, `GET /api/health` e `depends_on` no Compose. A meta depende do ambiente de hospedagem |
| RNF04 | Autenticação JWT com bcrypt | Segurança | ✅ | `middlewares/auth.js`, `services/auth.service.js`; todas as rotas exceto login/health exigem token |
| RNF05 | Cobertura de testes ≥ 80% | Manutenibilidade | ✅ | `npm run test:coverage` no backend com limite de 80% (≈ 94% de linhas) |
| RNF06 | Documentação via Swagger/OpenAPI | Portabilidade | ✅ | `/api/docs` (Swagger UI) e `/api/docs.json` |

## 5. Regras de negócio

| ID | Regra |
| --- | --- |
| RN01 | Critério é do tipo **benefício** (maior valor = menos vulnerável) ou **custo** (maior valor = mais vulnerável). |
| RN02 | Os pesos salvos devem somar 1,0 (tolerância 0,001). Numa execução avulsa, pesos que não somam 1 são normalizados; o ranking não muda. |
| RN03 | Critérios com peso 0 não participam do cálculo. |
| RN04 | Municípios sem valor em algum critério participante ficam fora do cálculo. |
| RN05 | São necessárias ao menos 2 alternativas válidas para executar o TOPSIS. |
| RN06 | Maior Ci = menos vulnerável. Faixas: **Alta** (Ci < 0,33), **Média** (0,33 ≤ Ci < 0,66), **Baixa** (Ci ≥ 0,66). |
| RN07 | Cada execução grava os parâmetros e um retrato da matriz usada, para que relatórios antigos continuem reproduzíveis. |
| RN08 | Um administrador não pode excluir o próprio usuário nem remover o próprio perfil de admin. |
