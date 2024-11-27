const query = document.getElementById("query");
const input_symbol = document.querySelector("#input-symbol");
const searchFontLink = document.querySelector("#searchFont");
const clearFontLink = document.querySelector("#clearFont");
let search_result = document.getElementById("search-result");
let sfw = 1;

query.addEventListener("keydown", (event) => {
  if(event.key == "Enter") {    
    getAnimeList('default');      
  }
});


let wasOffline = false;
function refresh_Search_When_Online() {
  if (!navigator.onLine) {
    wasOffline = true;
    return;
  } 
  
  if(wasOffline) {
    getAnimeList('default');
    wasOffline = false;
  }
}

setInterval(refresh_Search_When_Online, 3000);


let typingTimeout;
let prevQueryString;
let symbolState = "search";
query.addEventListener("input", () => {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {  
    if(prevQueryString != query.value.trim() && query.value.trim() != '') {
      prevQueryString = query.value.trim();
      getAnimeList('default');  
    }
  }, 1000);

  //Changing the symbol based on input value and currently active symbol
  if(symbolState == "clear" && query.value.trim() == '') {
    input_symbol.style.transition = "all 0s ease-in-out";
    input_symbol.style.color = "rgba(0, 0, 0, 0)";    

    clearFontLink.disabled= true;
    searchFontLink.disabled= false;
    input_symbol.innerText = "search";
    input_symbol.onclick = () => { getAnimeList('default') };
    symbolState = "search";        
        
    setTimeout(() => {
      input_symbol.style.color = "rgb(137, 245, 242)";    
      input_symbol.style.transition = "all 0.15s ease-in-out";  
    }, 100);    

  } else if(symbolState == "search" && query.value.trim() != '') {
    input_symbol.style.transition = "all 0s ease-in-out";
    input_symbol.style.color = "rgba(0, 0, 0, 0)";
    
    searchFontLink.disabled= true;
    clearFontLink.disabled= false;
    input_symbol.innerText = "close";    
    input_symbol.onclick = clearInput;
    symbolState = "clear";
        
    setTimeout(() => {
      input_symbol.style.color = "rgb(137, 245, 242)";   
      input_symbol.style.transition = "all 0.15s ease-in-out";   
    }, 100);    
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
  input_symbol.style.color = "#006381";   
});

query.addEventListener("focus", () => {
  query.style.backgroundColor = "#253947";  
  input_symbol.style.backgroundColor = "#253947";  
  input_symbol.style.color = "rgb(137, 245, 242)";  
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
  getAnimeList('default');
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


function takeScreenshot(wrapper, imgContainer, img) { 
  const animeTitle = (wrapper.querySelector('h4').innerText).replace(/[\/\\:*?"<>|]/g, '');

  imgContainer.style.height = "130px";
  imgContainer.style.minWidth = "88px";
  imgContainer.style.maxWidth = "88px";

  img.style.height = "130px";
  img.style.minWidth = "88px";
  img.style.maxWidth = "88px";
     
  wrapper.style.paddingLeft = "7px";
  wrapper.style.border = "3px solid white";    
  setTimeout(() => {
    wrapper.style.border = "3px solid transparent";  
  }, 2000);

  wrapper.style.backgroundColor = "#111111";
  wrapper.style.borderRadius = "10px";  
  html2canvas(wrapper, {
      allowTaint: true,
      useCORS: true,       
      windowWidth: '440px',
      x: 0.15,              
      y: -0.2,
      scale: 5
  }).then(canvas => {        
      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = `${animeTitle}.png`; 
      downloadLink.click();       
  }).catch(error => {
      console.error('Error capturing screenshot:', error);
  });

  imgContainer.style.height = "115px";
  imgContainer.style.minWidth = "78px";
  imgContainer.style.maxWidth = "78px";

  img.style.height = "115px";
  img.style.minWidth = "78px";
  img.style.maxWidth = "78px";

  wrapper.style.paddingLeft = "0px";
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
  const animeSearch = `${jikanAPI_URL}/anime?q=${encodeURIComponent(query.value.trim())}&sfw=${sfw}`;
  let url;
  
  (query.value.trim() == "") ? endPoint = 'topAnime' : null;
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
          <div id="${i}" class="card-wrapper" onclick="takeScreenshot(this, this.querySelector('.image-container') ,this.querySelector('img'))" tabindex="0">
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
                <h5><b>Score:</b> <span class="sub-data">${animeData.score} - <span class="scored-by">[ by ${Number(animeData.scored_by).toLocaleString()} people ]</span></span></h5>          
            </div>
          </div>          
        `;      
        
        
        if(animeData.rating == "R+ - Mild Nudity" || animeData.rating == "Rx - Hentai") {
          document.getElementsByClassName("restricted-18")[i].style.display = "block";
        }
      }
    } else {
      animeListCount.innerText = "Showing 0 results: ";
    }
  } catch(error) {    
    loading.style.display = "none";
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = `${error.message}!`;
    console.log(error.message);
  } 
}

getAnimeList('topAnime');