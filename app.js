



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
const paginacionContainer = document.getElementById('pagination-container')


function showSpinner() {
  loadingIndicator.classList.remove('hidden');
}

function hideSpinner() {
  loadingIndicator.classList.add('hidden');
}

function showMessageErrror(message = "Error al obtener los datos. Por favor intente nuevamente" ){

  resultadosBusqueda.innerHTML=`<p>${message}</p>`;
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
 
  card.appendChild(description);

  const link = document.createElement('a');
  link.href = item.urls ? item.urls[0].url : "#";
  link.classList.add('text-blue-600', 'mt-2', 'block');
  card.appendChild(link);

  const detallesLink= document.createElement('a')
  detallesLink.href = `comic-details.html?id=${item.id}`;
  detallesLink.target= "_blank";
  detallesLink.textContent = "Ver detalles";
  detallesLink.classList.add('text-blue-600', 'mt-2', 'block', 'cursor-pointer');

  
 card.appendChild(detallesLink)
 addCardHoverEffects(card)
 return card;


};


function addCardHoverEffects(card){
  card.addEventListener('mouseover', () => {
    card.style.transform = "translateY(-10px)";
    card.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.2)";
})
card.addEventListener('mouseout', () => {
  card.style.transform = "translateY(0)";
  card.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
});

}


