# Manual do Usuário

Plataforma de Energia Renovável — análise multicritério de vulnerabilidade social energética (TOPSIS).

## 1. Acesso

1. Abra o endereço da plataforma (com Docker: `http://localhost:8080`; em desenvolvimento: `http://localhost:5173`).
2. Informe e-mail e senha e clique em **Entrar**.
   - Na primeira instalação existe um administrador criado automaticamente (credenciais em `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env`; padrão de desenvolvimento no README). **Troque a senha em produção.**
3. A sessão expira em 8 horas. Use **Sair**, no rodapé do menu, para encerrar antes.

### Perfis de acesso

| Perfil | O que pode fazer |
| --- | --- |
| **Gestor Público** | Ver dashboard, municípios, critérios, mapa e histórico; executar o TOPSIS; exportar relatórios |
| **Pesquisador** | Tudo do gestor + cadastrar/editar municípios e critérios, ajustar pesos e importar dados |
| **Administrador** | Tudo + gerenciar usuários e excluir simulações |

Botões de edição ficam ocultos para perfis sem permissão.

## 2. Navegação

O menu lateral (no celular, o ícone ☰ no topo) dá acesso a:

| Tela | Para quê |
| --- | --- |
| **Dashboard** | Visão geral da última simulação |
| **Municípios** | Cadastro das alternativas e dos indicadores |
| **Configuração TOPSIS** | Critérios, tipo e pesos |
| **Executar TOPSIS** | Rodar uma nova simulação |
| **Histórico** | Simulações anteriores e relatórios |
| **Mapa** | Visualização georreferenciada |
| **Importação** | Carga em lote via CSV (admin/pesquisador) |
| **Usuários** | Gestão de contas (admin) |
| **API (Swagger)** | Documentação técnica da API |

## 3. Dashboard

- **Cards KPI:** total de municípios, média do Ci, município mais vulnerável e quantidade de simulações.
- **Ranking (barras):** coeficiente Ci por município, colorido pela faixa de vulnerabilidade.
- **Distribuição por faixa** e **Prioridade de intervenção:** os 5 municípios mais vulneráveis.
- **Mapa:** pontos coloridos por faixa. Clique em um ponto para ver os detalhes.
- **Executar TOPSIS:** roda uma simulação rápida com os pesos salvos.

> **Como ler o Ci:** varia de 0 a 1. Quanto **maior**, mais perto da situação ideal, ou seja, **menos vulnerável**.
> Faixas: 🔴 Alta (Ci < 0,33) · 🟠 Média (0,33–0,66) · 🟢 Baixa (Ci ≥ 0,66).

## 4. Cadastrar município (UC01)

1. Em **Municípios**, clique em **Novo município**.
2. Preencha os dados: nome e UF são obrigatórios; código IBGE (7 dígitos), população, IDH (0 a 1, aceita vírgula decimal), latitude e longitude são opcionais. Sem coordenadas, o município não aparece no mapa.
3. Preencha os **indicadores** (um campo por critério). Municípios com indicadores em branco ficam fora do cálculo enquanto o critério tiver peso.
4. Clique em **Salvar**. Erros aparecem em vermelho abaixo de cada campo.

A coluna **Indicadores** da lista mostra quantos critérios estão preenchidos (ex.: `7/7`). Use os ícones ✏️ e 🗑️ para editar ou excluir. A exclusão também remove o município dos resultados de simulações anteriores.

## 5. Configurar critérios e pesos (UC02)

1. Abra **Configuração TOPSIS**.
2. Para cada critério:
   - **Tipo:** *Benefício* (quanto maior o valor, melhor; ex.: renda) ou *Custo* (quanto maior, pior; ex.: tarifa).
   - **Peso:** ajuste no slider ou digite o valor.
3. A barra **Soma dos pesos** precisa chegar a **1,000** (verde) para salvar:
   - **Normalizar** reescala os pesos mantendo as proporções;
   - **Pesos iguais** distribui o mesmo peso entre todos os critérios;
   - **Desfazer** descarta as alterações não salvas.
