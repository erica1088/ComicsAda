const urlApi = "https://gateway.marvel.com";
const publicKey = "ff5a7a49cb20b1175190324e57f8e7df";
const hash = "cccd58a3c901f35ef6f77a12e3e81136";
const timeStamp = "1730836400";
const urlComics = "/v1/public/comics";
const urlPersonajes = "/v1/public/characters";
const paramAtorizacion = `?ts=${timeStamp}&apikey=${publicKey}&hash=${hash}`;

let currentPage = 1;
let totalItems = 0;

let currentPerPage = 20;

const loadingIndicator = document.getElementById("loadingIndicator");
const resultadosBusqueda = document.getElementById("resultados-busqueda");
const paginacionContainer = document.getElementById("pagination-container");
const contenedorDetalles = document.getElementById("contenedor-detalles");
const detalleCodigo = document.getElementById("detalle-codigo");
const resultados = document.getElementById("resultados");
const searchInput = document.getElementById("searchInput");
const tipoBusquedas = document.getElementById("tipo-busquedas");
const ordenBusquedas = document.getElementById("orden-busqueda");
const ordenCharacters = document.getElementById("orden-characters");
const cantidadResultados = document.getElementById("cantidad-resultados");
const busqueda = document.getElementById("busqueda");

function showSpinner() {
  loadingIndicator.classList.remove("hidden");
}

function hideSpinner() {
  loadingIndicator.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  loadingIndicator.classList.add("hidden");
  resultadosBusqueda.classList.add("hidden");
  cantidadResultados.classList.add("hidden");
  paginacionContainer.classList.add("hidden");

  searchBtn.addEventListener("click", () => {
    resultadosBusqueda.innerHTML = "";
    resultadosBusqueda.classList.remove("hidden");
    cantidadResultados.classList.add("hidden");
    paginacionContainer.classList.remove("hidden");
  });
});

tipoBusquedas.onchange = () => {
  if (tipoBusquedas.value === "characters") {
    ordenBusquedas.classList.add("hidden");
    ordenCharacters.classList.remove("hidden");
  } else {
    ordenBusquedas.classList.remove("hidden");
    ordenCharacters.classList.add("hidden");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  resultadosBusqueda.classList.add("hidden");
  cantidadResultados.classList.add("hiddden");
  resultados.classList.add("hidden");

  searchBtn.addEventListener("click", () => {
    resultadosBusqueda.innerHTML = "";
    resultadosBusqueda.classList.remove("hidden");
    cantidadResultados.classList.add("hiddden");
    resultados.classList.remove("hidden");
  });
});


const limit = 100;
const offset =0;



async function fetchFromApi(endpoint, params = {}) {
  showSpinner();
  const url = new URL(`${urlApi}${endpoint}`);
  
  

  params.ts = timeStamp;
  params.apikey = publicKey;
  params.hash = hash;

  url.search = new URLSearchParams(params).toString();
  

  try {
    const response = await fetch(url);
  

    if (!response.ok) {
      throw new Error(`error al obtener datos: ${response.statusText},`);
    }
    const data = await response.json();
    console.log(data);
    
    return data.data;
   
  } catch (error) {
    console.error("Error al obtener Datos:", error);
    showMessageError();
  } finally {
    hideSpinner();
  }
}

function showMessageError(
  message = "Error al obtener los datos. Por favor, intente nuevamente"
) {
  resultadosBusqueda.innerHTML = "";
  document.getElementById("no-results").classList.remove("hidden");

  noResults.classList.remove("hidden");
  noResults.querySelector("p").textContent = message;
}

function showSpinner() {
  loadingIndicator.classList.remove("hidden");
}

function hideSpinner() {
  loadingIndicator.classList.add("hidden");
}

async function searchItems(type, query = "", order = "") {
  const endpoint = type === "comics" ? urlComics : urlPersonajes;
  const params = query
    ? { [type === "comics" ? "titleStartsWith" : "name"]: query }
    : {};

  if (type === "comics") {
    if (searchInput.value.trim()) {
      params.titleStartsWith = searchInput.value.trim();
    }
  } else if (type === "characters") {
    if (searchInput.value.trim()) {
      params.name = searchInput.value.trim();
    }
  }

  if (type === "comics") {
    switch (order) {
      case "a-z":
        params.orderBy = "title";
        break;
      case "z-a":
        params.orderBy = "-title";
        break;
      case "mas nuevos":
        params.orderBy = "-focDate";
        break;
      case "mas viejos":
        params.orderBy = "focDate";
        break;
    }
  } else if (type === "characters") {
    if (searchInput.value.trim()) {
      params.name = searchInput.value.trim();
    }
    params.orderBy = order === "a-z" ? "name" : "-name";
  }

  try {
    const data = await fetchFromApi(endpoint, params);
    const results = data?.results || [];
    totalItems = data?.total || 0;

    displayItems(results, type);
    updatePagination();
  } catch (error) {
    showMessageError("no se encontraron resultados");
  }
}

