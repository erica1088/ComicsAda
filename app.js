



const urlApi = "https://gateway.marvel.com";
const publicKey = "ff5a7a49cb20b1175190324e57f8e7df";
const hash = "cccd58a3c901f35ef6f77a12e3e81136";
const timeStamp = "1730836400";
const urlComics = "/v1/public/comics";
const urlPersonajes = "/v1/public/characters";
const paramAtorizacion = `?ts=${timeStamp}&apikey=${publicKey}&hash=${hash}`;


let currentPage = 0;
let totalItems = 0;
let currentPerPage= 20;


const loadingIndicator = document.getElementById('loadingIndicator');
const resultadosBusqueda = document.getElementById('resultados-busqueda');
const paginacionContainer = document.getElementById('pagination-container')
const contenedorDetalles= document.getElementById("contenedor-detalles")
const detalleCodigo = document.getElementById("detalle-codigo")
const resultados= document.getElementById("resultados")
const searchInput= document.getElementById("searchInput")




function showSpinner() {
  loadingIndicator.classList.remove('hidden');
}

function hideSpinner() {
  loadingIndicator.classList.add('hidden');
}

function showMessageError(message = "Error al obtener los datos. Por favor intente nuevamente" ){

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

    if (!response.ok){
      throw new Error(`error al obtener datos: ${response.statusText} `)
    }
     const data = await response.json();
     return data.data;
  } catch (error) {
     console.error("Error al obtener Datos:", error);
    showMessageError();
  } finally {
     hideSpinner();
   }
 }





 async function searchItems(type, query = "") {
 
    const endpoint = type === "comics" ? urlComics : urlPersonajes;
   const params = query ? { [type === "comics" ? "titleStartsWith" : "name"]: query } : {};

   try{
   const data = await fetchFromApi(endpoint, params);
    const results = data?.results || [];
   totalItems = data?.total || 0;

  displayItems(results, type);
    updatePagination();
 } catch(error){
  showMessageError("no se encontraron resultados")
 }

}



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