function handleDetailsButtonClick(item, type){

  let detailsUrl ='';
  resultados.classList.remove('hidden');
  contenedorDetalles.classList.remove('hidden');
  detalleCodigo.classList.remove('hidden');
if (type === 'comics'){
  detailsUrl = `${urlApi}${urlComics}/${item.id}${paramAtorizacion}`;
} else {
  detailsUrl = `${urlApi}${urlPersonajes}/${item.id}${paramAtorizacion}`;

}
window.open(detailsUrl, '_blank');
  // if (type === 'comics'){
  //   fetchComicDetails(item,id)

  // } else {
  //   fetchCharacterDetails(item.id);
  // }
  // contenedorDetalles.scrollIntoView({behavior: 'smooth'})
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




// Paginacion
function updatePagination() {

  paginacionContainer.innerHTML = '';

  const totalPages = Math.ceil(totalItems / comicsPerPage);

  if (currentPage > 0) {
    paginacionContainer.appendChild(createPaginationButton('<', goToPage, 0)); // First Page
    paginacionContainer.appendChild(createPaginationButton('<', goToPage, currentPage - 1)); // Previous Page
  }

  paginacionContainer.appendChild(createPaginationButton('>', goToPage, currentPage + 1)); // Next Page
  paginacionContainer.appendChild(createPaginationButton('>>', goToPage, totalPages - 1)); // Last Page
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

async function searchItems(type, query = "") {
  const endpoint = type === "comics" ? urlComics : urlPersonajes;
  const params = query ? { [type === "comics" ? "titleStartsWith" : "name"]: query } : {};

  const data = await fetchFromApi(endpoint, params);
  const results = data?.results || [];
  totalItems = data?.total || 0;

  displayItems(results, type);
  updatePagination();
}

async function fetchComics() {
  const offset = currentPage * comicsPerPage;
  const data = await fetchFromApi(urlComics, { limit: comicsPerPage, offset });
  const results = data?.results || [];
  totalItems = data?.total || 0;

  displayItems(results, "comics");
  updatePagination();
}




// Event listeners
document.getElementById('searchBtn').addEventListener('click', () => {
  const searchQuery = document.getElementById('searchInput').value.trim();
  const type = document.getElementById('tipo-busquedas').value;
  searchItems(type, searchQuery);
});







// mostrar detalles de comic

const contenedorDetalles= document.getElementById("contenedor-detalles")
const detalleCodigo = document.getElementById("detalle-codigo")
const resultados= document.getElementById("resultados")



const fetchComicDetails = async (comicID)=>{
 try{
  const data = await fetchFromApi(`${urlComics}/${comicID}${paramAtorizacion}`);
  const comic = data?.results[0];
  if (!comic) throw new Error('Comic no encontrado')


      const imgUrl =`${comic.thumbnail.path}.${comic.thumbnail.extension}`;
      const publicationDate = new Date(comic.dates[0].date);
     const formatteDate = `${publicationDate.getDate()}/${publicationDate.getMonth()+1}/${publicationDate.getFullYear()}`

     



       contenedorDetalles.classList.add('hidden')
       detalleCodigo.classList.remove('hidden')
       resultados.classList.add('hidden');

       contenedorDetalles.innerHTML= `
      // <button id="btnvolver">Volver al inicio</button>
      // <h2 class= "tituloH2">${comic.title}</h2>
      // <img class="imgCard md:w-[200px] h-[300px]" src="${imgUrl}" alt="${comic.title}">
      // <h3 class= "subtitulos">Publicado:</h3>
      // <p class = "mt-2 text-gray-600 ">${formatteDate}</p>
      // <h3 class= "subtitulos">Guionistas:</h3>
      // <p class= "mt-2 text-gray-600"${comic.creators.items.map((item) => item.name).join(", ")}></p>
      // <h3 class="subtitulos">Descripción:</h3>
      // <p class= "mt-2 text-grey-600">${comic.description || "Descripción no disponible."}</p>
      //       <h2 class= "tituloH2">Cantidad de Personajes:${comic.characters.items.length}</h2>
      //       `;

            
      displayComicCharacters(comic.characters.items);
      document.getElementById("btnVolver").addEventListener("click", () =>{
         contenedorDetalles.classList.add("hidden");
             detalleCodigo.classList.remove("hidden");
             resultados.classList.remove("hidden");

       });



    } catch(error){
      console.error(error);
      showMessageErrror()
    }
 
  };

const comicID = id;
fetchComicDetails(comicID);


function displayComicCharacters(characters){
  const personajesComics= document.createElement("div");
  contenedorDetalles.appendChild(personajesComics);

  if (characters.length > 0){
    characters.forEach(item =>{
      personajesComics.innerHTML += `
      <h3 class="subtitulos">${item.name}</h3>
      <img src= "${item.thumbnail.path}.${item.thumbnail.extension}" alt="${item.name}" class="w-[150px] h-[200px]"/>
      `;
    });
  }else {
    personajesComics.innerHTML =`<h2 class="tituloH2">No se encontraron personajes</h2>`;
  }
};




const fetchCharacterDetails = async (charactersId) =>{
  try{
    const data = await fetchFromApi(`${urlPersonajes}/${charactersId}${paramAtorizacion}`);
    const character = data?.results[0];
    if (!character) throw new Error('Personaje no encontrado');
    
    const imgUrl =  `${character.thumbnail.path}.${character.thumbnail.extension}`;
    contenedorDetalles.innerHTML= `
    <button id="btnVolver">Volver al inicio</button>
    <h2 class="tituloH2">${character.name}</h2>
    <img class="imgCard m:w-[200px] h-[300px]" src="${imgUrl}" alt="${character.name}">
    <h3 class="subtitulos">Cómics:</h3>
    <p class="mt-2 text-gray-600">${character.comic.item.map(item => item.name).join(",")}</p>
    `;

    document.getElementById("btnVolver").addEventListener("click", () =>{
      contenedorDetalles.classList.add("hidden");
      detalleCodigo.classList.remove("hidden");
      resultados.classList.remove("hidden")
    });
  } catch (error){
    console.error(error);
    showMessageErrror();
  }
};

fetchComics();












// function mostrarResultados ()  {

//   fetch(`${urlPersonajes}${characterID}${paramAtorizacion}`)
//   .then((response) =>{
//     if (!response.ok){
//       throw new Error("Error a la respuesta de la red")
//     }

//     return response.json();
//   })

//   .then((json)=>{
//     if (json.data && json.data.results.length > 0){
//       detalleCodigo.innerHTML= '';

//       json.data.results.forEach((item)=>{
//         const card = document.createElement('div');
//         card.classList.add("resultado-card");

//         imgUrl= `${item.thumbnail.path}.${item.thumbnail.extension}`;
//         const titulo =item.title || item.name;

//         card.innerHTML` <img class="imgTarj md:w-[200px] h-[300px]" src="${imgUrl}" alt="${titulo}">
//         <h3 class="tituloH3">${titulo}</h3>
//         <button class="btnVerDetalles" data-id="${item.id}">Ver detalles</button>
//       `;

//       detalleCodigo.appendChild(card);

//       card.querySelector(".btnVerDetalles").addEventListener("click", () =>{
//         if (item.title){
//           informacionComic(item.id);
          
//         } else {
//           informacionPersonaje(item.id);
//         }
//       })
//       })
//     } else{
//       detalleCodigo.innerHTML = `
//         <div class="flex flex-wrap mt-10 min-h-[300px]">
//             <h2 class="tituloH2">No se encontraron resultados</h2>
//           </div>
//           `;
//     }

//   })
//   .catch((error) =>{
//     console.error("errora al obtener datos", error);
//   })

// }