function displayItems(items, type) {
  resultadosBusqueda.innerHTML = "";
  if (items.length === 0) {
    resultadosBusqueda.innerHTML = `<p>No se encontraron ${
      type === "comics" ? "cómics" : "characters"
    }.</p>`;
  } else {
    resultadosBusqueda.classList.add(
      "grid",
      "grid-cols-1",
      "sm:grid-cols-2",
      "lg:grid-cols-3",
      "gap-4"
    );

    items.forEach((item) => {
      resultadosBusqueda.appendChild(createCard(item, type));
    });
  }
}

// Funcion para crear card de cada personaje o comic

function createCard(item, type) {
  const card = document.createElement("div");
  card.className = `
      transition-transform transform hover:scale-105 overflow-hidden w-25 h-75 flex-col flex justify-between my-10 mb-5 mx-10 
      sm-rounded shadow-lg bg-contain
       lg:w-72 lg:h-auto
  
`;

  const img = document.createElement("img");
  img.src = `${item.thumbnail.path}.${item.thumbnail.extension}`;
  img.alt = item.name || item.title;
  img.className = `
 sm-rounded w-full  h-full shadow
 object-cover  overflow-hidden `;
  card.appendChild(img);

  const title = document.createElement("h3");
  title.classList.add(
    "text-sm",
    "font-bold",
    "text-gray-900",
    "h-10",
    "mb-4",
    "p-5",
    "overflow-hidden"
  );
  title.textContent = item.name || item.title;
  card.appendChild(title);

  const link = document.createElement("a");
  link.classList.add(
    "text-blue-600",
    "p-2",
    "mb-5",
    "block",
    "cursor-pointer",
    "hover:underline",
    "transition-colors",
    "duration-300",
    "text-center"
  );
  link.textContent = "Ver más";
  card.appendChild(link);

  link.addEventListener("click", () => {
    showDetails(item, type);
  });

  addCardHoverEffects(card);

  return card;
}

function addCardHoverEffects(card) {
  card.addEventListener("mouseover", () => {
    card.style.transform = "translateY(-10px)";
    card.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.8)";
  });
  card.addEventListener("mouseout", () => {
    card.style.transform = "translateY(0)";
    card.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
  });
}

function showDetails(item, type) {
  const contenedorDetalles = document.getElementById("contenedor-detalles");

  contenedorDetalles.innerHTML = "";

  if (type === "comics") {
    const comicDetails = ` <div class=" p-6 rounded-lg "flex flex-wrap items-center mt-10 min-h-[300px] md:h-[200px]"">
        <img class="md:w-[200px] h-[300px] object-cover rounded-lg" src="${
          item.thumbnail.path
        }.${item.thumbnail.extension}" alt="${item.title}">
        <h2 class="text-2xl font-bold mt-4">${item.title}</h2>
        <p class="mt-2 text-gray-700">${item.description}</p>
        <h3 class="mt-4 font-semibold">Guionistas:</h3>
        <p class="mt-2 text-gray-600">${item.creators.items
          .map((item) => item.name)
          .join(", ")}</p>
        <h3 class="mt-4 font-semibold">Personajes:</h3>
        <ul class="list-disc pl-5">
          ${item.characters.items
            .map((character) => `<li>${character.name}</li>`)
            .join("")}
        </ul>
      </div>
   `;

    contenedorDetalles.innerHTML = comicDetails;
  } else if (type === "characters") {
    const characterDetails = `
 
        <img class="md:w-[200px] h-[300px] object-cover rounded-lg" src="${
          item.thumbnail.path
        }.${item.thumbnail.extension}" alt="${item.name}">
        <h2 class="text-2xl font-bold mt-4">${item.name}</h2>
        <p class="mt-2 text-gray-700">${
          item.description || "No hay descripción disponible"
        }</p>
     
      `;

    contenedorDetalles.innerHTML = characterDetails;
  }





  contenedorDetalles.classList.remove("hidden");
  tipoBusquedas.classList.add("hidden");
  ordenBusquedas.classList.add("hidden");
  searchBtn.classList.add("hidden");
  document.getElementById("resultados-busqueda").classList.add("hidden");
  busqueda.classList.add("hidden");

  paginacionContainer.classList.add("hidden");

  const backButton = document.createElement("button");
  backButton.classList.add(
    "mt-4",
    "p-2",
    "bg-yellow-500",
    "text-white",
    "rounded-lg",
    "hover:bg-yellow-400",
    "focus:outline-none"
  );
    backButton.textContent = "Volver al inicio";
    backButton.addEventListener("click", () => {
    contenedorDetalles.classList.add("hidden");
    tipoBusquedas.classList.remove("hidden");
    searchBtn.classList.remove("hidden");
    ordenBusquedas.classList.remove("hidden");
    busqueda.classList.remove("hidden");
    document.getElementById("resultados-busqueda").classList.remove("hidden");

    paginacionContainer.classList.remove("hidden");
  });

  contenedorDetalles.appendChild(backButton);
}






