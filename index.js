const query = document.getElementById("query");
const search_button = document.getElementById("search-button");
let search_result = document.getElementById("search-result");
let sfw = 1;


query.addEventListener("keydown", (event) => {
  if(event.key == "Enter") {    
    search_button.click();        
  }
});


function sfw_Switch() {  
  const sfw_button = document.getElementById("sfw-button");
  if(sfw == 1) {
    sfw = 0;
    sfw_button.innerText = "NSFW";
    sfw_button.style.backgroundColor = "#fa4679";
    sfw_button.style.color = "white";
    sfw_button.classList.remove("sfw");
    sfw_button.classList.add("nsfw");
  } else {
    sfw = 1;
    sfw_button.innerText = "SFW";
    sfw_button.style.backgroundColor = "#75f7d4";
    sfw_button.style.color = "#115f58";
    sfw_button.classList.remove("nsfw");
    sfw_button.classList.add("sfw");   
  }
}

function toggleButton() {
  const sfw_button = document.getElementById("sfw-button");
  sfw = (sfw == 1) ? 0 : 1;
  
  if (sfw_button.innerText === "SFW") {
    sfw_button.innerText = "NSFW";
    sfw_button.classList.remove("sfw");
    sfw_button.classList.add("nsfw");
  } else {
    sfw_button.innerText = "SFW";
    sfw_button.classList.remove("nsfw");
    sfw_button.classList.add("sfw");
  }
}


async function getAnimeList() {  
  search_result.innerHTML = `<span id="loading">Loading...</span> 
                             <span id="animeListCount"></span>`;
  const animeListCount = document.getElementById("animeListCount");
  const loading = document.getElementById("loading");

  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query.value.trim())}&sfw=${sfw}`;  
  try {
    loading.style.display = "block";
    const response = await fetch(url);
    const data = await response.json();
    const dataLength = data.data ? data.data.length : 0;    
    loading.style.display = "none";    

    if(dataLength > 0) {      
      animeListCount.innerText = `Showing ${dataLength} results: `;
      for(let i = 0; i < dataLength; i++) {
        const animeData = data.data[i];      
        const genresList = animeData.genres.map(genre => genre.name).join(' / ');

        search_result.innerHTML += `
          <div class="card-wrapper">
            <img src="${animeData.images.jpg.image_url}" alt="Anime Poster">
            <div class="card-data">
                <h3>${animeData.title_english || animeData.title}</h3> 
                <h4>Genres: <span class="sub-data">${genresList}</span></h4>
                <h4>Episodes: <span class="sub-data">${animeData.episodes}</span></h4>     
                <h4>Status: <span class="sub-data">${animeData.status}</span></h4>          
            </div>
          </div>
        `;     
      }
    } else {
      animeListCount.innerText = "Showing 0 results: ";
    }
  } catch(error) {
    loading.style.display = "none";
    console.log(error.message);
  } 
}

getAnimeList();
