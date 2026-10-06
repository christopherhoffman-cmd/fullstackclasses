# ⚡ Plataforma de Energia Renovável com TOPSIS

## 📌 Visão Geral

A **Plataforma de Energia Renovável com TOPSIS** é uma solução computacional desenvolvida para **mensurar, analisar e ranquear a vulnerabilidade social energética** de municípios e comunidades por meio de uma abordagem de **Análise Multicritério de Decisão (MCDA)**.

O projeto utiliza o método **TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)** para integrar diferentes indicadores socioeconômicos, demográficos e de infraestrutura energética, produzindo um índice de vulnerabilidade que permite comparar diferentes localidades de forma sistemática e baseada em dados.

A plataforma está alinhada aos **Objetivos de Desenvolvimento Sustentável (ODS) da Organização das Nações Unidas**, com ênfase no **ODS 7 — Energia Limpa e Acessível**, buscando contribuir para a identificação de regiões que apresentam maior vulnerabilidade no acesso à energia e auxiliar na tomada de decisões relacionadas a políticas públicas e investimentos em infraestrutura energética.

---

## 🎯 Objetivos

### Objetivo Geral

Desenvolver uma plataforma computacional capaz de **avaliar, classificar e visualizar a vulnerabilidade social energética** de diferentes municípios e comunidades utilizando o método multicritério TOPSIS.

### Objetivos Específicos

* Identificar e organizar **indicadores socioeconômicos, demográficos e de infraestrutura energética** relevantes para a análise;
* Implementar computacionalmente o método **TOPSIS**;
* Calcular o índice de proximidade relativa à solução ideal (**Ci**) para cada localidade analisada;
* Classificar as localidades de acordo com seu nível de vulnerabilidade;
* Disponibilizar **dashboards interativos** para exploração dos resultados;
* Desenvolver **mapas georreferenciados** para representação espacial dos indicadores e rankings;
* Permitir a análise comparativa entre diferentes municípios e comunidades;
* Fornecer informações que possam **subsidiar estudos e políticas públicas** voltadas à transição energética e à redução da vulnerabilidade social.

---

## 🧮 Metodologia

A análise utiliza o método **TOPSIS**, uma técnica de decisão multicritério baseada na distância de cada alternativa em relação a uma **solução ideal positiva** e a uma **solução ideal negativa**.

De forma simplificada, o processamento segue as seguintes etapas:

```text
Dados dos indicadores
        ↓
Construção da matriz de decisão
        ↓
Normalização dos dados
        ↓
Aplicação dos pesos dos critérios
        ↓
Definição das soluções ideal e anti-ideal
        ↓
Cálculo das distâncias
        ↓
Cálculo da proximidade relativa (Ci)
        ↓
Ranking de vulnerabilidade
        ↓
Visualização em dashboards e mapas
```

O índice de proximidade relativa é utilizado para determinar a posição de cada localidade no ranking, permitindo realizar comparações entre os diferentes municípios ou comunidades analisados.

---

## 🖥️ Funcionalidades

A plataforma está sendo estruturada para disponibilizar funcionalidades como:

* 📊 **Dashboard de indicadores**
* 🗺️ **Mapas interativos e georreferenciados**
* 🏆 **Ranking de vulnerabilidade energética**
* 📈 **Visualização e comparação de indicadores**
* 🧮 **Processamento automatizado do método TOPSIS**
* 🔎 **Filtros por município, região e indicadores**
* 📍 **Consulta de informações geográficas**
* 📋 **Visualização detalhada dos resultados**
* 💾 **Persistência e gerenciamento dos dados**

---

## 🏗️ Arquitetura da Solução

A aplicação segue uma arquitetura baseada na separação entre **frontend, backend e banco de dados**, permitindo maior organização, escalabilidade e manutenção do sistema.

```text
┌─────────────────────────────────────┐
│              FRONTEND               │
│                                     │
│ React + Vite + Tailwind CSS         │
│ Leaflet + Chart.js                  │
└──────────────────┬──────────────────┘
                   │
                   │ HTTP / REST API
                   ▼
┌─────────────────────────────────────┐
│              BACKEND                │
│                                     │
│ Node.js / Python                    │
│ API REST                            │
│ Engine de processamento TOPSIS      │
└──────────────────┬──────────────────┘
                   │
                   │ SQL
                   ▼
┌─────────────────────────────────────┐
│             DATABASE                │
│                                     │
│ PostgreSQL + PostGIS                │
│ Dados socioeconômicos               │
│ Dados energéticos                   │
│ Dados geográficos                   │
└─────────────────────────────────────┘
```

