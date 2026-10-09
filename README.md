# ⚡ Plataforma de Energia Renovável com TOPSIS

Plataforma web para **mensurar, ranquear e visualizar a vulnerabilidade social energética** de municípios e comunidades usando o método multicritério **TOPSIS** (*Technique for Order Preference by Similarity to Ideal Solution*), alinhada ao **ODS 7 — Energia Limpa e Acessível**.

Projeto acadêmico de Engenharia de Computação, desenvolvido a partir do *Roteiro de Desenvolvimento — Plataforma de Energia Renovável com TOPSIS* (Prof. Me. Celso Barreto), com base nas normas ISO/IEC 12207, 15504 e 25010.

---

## 🖥️ Funcionalidades

| | Funcionalidade | Requisito |
| --- | --- | --- |
| 🏙️ | Cadastro de municípios com dados socioeconômicos e indicadores | RF01 |
| 📐 | Cadastro de critérios/indicadores (benefício ou custo) | RF02 |
| 🎚️ | Configuração de pesos com sliders, soma = 1,0, normalização automática | RF03 |
| 🧮 | Execução do TOPSIS com seleção de municípios e pesos por simulação | RF04 |
| 📊 | Dashboard com KPIs, ranking em barras, distribuição por faixa e radar comparativo | RF05 |
| 📄 | Exportação de relatórios em **PDF** e **CSV** | RF06 |
| 🗺️ | Mapa georreferenciado (Leaflet): pontos por faixa de vulnerabilidade e **mapa de calor por indicador** | RF07 |
| 👥 | Usuários e perfis de acesso (Administrador, Pesquisador, Gestor Público) com JWT + bcrypt | RF08 |
| 📥 | Importação em lote via CSV (dados extraídos de IBGE, ANEEL, INPE) | RF09 |
| 🕘 | Histórico de simulações com parâmetros e resultados preservados | RF10 |
| 📚 | API documentada em **Swagger/OpenAPI** | RNF06 |

---

## 🧮 Método TOPSIS

```text
Matriz de decisão (municípios × critérios)
  → Normalização vetorial          r_ij = x_ij / √Σ x_ij²
  → Matriz ponderada               v_ij = w_j · r_ij
  → Soluções ideais                A+ (melhor) e A- (pior) por critério, conforme benefício/custo
  → Distâncias euclidianas         D+ e D-
  → Coeficiente de proximidade     Ci = D- / (D+ + D-)
  → Ranking                        maior Ci = MENOS vulnerável
```

Faixas: 🔴 **Alta** (Ci < 0,33) · 🟠 **Média** (0,33 ≤ Ci < 0,66) · 🟢 **Baixa** (Ci ≥ 0,66).

A implementação fica em [`backend/src/services/topsis/topsis.engine.js`](backend/src/services/topsis/topsis.engine.js) e é validada pelo exemplo numérico 7.3 do roteiro (**B > A > C**).

---

## 🏗️ Arquitetura

```text
┌──────────────────────────────────────────────┐
│ Frontend (SPA) — React 19 + Vite + Tailwind  │
│ React Router · Chart.js · Leaflet/leaflet.heat│
└──────────────────────┬───────────────────────┘
                       │ REST/JSON (JWT)  — Nginx faz proxy de /api
┌──────────────────────▼───────────────────────┐
│ Backend (API) — Node.js + Express 5          │
│ routes → controllers → services → models     │
│ AuthModule · TOPSISEngine · DataImport · PDF │
└──────────────────────┬───────────────────────┘
                       │ SQL (pg)
┌──────────────────────▼───────────────────────┐
│ PostgreSQL 16 (migrations)                   │
└──────────────────────────────────────────────┘
```

Diagramas completos (casos de uso, classes, sequência, atividades, componentes, implantação e ER) em [`docs/uml`](docs/uml/diagramas-uml.md).

> **Simplificações em relação ao roteiro (escopo da disciplina):** o banco é PostgreSQL sem a extensão PostGIS (o mapa usa latitude/longitude) e a importação de dados externos (RF09) é feita por planilha CSV, sem integração direta com as APIs do IBGE/ANEEL.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, lucide-react |
| Gráficos / Mapas | Chart.js (react-chartjs-2), Leaflet (react-leaflet) + leaflet.heat, tiles OpenStreetMap |
| Backend | Node.js 22+, Express 5, pg, jsonwebtoken, bcryptjs, pdfkit, swagger-ui-express |
| Banco | PostgreSQL 16, migrations SQL versionadas |
| Testes | Jest + Supertest (unitários e integração da API) |
| DevOps | Docker, Docker Compose, Nginx, GitHub Actions |

---

## 🚀 Como executar

### Opção 1 — Docker (um único comando)

Pré-requisito: [Docker](https://www.docker.com/) com Docker Compose.

```bash
git clone https://github.com/christopherhoffman-cmd/fullstackclasses.git
cd fullstackclasses
docker compose up --build
```

| Serviço | Endereço |
| --- | --- |
| Aplicação web | http://localhost:8080 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| PostgreSQL | localhost:5432 (postgres/postgres, banco `energia_topsis`) |

Na primeira subida, o backend aplica as migrations, carrega os dados de exemplo e cria o usuário administrador.

**Login de desenvolvimento:** `admin@topsis.local` / `admin123`. Troque com as variáveis `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `JWT_SECRET` antes de qualquer implantação real.

Para mudar portas ou credenciais, crie um `.env` na raiz (lido pelo Compose): `WEB_PORT_HOST`, `API_PORT_HOST`, `DB_PORT_HOST`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### Opção 2 — Desenvolvimento local

Pré-requisitos: Node.js 20+ e um PostgreSQL (o do Compose serve: `docker compose up -d db`).

```bash
# Backend
cd backend
cp .env.example .env      # ajuste se necessário
npm install
npm run dev               # aplica migrations e sobe em http://localhost:3001
```

```bash
# Frontend (outro terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxy de /api → localhost:3001)
```

### Scripts úteis

| Onde | Comando | O que faz |
| --- | --- | --- |
| backend | `npm test` | Testes unitários + integração (não precisa de banco) |
| backend | `npm run test:coverage` | Todos os testes + cobertura (mínimo 80%) |
| frontend | `npm run lint` / `npm run build` | Lint (ESLint) / build de produção |

---

## 📚 Documentação

| Documento | Conteúdo |
| --- | --- |
| [Documento de requisitos](docs/requisitos/documento-de-requisitos.md) | Contexto, stakeholders, RF01–RF10, RNF01–RNF06, regras de negócio |
| [Diagramas UML](docs/uml/diagramas-uml.md) | Casos de uso, classes, sequência, atividades, componentes, implantação, ER |
| [API](docs/api/README.md) | Aponta para o Swagger em `/api/docs` |
| [Manual do usuário](docs/manual-usuario/manual-do-usuario.md) | Passo a passo de cada tela |
| [Testes e qualidade](docs/qualidade/testes-e-qualidade.md) | Estratégia de testes, cobertura, ISO 25010, checklist de aceitação |

---

## 🌎 ODS 7

> Assegurar o acesso confiável, sustentável, moderno e a preço acessível à energia para todas e todos.

## 📄 Licença

Projeto desenvolvido para fins **acadêmicos e de pesquisa**. A licença de distribuição será definida posteriormente.
