const query = document.getElementById("query");
const search_button = document.getElementById("search-button");
let search_result = document.getElementById("search-result");
let sfw = 1;


query.addEventListener("keydown", (event) => {
  if(event.key == "Enter") {    
    search_button.click();        
  }
});


function clearInput() {
  query.focus();
  query.value = "";
}


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


function loadingAnimation(loading) {
  const computedStyle = window.getComputedStyle(loading);
  if(computedStyle.display === "block") {   
    setTimeout(() => { 
      loading.innerText = "Loading";
      setTimeout(() => {
        loading.innerText = "Loading.";
        setTimeout(() => {
          loading.innerText = "Loading..";
          setTimeout(() => {
            loading.innerText = "Loading...";
            loadingAnimation(loading);
          }, 250)
        }, 250)
      }, 250);    
    }, 250);    
  } 
}


function takeScreenshot(wrapper) { 
  const animeTitle = (wrapper.querySelector('h4').innerText).replace(/[\/\\:*?"<>|;,#\[\](){}^~+%'\0\r\n\t]/g, ' ');   
   
  wrapper.style.backgroundColor = "#111111";
  wrapper.style.borderRadius = "0px";
  html2canvas(wrapper, {
      allowTaint: true,
      useCORS: true,       
      windowWidth: '393px',
      x: -0.55,              
      y: -0.27,
      scale: 2.5
  }).then(canvas => {        
      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = `${animeTitle}.png`; 
      downloadLink.click();       
  }).catch(error => {
      console.error('Error capturing screenshot:', error);
  });
  wrapper.style.backgroundColor = "#1f232d";
}


async function getAnimeList(endPoint) {  
  const jikanAPI_URL = 'https://api.jikan.moe/v4';
  search_result.innerHTML = `<span id="loading"></span> 
                             <span id="error"></span>
                             <span id="animeListCount"></span>`;
  const animeListCount = document.getElementById("animeListCount");
  const loading = document.getElementById("loading");
  const errorDisplay = document.getElementById("error");
  const queryValue = (query.value.trim() == "") ? endPoint = 'topAnime' : query.value.trim();
  
  const animeSearch = `${jikanAPI_URL}/anime?q=${encodeURIComponent(queryValue)}&sfw=${sfw}`;
  let url;

  switch(endPoint) {
    case 'topAnime': 
      url = `${jikanAPI_URL}/top/anime?sfw=${sfw}`; 
      break;
    default: 
      url = animeSearch;
  }

  try {
    errorDisplay.style.display = "none";
    loading.style.display = "block";
    loadingAnimation(loading);
    const response = await fetch(url);
    const data = await response.json();
    const dataLength = data.pagination.items.count;    
    loading.style.display = "none";    

    if(dataLength > 0) {      
      animeListCount.innerText = `Showing ${dataLength} results: `;
      for(let i = 0; i < dataLength; i++) {
        const animeData = data.data[i];      
        const genresList = animeData.genres.map(genre => genre.name).join(' / ');   
        const animeImageURL = animeData.images.jpg.image_url;   
        const animeTitle = animeData.title_english || animeData.title;

        search_result.innerHTML += `
          <div id="${i}" class="card-wrapper" onclick="takeScreenshot(this)">
            <img src="${animeImageURL}" alt="Anime Poster">
            <div class="card-data">
                <h4>${animeTitle}</h4> 
                <h5>Genres: <span class="sub-data">${genresList}</span></h5>
                <h5>Episodes: <span class="sub-data">${animeData.episodes}</span></h5>    
                <h5>Date: <span class="sub-data">${animeData.aired.string}</span></h5> 
                <h5>Status: <span class="sub-data">${animeData.status}</span></h5>          
            </div>
          </div>          
        `;                   
      }
    } else {
      animeListCount.innerText = "Showing 0 results: ";
    }
  } catch(error) {    
    loading.style.display = "none";
    errorDisplay.style.display = "block";
    errorDisplay.innerText = error.message;
    console.log(error.message);
  } 
}

getAnimeList('topAnime');




