# Modelagem UML

> Capítulo 4 do roteiro. Os diagramas usam [Mermaid](https://mermaid.js.org/) e aparecem renderizados no GitHub e no VS Code.

### Especificação textual

**UC01 — Cadastrar município**
- **Ator:** Administrador (ou Pesquisador)
- **Pré-condição:** usuário autenticado
- **Fluxo principal:**
  1. O ator seleciona **Novo município**.
  2. O sistema exibe o formulário.
  3. O ator preenche os dados (nome, UF, código IBGE, população, IDH, coordenadas) e os indicadores C1…Cn.
  4. O sistema valida os dados no frontend e no backend e grava tudo numa transação.
  5. O sistema confirma o cadastro.
- **Fluxos alternativos:** dados inválidos → o sistema mostra o erro em cada campo (422); código IBGE duplicado → aviso de registro duplicado (409).

**UC02 — Configurar critérios TOPSIS**
- **Ator:** Pesquisador
- **Fluxo:** definir critérios (CRUD), tipo (benefício/custo) e pesos com sliders. O sistema exige soma = 1,0 e oferece **Normalizar** e **Pesos iguais**.

**UC03 — Executar TOPSIS**
- **Atores:** Pesquisador, Gestor
- **Fluxo:** selecionar o conjunto de dados (municípios) → ajustar critérios e pesos da execução → **Executar** → ver o ranking.
- **Alternativo:** menos de 2 municípios com dados completos → o sistema bloqueia e explica o motivo.

**UC04 — Gerar relatório**
- **Ator:** Gestor Público
- **Fluxo:** selecionar a simulação (Resultado ou Histórico) → exportar PDF ou CSV.

## 4.2 Diagrama de classes

```mermaid
classDiagram
    direction LR
    class Usuario {
        +int id
        +string nome
        +string email
        +string senha_hash
        +string perfil «admin, pesquisador, gestor»
    }
    class Municipio {
        +int id
        +string nome
        +string uf
        +int codigo_ibge
        +int populacao
        +float idh
        +float latitude
        +float longitude
    }
    class Criterio {
        +int id
        +string codigo
        +string nome
        +string tipo «beneficio, custo»
        +float peso
        +string unidade
        +string fonte
    }
    class MatrizDecisao {
        +int municipio_id
        +int criterio_id
        +float valor
    }
    class SimulacaoTOPSIS {
        +int id
        +datetime data_execucao
        +int usuario_id
        +json parametros
        +string descricao
    }
    class ResultadoRanking {
        +int simulacao_id
        +int municipio_id
        +float coeficiente_ci
        +float distancia_positiva
        +float distancia_negativa
        +int posicao
    }
    class TopsisEngine {
        <<service>>
        +normalizar(matriz)
        +calcularDetalhado(matriz, pesos, tipos)
        +topsis(matriz, pesos, tipos)
    }

    Municipio "1" --> "0..*" MatrizDecisao
    Criterio "1" --> "0..*" MatrizDecisao
    Usuario "1" --> "0..*" SimulacaoTOPSIS : executa
    SimulacaoTOPSIS "1" --> "1..*" ResultadoRanking
    Municipio "1" --> "0..*" ResultadoRanking
    TopsisEngine ..> MatrizDecisao : usa
    TopsisEngine ..> SimulacaoTOPSIS : produz
```

## 4.3 Diagrama de sequência — Executar TOPSIS

```mermaid
sequenceDiagram
    actor P as Pesquisador
    participant F as Frontend (React)
    participant A as API (Express)
    participant S as TopsisService
    participant E as TopsisEngine
    participant DB as PostgreSQL

    P->>F: Clica "Executar cálculo TOPSIS"
    F->>A: POST /api/topsis/executar {municipios, criterios, pesos} + JWT
    A->>A: autenticar (JWT)
    A->>S: executarAnalise(entrada, usuario)
    S->>DB: critérios, municípios e matriz de decisão
    DB-->>S: linhas
    S->>S: seleciona critérios (peso > 0) e alternativas completas
    S->>E: calcularDetalhado(matriz, pesos, tipos)
    E->>E: normalizar()
    E->>E: calcularPonderada()
    E->>E: idealPositiva() / idealNegativa()
    E->>E: distancias()
    E->>E: coeficienteProximidade()
    E-->>S: ranking[], A+, A-
    S->>DB: salvarSimulacao(parametros, resultados) [transação]
    DB-->>S: id da simulação
    S-->>A: simulação formatada
    A-->>F: 200 OK {ranking, metadata}
    F-->>P: Navega para /simulacoes/:id (tabela, gráficos, mapa)
```

## 4.4 Diagrama de atividades — fluxo TOPSIS

```mermaid
flowchart TD
    I([Início]) --> A[Selecionar alternativas - municípios]
    A --> B[Selecionar critérios e pesos]
    B --> C{Alternativa tem todos os valores?}
    C -- não --> C2[Ignorar município] --> D
    C -- sim --> D[Montar matriz de decisão]
    D --> E{≥ 2 alternativas?}
    E -- não --> X([Erro 422])
    E -- sim --> F[Normalizar matriz - norma vetorial]
    F --> G[Aplicar pesos - matriz ponderada]
    G --> H[Solução ideal positiva A+]
    H --> J[Solução ideal negativa A-]
    J --> K[Distância euclidiana a A+]
    K --> L[Distância euclidiana a A-]
    L --> M["Ci = D- / (D+ + D-)"]
    M --> N[Ordenar por Ci decrescente]
    N --> O[Persistir simulação]
    O --> P[Exibir resultados]
    P --> Z([Fim])
```

## 4.5 Diagrama de componentes

```mermaid
flowchart TB
    subgraph FE["«subsystem» Frontend (SPA React + Vite)"]
        Dash[Dashboard]
        Mapas[Mapas - Leaflet]
        Forms[Formulários]
        Graf[Gráficos - Chart.js]
        Svc[services/api.js]
        Dash & Mapas & Forms & Graf --> Svc
    end
    subgraph BE["«subsystem» Backend (API Node.js + Express)"]
        Auth[AuthModule - JWT/bcrypt]
        Eng[TOPSISEngine]
        Imp[DataImport - CSV]
        Rel[Relatórios - PDF/CSV]
        Ctrl[Controllers → Services → Models]
        Docs[Swagger UI]
    end
    DB[(PostgreSQL)]

    Svc -- REST/JSON --> Ctrl
    Ctrl --> Auth & Eng & Imp & Rel
    Ctrl -- SQL --> DB
```

## 4.6 Diagrama de implantação

```mermaid
flowchart LR
    C["Cliente (Browser)"] -- "HTTP :8080" --> N
    subgraph Docker["Docker Compose"]
        N["topsis-frontend<br/>Nginx: SPA + proxy /api"] -- "HTTP :3001" --> B["topsis-backend<br/>Node.js 22 + Express"]
        B -- "TCP :5432" --> D[("topsis-db<br/>PostgreSQL 16<br/>volume pgdata")]
    end
    C -- HTTPS --> T[(tile.openstreetmap.org)]
```

## Modelo do banco (ER)

```mermaid
erDiagram
    usuarios ||--o{ simulacoes : executa
    municipios ||--o{ matriz_decisao : possui
    criterios ||--o{ matriz_decisao : mede
    simulacoes ||--|{ resultados_ranking : gera
    municipios ||--o{ resultados_ranking : ranqueado

    usuarios {
        int id PK
        varchar email UK
        varchar senha_hash
        varchar perfil
    }
    municipios {
        int id PK
        varchar nome
        char uf
        int codigo_ibge UK
        int populacao
        decimal idh
        decimal latitude
        decimal longitude
    }
    criterios {
        int id PK
        varchar codigo
        varchar nome
        varchar tipo
        decimal peso
        varchar unidade
        varchar fonte
    }
    matriz_decisao {
        int id PK
        int municipio_id FK
        int criterio_id FK
        decimal valor
    }
    simulacoes {
        int id PK
        int usuario_id FK
        timestamp data_execucao
        jsonb parametros
        varchar descricao
    }
    resultados_ranking {
        int id PK
        int simulacao_id FK
        int municipio_id FK
        decimal coeficiente_ci
        decimal distancia_positiva
        decimal distancia_negativa
        int posicao
    }
```