A utilização do **PostGIS** permite armazenar e consultar informações espaciais, possibilitando a integração entre os resultados da análise multicritério e sua representação geográfica.

---

## 🛠️ Tecnologias

### Frontend

* **React** — Construção da interface da aplicação
* **Vite** — Ferramenta de desenvolvimento e build
* **Tailwind CSS** — Estilização e construção da interface
* **Leaflet** — Visualização de mapas interativos
* **Chart.js** — Visualização gráfica dos indicadores

### Backend

* **Node.js** e/ou **Python**
* API REST
* Engine de processamento do algoritmo TOPSIS

### Banco de Dados

* **PostgreSQL**
* **PostGIS** — Extensão para armazenamento e processamento de dados geoespaciais

### DevOps e Infraestrutura

* **Docker**
* **Docker Compose**
* Controle de versão com **Git**

---

## 📂 Estrutura do Repositório

```text
.
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── topsis/
│   └── ...
│
├── docs/
│   ├── uml/
│   ├── requisitos/
│   └── ...
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

### Descrição dos principais diretórios

| Diretório/Arquivo    | Descrição                                 |
| -------------------- | ----------------------------------------- |
| `frontend/`          | Interface web, dashboards e visualizações |
| `backend/`           | API REST e processamento dos dados        |
| `backend/topsis/`    | Implementação do algoritmo TOPSIS         |
| `docs/`              | Documentação, requisitos e diagramas UML  |
| `docker-compose.yml` | Orquestração dos serviços da aplicação    |
| `README.md`          | Documentação principal do projeto         |
| `.gitignore`         | Arquivos e diretórios ignorados pelo Git  |

---

## 🌎 ODS 7 — Energia Limpa e Acessível

O projeto está relacionado principalmente ao:

> **ODS 7 — Assegurar o acesso confiável, sustentável, moderno e a preço acessível à energia para todas e todos.**

A plataforma busca fornecer uma ferramenta capaz de apoiar a **identificação de desigualdades relacionadas ao acesso à energia**, permitindo visualizar espacialmente regiões mais vulneráveis e analisar os fatores que contribuem para essa vulnerabilidade.

---

## 📊 Resultados Esperados

Ao final do desenvolvimento, espera-se disponibilizar uma plataforma capaz de:

1. Integrar diferentes fontes de dados;
2. Processar indicadores socioeconômicos e energéticos;
3. Aplicar automaticamente o método TOPSIS;
4. Gerar um índice de vulnerabilidade para cada localidade;
5. Produzir um ranking comparativo;
6. Representar os resultados espacialmente por meio de mapas;
7. Disponibilizar dashboards interativos;
8. Facilitar a interpretação dos dados para pesquisadores e gestores públicos.

---

## 🚀 Execução do Projeto

### Pré-requisitos

Antes de executar o projeto, certifique-se de possuir:

* [Node.js](https://nodejs.org/)
* [Git](https://git-scm.com/)
* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)

### Clonando o repositório

```bash
git clone https://github.com/christopherhoffman-cmd/fullstackclasses.git
cd fullstackclasses
```

### Executando com Docker

```bash
docker compose up --build
```

A aplicação poderá então ser acessada pelos serviços configurados no `docker-compose.yml`.

---

## 🔬 Desenvolvimento Acadêmico

Este projeto está sendo desenvolvido no contexto acadêmico de **Engenharia de Computação**, integrando conceitos de:

* Desenvolvimento de software;
* Engenharia de requisitos;
* Desenvolvimento web;
* Banco de dados;
* Sistemas de informação geográfica;
* Análise multicritério de decisão;
* Algoritmos e estruturas de dados;
* Visualização de dados;
* Computação aplicada a problemas socioambientais.

---

## 👥 Equipe

**Projeto:** Plataforma de Energia Renovável com TOPSIS

**Área:** Engenharia de Computação

**Tema:** Vulnerabilidade Social Energética e Análise Multicritério

---

## 📄 Licença

Este projeto está em desenvolvimento para fins **acadêmicos e de pesquisa**.

A definição da licença de distribuição e utilização do software será realizada posteriormente.
