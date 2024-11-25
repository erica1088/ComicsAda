



const urlApi = "https://gateway.marvel.com";
const publicKey = "ff5a7a49cb20b1175190324e57f8e7df";
const hash = "cccd58a3c901f35ef6f77a12e3e81136";
const timeStamp = "1730836400";
const urlComics = "/v1/public/comics";
const urlPersonajes = "/v1/public/characters";
const paramAtorizacion = `?ts=${timeStamp}&apikey=${publicKey}&hash=${hash}`;
const comicsPerPage = 20;

let currentPage = 0;
let totalItems = 0;

const loadingIndicator = document.getElementById('loadingIndicator');
const resultadosBusqueda = document.getElementById('resultados-busqueda');


function showSpinner() {
  loadingIndicator.classList.remove('hidden');
}

function hideSpinner() {
  loadingIndicator.classList.add('hidden');
}


async function fetchFromApi(endpoint, params = {}) {
  showSpinner();
  const url = new URL(`${urlApi}${endpoint}`);
  params.ts = timeStamp;
  params.apikey = publicKey;
  params.hash = hash;
  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    showErrorMessage();
  } finally {
    hideSpinner();
  }
}





// funcion para mostrar detallles de comic y o personaje

function verDetalles(item, type) {
  const contenedorDetalles= document.getElementById("contenedor-detalles")
  contenedorDetalles.classList.remove('hidden');


  const detalleCodigo=document.getElementById("detalle-codigo");  //se muestran los detalles
  
  detalleCodigo.innerHTML= ''; 

  const title = document.createElement('h2');
  title.classList.add('text-2xl', 'font-bold');
  title.textContent = item.name || item.title;
}




function createCard(item, type) {
  const card = document.createElement('div');
  card.classList.add('w-full', 'sm:w-1/3', 'md:w-1/4', 'p-4', 'bg-gray-100', 'rounded-lg', 'shadow-md', 'transition-transform', 'transform', 'hover:scale-105', 'hover:shadow-xl');

  const img = document.createElement('img');
  img.src = `${item.thumbnail.path}.${item.thumbnail.extension}`;
  img.alt = item.name || item.title;
  img.classList.add('w-full', 'object-cover', 'rounded-lg');
  card.appendChild(img);

  const title = document.createElement('h3');
  title.classList.add('text-xl', 'font-bold', 'mt-2');
  title.textContent = item.name || item.title;
  card.appendChild(title);

  const description = document.createElement('p');
  description.classList.add('text-md', 'mt-2');
  description.textContent = item.description || "Descripción no disponible.";
  card.appendChild(description);

  const link = document.createElement('a');
  link.href = item.urls ? item.urls[0].url : "#";
  link.classList.add('text-blue-600', 'mt-2', 'block');
  link.textContent = 'Ver Más';
  card.appendChild(link);


if (type === 'characters'){
  card.addEventListener('click', () => {
    
  })
}



  card.addEventListener('mouseover', () => {
    card.style.transform = "translateY(-10px)";
    card.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.2)";
  });

  card.addEventListener('mouseout', () => {
    card.style.transform = "translateY(0)";
    card.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
  });

  return card;
}

// items  DOM (para comics o personaje)
function displayItems(items, type) {
  resultadosBusqueda.innerHTML = '';
  if (items.length === 0) {
    resultadosBusqueda.innerHTML = `<p>No se encontraron ${type === 'comics' ? 'cómics' : 'personajes'}.</p>`;
  } else {
    items.forEach(item => {
      resultadosBusqueda.appendChild(createCard(item, type));
    });
  }
}


async function searchItems(type, query = "") {
  const endpoint = type === "comics" ? urlComics : urlPersonajes;
  const params = query ? { [type === "comics" ? "titleStartsWith" : "name"]: query } : {};

  const data = await fetchFromApi(endpoint, params);
  const results = data?.results || [];
  totalItems = data?.total || 0;

  displayItems(results, type);
  updatePagination();
}

// Paginacion
function updatePagination() {
  const paginationContainer = document.getElementById('pagination-container');
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(totalItems / comicsPerPage);

  if (currentPage > 0) {
    paginationContainer.appendChild(createPaginationButton('<', goToPage, 0)); // First Page
    paginationContainer.appendChild(createPaginationButton('<', goToPage, currentPage - 1)); // Previous Page
  }

  paginationContainer.appendChild(createPaginationButton('>', goToPage, currentPage + 1)); // Next Page
  paginationContainer.appendChild(createPaginationButton('>>', goToPage, totalPages - 1)); // Last Page
}

function createPaginationButton(text, handler, page) {
  const button = document.createElement('button');
  button.innerText = text;
  button.className = 'px-3 py-2 bg-gray-200 rounded text-gray-700';
  button.addEventListener('click', () => handler(page));
  return button;
}

function goToPage(page) {
  if (page >= 0 && page < Math.ceil(totalItems / comicsPerPage)) {
    currentPage = page;
    fetchComics();
  }
}

// Error handling
function showErrorMessage() {
  resultadosBusqueda.innerHTML = '<p>Error al obtener los datos. Por favor intente nuevamente.</p>';
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', () => {
  const searchQuery = document.getElementById('searchInput').value.trim();
  const type = document.getElementById('tipo-busquedas').value;
  searchItems(type, searchQuery);
});

async function fetchComics() {
  const offset = currentPage * comicsPerPage;
  const data = await fetchFromApi(urlComics, { limit: comicsPerPage, offset });
  const results = data?.results || [];
  totalItems = data?.total || 0;

  displayItems(results, "comics");
  updatePagination();
}

// Initialize on load
fetchComics();