// items  DOM (para comics o personaje)
function displayItems(items, type) {
  resultadosBusqueda.innerHTML = '';
  if (items.length === 0) {
    resultadosBusqueda.innerHTML = `<p>No se encontraron ${type === 'comics' ? 'cómics' : 'personajes'}.</p>`;
  } else {
   
      resultadosBusqueda.classList.add('grid' , 'grid-cols-1' , 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
      

      items.forEach(item =>{ 
      resultadosBusqueda.appendChild(createCard(item, type));
    });
  }

}







function createCard(item, type) {
  const card = document.createElement('div');
  card.classList.add('p-4',  'rounded-lg', 'shadow-md', 'transition-transform', 'transform', 'hover:scale-105', 'hover:shadow-xl');

  const img = document.createElement('img');
  img.src = `${item.thumbnail.path}.${item.thumbnail.extension}`;
  img.alt = item.name || item.title;
  img.classList.add('w-full','object-cover', 'sm:w-[150px]', 'md:w-[200px]', 'rounded-lg','h-[200px]' );
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
  link.textContent=('Ver detalles')
  card.appendChild(link);





  addCardHoverEffects(card);
 
  

  
 return card;


};












async function fetchComics() {
  const searchQuery = document.getElementById('searchInput').value.trim();
  const type = document.getElementById('tipo-busquedas').value;
  searchItems(type, searchQuery);
}



 


 
 function createPaginationButton(label, callback, page){
  const button = document.createElement('button');
  button.textContent= label;
  button.classList.add('px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded', 'hover:bg-blue-600', 'focus:outline-none');

  button.addEventListener("click", () => callback(page));

  return button;

}

  function showNumberOfResults(results){
   

   document.getElementById("cantidad-resultados").textContent = `${results} Resultados encontrados`
  }
 
 
 function goToPage(page) {
   if (page >= 0 && page < Math.ceil(totalItems / currentPerPage)) {
     currentPage = page;
     fetchItems();
   }
 }



 // Paginacion
function updatePagination() {

  const totalPages = Math.ceil(totalItems / currentPerPage);
 
   paginacionContainer.innerHTML = '';


   if (currentPage > 0) {
     paginacionContainer.appendChild(createPaginationButton('<<', goToPage, 0)); 
    paginacionContainer.appendChild(createPaginationButton('<', goToPage, currentPage - 1)); 
    }
 

   if(currentPage < totalPages - 1) { 
   paginacionContainer.appendChild(createPaginationButton('>', goToPage, currentPage + 1)); 
     paginacionContainer.appendChild(createPaginationButton('>>', goToPage, totalPages - 1)); 
    }
 
   showNumberOfResults(totalItems);
 }
 



async function fetchItems() {
  const offset = currentPage * currentPerPage;
  const type =document.getElementById("tipo-busquedas").value;
  const endpoint = type === "comics" ? urlComics : urlPersonajes;

  const params ={limit: currentPerPage, offset};

  if (type === "comics"){
    params.titleStartsWith = document.getElementById('searchInput').value.trim();

  } else{
    params.name = document.getElementById('searchInput').value.trim();
  }
  
  await searchItems(type,params)
  // return await fetchFromApi(endpoint, params)
}






document.getElementById('searchBtn').addEventListener('click', () => {
  const searchQuery = document.getElementById('searchInput').value.trim();
  const type = document.getElementById('tipo-busquedas').value;
searchItems(type, searchQuery);
});

fetchItems()
// mostrar detalles de comic









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
 <button id="btnvolver">Volver al inicio</button>
<h2 class= "tituloH2">${comic.title}</h2>
 <img class="imgCard md:w-[200px] h-[300px]" src="${imgUrl}" alt="${comic.title}">
<h3 class= "subtitulos">Publicado:</h3>
 <p class = "mt-2 text-gray-600 ">${formatteDate}</p>
 <h3 class= "subtitulos">Guionistas:</h3>
 <p class= "mt-2 text-gray-600"${comic.creators.items.map((item) => item.name).join(", ")}></p>
 <h3 class="subtitulos">Descripción:</h3>
 <p class= "mt-2 text-grey-600">${comic.description || "Descripción no disponible."}</p>
       <h2 class= "tituloH2">Cantidad de Personajes:${comic.characters.items.length}</h2>
       `;

            
       displayComicCharacters(comic.characters.items);

       document.getElementById("btnVolver").addEventListener("click", () =>{
          contenedorDetalles.classList.add("hidden");
              detalleCodigo.classList.remove("hidden");
              resultados.classList.remove("hidden");

        });



    } catch(error){
       console.error(error);
     showMessageError()
    }
 
  };




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




const fetchCharacterDetails = async (characterID) =>{
  try{
    const data = await fetchFromApi(`${urlPersonajes}/${characterID}${paramAtorizacion}`);
    const character = data?.results[0];
    if (!character) throw new Error('Personaje no encontrado');
    
    const imgUrl =  `${character.thumbnail.path}.${character.thumbnail.extension}`;
    contenedorDetalles.classList.remove('hidden');
    detalleCodigo.classList.add('hidden');
    resultados.classList.add('hidden');

    contenedorDetalles.innerHTML= `
    <button id="btnVolver">Volver al inicio</button>
    <h2 class="tituloH2">${character.name}</h2>
    <img class="img m:w-[200px] h-[300px] object-cover mx-auto rounded-lg" src="${imgUrl}" alt="${character.name}">
    <h3 class="subtitulos">Cómics:</h3>
    <p class="mt-2 text-gray-600">${character.comics.item.map(item => item.name).join(",")}</p>
    `;

    document.getElementById("btnVolver").addEventListener("click", () =>{
      contenedorDetalles.classList.add("hidden");
      detalleCodigo.classList.remove("hidden");
      resultados.classList.remove("hidden")
    });
  } catch (error){
    console.error(error);
    showMessageError();
  }
};
























// const  mostrarResultadosComic = (comicID)  => {

//   fetch(`${urlComics}${comicID}${paramAtorizacion}`)
//    .then((response) =>{
//     if (!response.ok){
//        throw new Error("Error a la respuesta de la red")
//      }

//       return response.json();
//    })

//    .then((json)=>{
//    console.log(json)
//      if (json.data && json.data.results.length > 0){
//       const comic = json.data.results[0]

//         if ( comic.thumbnail && comic.thumbnail.path && comic.thumbmail.extension){
          
//          const imgUrl= `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
//          const originFecha = new Date(comic.dates[0].date);
//           const dia = String(originFecha.getDate()).padStart(2, "0")
//          const mes = String(originFecha.getMonth() + 1).padStart(2, "0")
//         const año = originFecha.getFullYear();

//         contenedorDetalles.classList.add("hidden");
//         detalleCodigo.classList.remove("hidden");
//        resultados.classList.add("hidden");
//       detalleCodigo.innerHTML= `
      
//        <button id="btnvolver">Volver al inicio</button>
//          <h2 class= "tituloH2">${comic.title}</h2>
//         <img class="img m:w-[200px] h-[300px] object-cover mx-auto rounded-lg"  src="${imgUrl}" alt="${comic.title}">
//         <h3 class= "subtitulos">Publicado:</h3>
//         <p class = "mt-2 text-gray-600 ">${dia}${mes}${año}</p>
//          <h3 class= "subtitulos">Guionistas:</h3>
//          <p class= "mt-2 text-gray-600"${comic.creators.items.map((item) => item.name).join(", ")}></p>
//      <h3 class="subtitulos">Descripción:</h3>
//         <p class= "mt-2 text-grey-600">${comic.description}</p>
//               <h2 class= "tituloH2">Cantidad de Personajes:${comic.characters.items.length}</h2>
//               `;

            
 
//        document.getElementById("btnVolver").addEventListener("click", () =>{
//                detalleCodigo.classList.add("hidden");
//               contenedorDetalles.classList.remove("hidden");
//               resultados.classList.remove("hidden");
//        });

//      const personajes = comic.character.items;
//        const personajesComics = document.createElement("div");
//       contenedorDetalles.appendChild(personajesComics);

//      if (personajes.length > 0){
//        personajes.forEach((item) =>{
//           personajesComics.innerHTML += `

//            <h3 class="subtitulos">${item.name}</h3>
//           <img src="${item.thumbmail.path}${item.thumbmail.extension}" alt="${item.name}"/>
//          `;
//        })

//        } else  {
//         personajesComics.innerHTML += `
//         <div class= "flex flex-wrap mt-2 min-h-[300px]">
//        <h2 class= "tituloH2">No se encontraron resultados</h2>
//         </div>`;
//        }



//     } else {
//        console.error("No se encontró la imagen del cómic.");
//     }
//   } else {
//     console.error("No se encontró el cómic con el ID proporcionado.");
//    }
// })

// .catch((error) => {
//   console.error("Error al obtener los datos:", error);
//  });
//  };







// const  mostrarResultadosCharacters = (characterID)  => {

//    fetch(`${urlPersonajes}${characterID}${paramAtorizacion}`)
//    .then((response) =>{
//     if (!response.ok){
//       throw new Error("Error a la respuesta de la red")
//      }

//      return response.json();
//    })

//   .then((json)=>{
//   console.log(json)
//     if (json.data && json.data.results.length > 0){
//       const character= json.data.results[0]

  


//         const imgUrl= `${character.thumbnail.path}.${character.thumbnail.extension}`;

 
         

//        contenedorDetalles.classList.add("hidden");
//        detalleCodigo.classList.remove("hidden");
//        resultados.classList.add("hidden");
//       detalleCodigo.innerHTML= `
     
//      <button id="btnvolver">Volver al inicio</button>
//        <h2 class= "tituloH2">${character.title}</h2>
//         <img class="img md:w-[200px] h-[300px]" src="${imgUrl}" alt="${character.name}">
    
       
//        <h3 class="subtitulos">Comics</h3>
//        <p class= "mt-2 text-grey-600">${character.comics.items.map((item)=> item.name).join(", ")}</p>
        
//              `;

           

//       document.getElementById("btnVolver").addEventListener("click", () =>{
//              detalleCodigo.classList.add("hidden");
//              contenedorDetalles.classList.remove("hidden");
//              resultados.classList.remove("hidden");

//       });

   



//    } else {
//       console.error("No se encontró personaje.");
//   }
//   })

//  .catch((error) => {
//   console.error("Error al obtener los datos:", error);
//  });
//  };

//  showNumberOfResults();
 