function mostrarResultados(data, type) {
  const contenedorBusqueda = document.getElementById("resultados-busqueda");
  contenedorBusqueda.innerHTML = "";

  data.forEach((item) => {
    const card = createCard(item, type);
    contenedorBusqueda.appendChild(card);
  });
}

async function fetchComics() {
  const searchQuery = document.getElementById("searchInput").value.trim();
  const type = document.getElementById("tipo-busquedas").value;
  searchItems(type, searchQuery);
}

function showNumberOfResults() {
  cantidadResultados.textContent = `${totalItems} `;
}

fetchComics();

function createPaginationButton(label, callback, page) {
  const button = document.createElement("button");
  button.textContent = label;
  button.classList.add(
    "px-4",
    "py-2",
    "bg-blue-500",
    "text-white",
    "rounded-lg",
    "hover:bg-blue-600",
    "focus:outline-none"
  );
  button.addEventListener("click", () => callback(page));

  return button;
}

// Paginacion
function updatePagination() {
  paginacionContainer.innerHTML = "";
  const totalPages = Math.ceil(totalItems / currentPerPage);

  if (currentPage > 0) {
    paginacionContainer.appendChild(createPaginationButton("<<", goToPage, 0));
    paginacionContainer.appendChild(
      createPaginationButton("<", goToPage, currentPage - 1)
    );
  }

  if (currentPage < totalPages - 1) {
    paginacionContainer.appendChild(
      createPaginationButton(">", goToPage, currentPage + 1)
    );
    paginacionContainer.appendChild(
      createPaginationButton(">>", goToPage, totalPages - 1)
    );
  }

  showNumberOfResults(totalItems);
}

async function goToPage(page) {
  if (page >= 1 && page < Math.ceil(totalItems / currentPerPage)) {
    currentPage = page;
    searchItems(
      tipoBusquedas.value,
      searchInput.value.trim(),
      currentPage,
      currentPerPage
    );
  }
}

document.getElementById("searchBtn").addEventListener("click", () => {
  const searchQuery = searchInput.value.trim();
  const type = tipoBusquedas.value;
  const order = document.getElementById("orden-busqueda").value;
  const ordenCharacters = document.getElementById("orden-characters").value;
  const finalOrder = type === "characters" ? ordenCharacters : order;
  currentPage = 1;

  searchItems(type, searchQuery, finalOrder, currentPage);
});

function displayComicCharacters(characters) {
  const personajesComics = document.createElement("div");
  contenedorDetalles.appendChild(personajesComics);

  if (characters.length > 0) {
    characters.forEach((item) => {
      personajesComics.innerHTML += `
      <h3 class="subtitulos">${item.name}</h3>
      <img src= "${item.thumbnail.path}.${item.thumbnail.extension}" alt="${item.name}">
      `;
    });
  } else {
    personajesComics.innerHTML = `<h2 class="tituloH2">No se encontraron personajes</h2>`;
  }
}

const scrolltoTopButton = document.getElementById("scrollToTopButton");

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
document.getElementById("scrollToTopButton").onclick = scrollToTop;

 window.onscroll = function () {
   if (
     document.body.scrollTop > 200 ||
     document.documentElement.scrollTop > 200
  ) {
     scrolltoTopButton.style.opacity = "1";
     scrolltoTopButton.style.visibility = "visible";
   } else {
     scrolltoTopButton.style.opacity = "0";
    scrolltoTopButton.style.visibility = "hidden";
  }
};