4. Clique em **Salvar**.
5. **Novo critério** cadastra um indicador (código, nome, tipo, peso, unidade e fonte). Critérios com peso 0 aparecem esmaecidos e não entram no cálculo.

## 6. Executar o TOPSIS (UC03)

1. Abra **Executar TOPSIS**.
2. **Passo 1 — Municípios:** marque as alternativas (use **Todos**/**Nenhum** e o filtro). Itens marcados como *incompleto* não têm todos os indicadores.
3. **Passo 2 — Critérios e pesos:** os pesos salvos vêm preenchidos. Você pode desmarcar critérios ou mudar pesos **só para esta simulação**, sem alterar a configuração salva.
4. **Passo 3:** informe uma descrição (ex.: "Cenário ênfase em tarifa") e clique em **Executar cálculo TOPSIS**.
5. A tela de resultado abre automaticamente.

## 7. Resultado da simulação

- **KPIs:** menos e mais vulnerável, média do Ci e tempo de cálculo.
- **Tabela ranqueada:** posição, Ci (com barra), distâncias D+ e D- e faixa.
- **Gráfico de barras** do Ci.
- **Radar por município:** compare até 5 municípios marcando a coluna *Radar*. Cada eixo é um critério, de 0 (pior valor entre os avaliados) a 1 (melhor).
- **Mapa do resultado.**
- **Parâmetros e detalhes do cálculo:** pesos usados, pesos normalizados e soluções ideais A+ e A-.
- Se algum município ficou de fora por falta de dados, um aviso amarelo informa quais indicadores faltaram.

## 8. Relatórios (UC04)

Na tela de resultado (ou no **Histórico**), clique em:
- **Exportar PDF:** relatório com parâmetros e ranking, pronto para anexar a documentos;
- **Exportar CSV:** planilha (separador `;`) com ranking, distâncias, faixa e valores dos indicadores. Abre direto no Excel/LibreOffice.

## 9. Histórico

Lista todas as simulações: data, descrição, responsável, tamanho (municípios × critérios), primeiro e último colocados e tempo. Use 👁 para abrir, os ícones de documento para exportar e 🗑️ (só admin) para excluir.

## 10. Mapa

- **Simulação:** escolha qual simulação colorir (padrão: a mais recente).
- **Camada "Faixas (Ci)":** um ponto por município, na cor da faixa de vulnerabilidade.
- **Camada "Calor por indicador":** mapa de calor de um indicador escolhido (ou de *Vulnerabilidade = 1 − Ci*). Áreas mais quentes indicam valores mais altos.
- Use a roda do mouse ou os botões +/− para aproximar. Clique em um ponto para ver os detalhes.

## 11. Importação em lote (RF09)

1. Em **Importação**, clique em **Baixar modelo CSV** para obter o cabeçalho com os códigos dos critérios.
2. Preencha a planilha: uma linha por município, separador `;` com vírgula decimal (ou `,` com ponto decimal).
3. Arraste o arquivo para a área indicada (ou cole o conteúdo) e clique em **Importar**.
4. O resultado mostra quantos municípios foram criados ou atualizados e as linhas com erro. Um município já existente (mesmo código IBGE, ou mesmo nome + UF) é atualizado.

## 12. Usuários (administrador)

- **Novo usuário:** nome, e-mail, perfil e senha (mínimo 6 caracteres).
- **Editar:** alterar perfil ou definir nova senha. Deixe a senha em branco para mantê-la.
- Um administrador não pode excluir nem rebaixar a si mesmo.

## 13. Dúvidas frequentes

| Situação | O que fazer |
| --- | --- |
| "São necessários ao menos 2 municípios com todos os valores…" | Preencha os indicadores que faltam ou desmarque o critério na execução |
| "A soma dos pesos deve ser 1,0" | Clique em **Normalizar** antes de salvar |
| "Não foi possível conectar à API" | Verifique se o backend está em execução (`docker compose ps`) |
| Fui redirecionado para o login | A sessão expirou. Entre novamente |
