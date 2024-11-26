const query = document.getElementById("query");
const input_symbol = document.querySelector("#input-symbol");
const searchFontLink = document.querySelector("#searchFont");
const clearFontLink = document.querySelector("#clearFont");
let search_result = document.getElementById("search-result");
let sfw = 1;


query.addEventListener("keydown", (event) => {
  if(event.key == "Enter") {    
    getAnimeList(null);      
  }
});


let typingTimeout;
let prevQueryString;
let symbolState = "search";
query.addEventListener("input", () => {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {  
    if(prevQueryString != query.value.trim() && query.value.trim() != '') {
      prevQueryString = query.value.trim();
      getAnimeList(null);  
    }
  }, 1000);

  if(symbolState == "clear" && query.value.trim() == '') {
    input_symbol.innerText = "search";
    input_symbol.style.display = "none";
    clearFontLink.disabled= true;
    searchFontLink.disabled= false;
    input_symbol.onclick = () => { getAnimeList(null) };

    symbolState = "search";
    input_symbol.style.display = "block";

  } else if(symbolState == "search" && query.value.trim() != '') {
    input_symbol.innerText = "close";
    input_symbol.style.display = "none";
    searchFontLink.disabled= true;
    clearFontLink.disabled= false;
    input_symbol.onclick = clearInput;

    symbolState = "clear";
    input_symbol.style.display = "block";
  }
});


function clearInput() {  
  query.focus();
  query.value = "";
  const event = new Event("input"); 
  query.dispatchEvent(event); 

  query.style.backgroundColor = "#006381";
  input_symbol.style.backgroundColor = "#006381";
  setTimeout(() => {
    query.style.backgroundColor = "#253947";
    input_symbol.style.backgroundColor = "#253947";
  }, 500);
}

query.addEventListener("blur", () => {
  query.style.backgroundColor = "white";  
  input_symbol.style.backgroundColor = "white";  
});

query.addEventListener("focus", () => {
  query.style.backgroundColor = "#253947";  
  input_symbol.style.backgroundColor = "#253947";  
});


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
  getAnimeList(null);
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
  const animeTitle = (wrapper.querySelector('h4').innerText).replace(/[\/\\:*?"<>|]/g, '');
   
  wrapper.style.border = "2px solid white";    
  setTimeout(() => {
    wrapper.style.border = "2px solid transparent";  
  }, 2000);

  wrapper.style.backgroundColor = "#111111";
  wrapper.style.borderRadius = "10px";  
  html2canvas(wrapper, {
      allowTaint: true,
      useCORS: true,       
      windowWidth: '400px',
      x: 0.2,              
      y: -0.2,
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
  wrapper.style.borderRadius = "5px";  
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
        const animeImageURL = animeData.images.jpg.large_image_url;   
        const animeTitle = animeData.title_english || animeData.title;
        
        search_result.innerHTML += `
          <div id="${i}" class="card-wrapper" onclick="takeScreenshot(this)" tabindex="0">
            <div class="image-container">
              <span class="restricted-18">18+</span>
              <img src="${animeImageURL}" alt="Anime Poster">
            </div>
            <div class="card-data">
                <h4>${animeTitle}</h4> 
                <h5><b>Genres:</b> <span class="sub-data">${genresList}</span></h5>
                <h5><b>Episodes:</b> <span class="sub-data">${animeData.episodes} - <span class="episode-time">[ ${animeData.duration} ]</span></span></h5>    
                <h5><b>Date:</b> <span class="sub-data">${animeData.aired.string}</span></h5> 
                <h5><b>Status:</b> <span class="sub-data">${animeData.status}</span></h5>          
                <h5><b>Score:</b> <span class="sub-data">${animeData.score} - <span class="scored-by">[ by ${animeData.scored_by} people ]</span></span></h5>          
            </div>
          </div>          
        `;      
        
        
        if(animeData.rating == "R+ - Mild Nudity" || animeData.rating == "Rx - Hentai") {
          const rating = document.getElementsByClassName("restricted-18")[i].style.display = "block";
        }
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