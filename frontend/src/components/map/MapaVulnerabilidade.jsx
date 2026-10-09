import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import L from './leafletGlobal';
import 'leaflet.heat';
import { FAIXAS } from '../../utils/vulnerabilidade';
import { formatarCi, formatarInteiro, formatarNumero } from '../../utils/format';

const CENTRO_BRASIL = [-14.235, -51.925];
const GRADIENTE = ['#1d4ed8', '#10b981', '#facc15', '#f97316', '#e11d48'];

// Itens com coordenadas; no modo calor, só os que têm `valor` numérico.
const visiveis = (itens, modo) =>
  itens.filter((i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude) && (modo === 'ci' || Number.isFinite(i.valor)));

// Enquadra o mapa nos itens e, no modo calor, desenha a camada de calor (intensidade = `valor` normalizado).
function Camadas({ itens, modo }) {
  const map = useMap();

  useEffect(() => {
    const pontos = visiveis(itens, modo);
    if (pontos.length) map.fitBounds(pontos.map((i) => [i.latitude, i.longitude]), { padding: [30, 30], maxZoom: 10 });
  }, [map, itens, modo]);

  useEffect(() => {
    const pontos = visiveis(itens, modo);
    if (modo !== 'calor' || !pontos.length) return undefined;
    const valores = pontos.map((i) => i.valor);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const camada = L.heatLayer(
      pontos.map((i) => [i.latitude, i.longitude, max === min ? 1 : 0.15 + (0.85 * (i.valor - min)) / (max - min)]),
      {
        radius: 38,
        blur: 28,
        max: 1,
        minOpacity: 0.35,
        gradient: { 0.2: GRADIENTE[0], 0.45: GRADIENTE[1], 0.65: GRADIENTE[2], 0.85: GRADIENTE[3], 1: GRADIENTE[4] },
      }
    ).addTo(map);
    return () => {
      map.removeLayer(camada);
    };
  }, [map, itens, modo]);

  return null;
}

// modo 'ci': pontos coloridos pela faixa de vulnerabilidade; modo 'calor': camada de calor pelo `valor` de cada item.
export default function MapaVulnerabilidade({ itens, modo = 'ci', rotulo, altura = 'h-[420px]' }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-800 ${altura}`}>
      <MapContainer center={CENTRO_BRASIL} zoom={4} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Camadas itens={itens} modo={modo} />
        {visiveis(itens, modo).map((i) => (
          <CircleMarker
            key={i.id}
            center={[i.latitude, i.longitude]}
            radius={modo === 'ci' ? 9 : 4}
            pathOptions={{
              color: '#0f172a',
              weight: 1.5,
              fillColor: modo === 'ci' ? FAIXAS[i.faixa]?.cor || '#e2e8f0' : '#e2e8f0',
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="min-w-44 space-y-1 text-sm">
                <p className="font-semibold">
                  {i.nome} — {i.uf}
                </p>
                {Number.isFinite(i.ci) && (
                  <p>
                    Ci: <strong>{formatarCi(i.ci)}</strong> ({i.posicao}º) • {i.faixa}
                  </p>
                )}
                {i.populacao ? <p>População: {formatarInteiro(i.populacao)}</p> : null}
                {modo === 'calor' && (
                  <p>
                    {rotulo}: <strong>{formatarNumero(i.valor, 3)}</strong>
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[500] rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-300">
        <p className="mb-1 font-semibold text-slate-200">{modo === 'ci' ? 'Vulnerabilidade' : rotulo}</p>
        {modo === 'ci' ? (
          Object.entries(FAIXAS).map(([nome, f]) => (
            <p key={nome} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: f.cor }} /> {nome}
            </p>
          ))
        ) : (
          <>
            <div className="h-2 w-40 rounded" style={{ background: `linear-gradient(90deg,${GRADIENTE.join(',')})` }} />
            <div className="mt-1 flex justify-between">
              <span>menor</span>
              <span>maior</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
