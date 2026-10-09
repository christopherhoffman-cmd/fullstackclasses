# Frontend — Plataforma de Energia Renovável TOPSIS

SPA em React 19 + Vite + Tailwind CSS 4, integrada à API REST do diretório [`../backend`](../backend).

## Executar

```bash
npm install
npm run dev      # http://localhost:5173 — /api é redirecionado para http://localhost:3001
npm run lint
npm run build    # gera dist/ (servido pelo Nginx no Docker)
```

Variáveis opcionais:

| Variável | Uso |
| --- | --- |
| `VITE_API_URL` | URL base da API no build (padrão: `/api`, mesmo domínio) |
| `VITE_PROXY_TARGET` | Destino do proxy `/api` no `npm run dev` (padrão: `http://localhost:3001`) |

## Organização

| Pasta | Conteúdo |
| --- | --- |
| `src/pages` | Uma página por rota: Login, Dashboard, Municípios, Configuração TOPSIS, Executar, Resultado, Histórico, Mapa, Importação, Usuários |
| `src/components` | `Layout`, `ProtectedRoute`, formulários (`MunicipioFormModal`, `CriterioFormModal`), `ui/` (botões, cards, modais, badges, estados), `charts/` (Chart.js), `map/` (Leaflet + leaflet.heat) |
| `src/services` | `api.js` (fetch com JWT, erros e downloads) e `index.js` (um serviço por recurso da API) |
| `src/hooks` | `useAuth` (sessão/JWT), `useApi` (carregamento com estados), `useToast` (notificações) |
| `src/utils` | Formatação pt-BR, pesos (soma = 1), faixas de vulnerabilidade/radar, validação de formulários, perfis |
