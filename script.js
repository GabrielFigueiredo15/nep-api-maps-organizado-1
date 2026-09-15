// Coordenadas aproximadas da Universidade de Fortaleza (UNIFOR)
const CENTRO_INICIAL = { lat: -3.7793, lng: -38.481 };
const ZOOM_INICIAL = 17;

let map;
let proximoId = 1;
const pontos = new Map(); // id -> { marker, titulo, lat, lng }

const listaEl = document.getElementById("lista-pontos");
const totalEl = document.getElementById("total-pontos");
const erroEl = document.getElementById("mensagem-erro");

function renderizarLista() {
  totalEl.textContent = pontos.size;

  if (pontos.size === 0) {
    listaEl.innerHTML = '<li class="vazio">Nenhum ponto adicionado ainda.</li>';
    return;
  }

  listaEl.innerHTML = "";
  pontos.forEach((ponto, id) => {
    const li = document.createElement("li");
    li.tabIndex = 0;
    li.innerHTML = `
      <span class="nome">${ponto.titulo}</span>
      <span class="coords">${ponto.lat.toFixed(5)}, ${ponto.lng.toFixed(5)}</span>
    `;
    const irAoPonto = () => {
      map.panTo({ lat: ponto.lat, lng: ponto.lng });
      map.setZoom(Math.max(map.getZoom(), 18));
    };
    li.addEventListener("click", irAoPonto);
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") irAoPonto();
    });
    listaEl.appendChild(li);
  });
}

// Ícone de marcador customizado (alinhado à paleta do projeto)
function iconeMarcador() {
  return {
    path: "M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z",
    fillColor: "#F2A93B",
    fillOpacity: 1,
    strokeColor: "#17233B",
    strokeWeight: 1,
    scale: 1.6,
    anchor: new google.maps.Point(12, 22),
  };
}

// Função que recebe latitude, longitude e título e adiciona o marcador ao mapa
function adicionarPonto(lat, lng, tituloInformado) {
  const id = proximoId++;
  const titulo = tituloInformado && tituloInformado.trim() ? tituloInformado.trim() : `Ponto ${id}`;

  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    title: titulo,
    draggable: true, // permite arrastar o marcador (item opcional)
    icon: iconeMarcador(),
    animation: google.maps.Animation.DROP,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `<strong>${titulo}</strong><br/>${lat.toFixed(5)}, ${lng.toFixed(5)}`,
  });
  marker.addListener("click", () => infoWindow.open(map, marker));

  marker.addListener("dragend", (event) => {
    const ponto = pontos.get(id);
    ponto.lat = event.latLng.lat();
    ponto.lng = event.latLng.lng();
    infoWindow.setContent(`<strong>${ponto.titulo}</strong><br/>${ponto.lat.toFixed(5)}, ${ponto.lng.toFixed(5)}`);
    renderizarLista();
  });

  pontos.set(id, { marker, titulo, lat, lng });
  renderizarLista();
  return id;
}

// Função que inicializa o mapa, definindo centro e zoom inicial
// (chamada automaticamente pelo callback da API do Google Maps, no index.html)
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CENTRO_INICIAL,
    zoom: ZOOM_INICIAL,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });

  // Evento de clique no mapa: adiciona um marcador na posição clicada
  map.addListener("click", (event) => {
    adicionarPonto(event.latLng.lat(), event.latLng.lng());
  });
}

// Evento de clique no botão "Adicionar Ponto"
document.getElementById("form-ponto").addEventListener("submit", (e) => {
  e.preventDefault();
  erroEl.textContent = "";

  const lat = parseFloat(document.getElementById("input-lat").value);
  const lng = parseFloat(document.getElementById("input-lng").value);
  const titulo = document.getElementById("input-titulo").value;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    erroEl.textContent = "Informe latitude e longitude válidas.";
    return;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    erroEl.textContent = "Latitude deve estar entre -90 e 90, longitude entre -180 e 180.";
    return;
  }

  adicionarPonto(lat, lng, titulo);
  map.panTo({ lat, lng });

  document.getElementById("input-lat").value = "";
  document.getElementById("input-lng").value = "";
  document.getElementById("input-titulo").value = "";
});
