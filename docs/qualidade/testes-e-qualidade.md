# Estratégia de testes e qualidade (Capítulos 10, 11 e 12)

## 1. Estratégia de testes

| Nível | Ferramenta | Escopo | Onde |
| --- | --- | --- | --- |
| Unitário | Jest | Funções do TOPSIS, utilitários e models (banco simulado) | `backend/tests/unit` |
| Integração | Jest + Supertest | API completa (rotas, auth, validação, serviços) com persistência simulada | `backend/tests/integration` |
| Aceitação | Manual + checklist | Critérios do cliente | Seção 3 |

### Como executar

```bash
cd backend
npm test                 # unitários + integração (não precisa de banco)
npm run test:coverage    # mesmos testes + relatório de cobertura (falha abaixo de 80%)
```

### Casos de destaque

- `normalização vetorial preserva proporções`: `normalizar([3, 4])` → `[0.6, 0.8]` (exemplo do roteiro).
- `Ci deve estar entre 0 e 1` (exemplo do roteiro).
- **Exemplo numérico 7.3:** ranking **B > A > C**, com Ci(A) = 0,336058, D+(A) = 0,151403 e D-(A) = 0,076633, iguais ao cálculo manual.
- Propriedades: escalar os pesos não altera o ranking; alternativas empatadas mantêm ordem estável; colunas zeradas não dividem por zero.
- Validação de entrada (matriz vazia, pesos incompatíveis, soma zero).
- Permissões por perfil (401/403), regras de negócio (422) e duplicidade (409).

### Resultado atual

```
Test Suites: 4 passed, 4 total
Tests:       66 passed, 66 total
Statements: 88% | Branches: 84% | Functions: 81% | Lines: 87%
```

## 2. Qualidade ISO/IEC 25010

| Característica | Subcaracterística | Métrica | Meta | Como é atendida |
| --- | --- | --- | --- | --- |
| Adequação funcional | Completude | % de requisitos implementados | ≥ 90% | 10/10 RF implementados ([requisitos](../requisitos/documento-de-requisitos.md)) |
| Eficiência de desempenho | Tempo de resposta | Tempo do cálculo TOPSIS | < 3 s | Cálculo em memória; inserção do ranking em um único `INSERT` |
| Usabilidade | Aprendizado | Tempo para a primeira tarefa | < 5 min | Fluxo guiado em 3 passos, execução rápida no dashboard, validação campo a campo, mensagens em português, manual do usuário |
| Confiabilidade | Disponibilidade | Uptime mensal | ≥ 99,5% | Healthcheck, transações no banco, `depends_on` com `service_healthy` no Compose |
| Segurança | Confidencialidade | Dados protegidos por autenticação | 100% | JWT em todas as rotas de dados, bcrypt, perfis de acesso, consultas parametrizadas (sem SQL injection) |
| Manutenibilidade | Modularidade | Acoplamento entre módulos | Baixo | Camadas routes → controllers → services → models; engine TOPSIS pura e testável; frontend em `pages/components/services/hooks/utils` |
| Portabilidade | Adaptabilidade | Navegadores suportados | Chrome, Firefox, Safari | Build Vite com alvo de navegadores modernos; somente APIs web padrão; Docker para o servidor |

## 3. Checklist de aceitação (manual)

| # | Critério | Resultado |
| --- | --- | --- |
| 1 | Login com usuário válido abre o dashboard; senha errada mostra erro | ☐ |
| 2 | Cadastrar município com indicadores e coordenadas e vê-lo no mapa | ☐ |
| 3 | Salvar pesos só é permitido com soma = 1,0 | ☐ |
| 4 | Executar TOPSIS com Municípios A, B e C e pesos 0,20/0,20/0,15/0,25/0,20 gera **B > A > C** | ☐ |
| 5 | Ranking confere com o cálculo manual em planilha (Ci de A ≈ 0,3361) | ☐ |
| 6 | Exportar PDF e CSV de uma simulação | ☐ |
| 7 | Mapa mostra os municípios coloridos por faixa e a camada de calor por indicador | ☐ |
| 8 | Usuário *gestor* não vê botões de edição e recebe 403 ao tentar editar pela API | ☐ |
| 9 | Interface utilizável em celular (menu em gaveta, sem rolagem horizontal da página) | ☐ |
| 10 | `docker compose up --build` sobe toda a aplicação | ☐ |

## 4. Gerenciamento ágil — situação das sprints

| Sprint | Entrega | Situação |
| --- | --- | --- |
| 1 | Contextualização, requisitos, stakeholders, repositório | ✅ |
| 2 | UML completa, modelagem do banco | ✅ |
| 3 | Backend: CRUD de municípios e critérios, migrations | ✅ |
| 4 | Backend: engine TOPSIS, testes unitários | ✅ |
| 5 | Frontend: dashboard, formulários, integração com a API | ✅ |
| 6 | Mapa georreferenciado, exportação de relatórios | ✅ |
| 7 | Testes de integração, correções | ✅ (backend) |
| 8 | Documentação final, deploy (Docker + CI), apresentação | ✅ docs/deploy · ☐ apresentação (slides + demo ao vivo, a cargo da equipe) |
