const query = document.getElementById("query");
const input_symbol_container = document.querySelector("#input-symbol-container");
const search_symbol = document.querySelector("#search-symbol");
const close_symbol = document.querySelector("#close-symbol");
const loading = document.getElementById("loading");
const errorDisplay = document.getElementById("error");  
const animeListCount = document.getElementById("animeListCount");
let search_result = document.getElementById("search-result");
let currentScreenshotButtonStatus = "screenshot";
let sfw = 1;

// Disables autocomplete on query input tag for Windows and Linux (Desktop)
(/Windows/i.test(navigator.userAgent) || (/Linux/i.test(navigator.userAgent) && !/Android/i.test(navigator.userAgent))) ? query.setAttribute('autocomplete', 'off') : null;


// Toggles between watch order and screenshot button
function screenshot_Button_Toggle(callingButton, otherButton) {
  callingButton.style.display = "none";  
  otherButton.style.display = "block";
  (currentScreenshotButtonStatus == "screenshot") ? currentScreenshotButtonStatus = "watch-order" : currentScreenshotButtonStatus = "screenshot";
}


// Restarts the fetch when online, if the device was offline during fetch 
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


// Triggers fetch after 1s if user inputs a value
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

  // Changes the symbol next to query input tag, based on if input value is empty or not
  if(symbolState == "clear" && query.value.trim() == '') {
    input_symbol_container.style.transition = "all 0s ease-in-out";  
    close_symbol.style.display = "none";  
    search_symbol.style.display = "block";
    search_symbol.style.fill = "rgba(0, 0, 0, 0)";        

    input_symbol_container.onclick = () => { getAnimeList('default') };
    symbolState = "search";        
        
    setTimeout(() => {        
      search_symbol.style.fill = "rgb(137, 245, 242)";    
      input_symbol_container.style.transition = "all 0.15s ease-in-out";  
    }, 100);    

  } else if(symbolState == "search" && query.value.trim() != '') {
    input_symbol_container.style.transition = "all 0s ease-in-out";    
    search_symbol.style.display = "none";      
    close_symbol.style.display = "block";  
    close_symbol.style.fill = "rgba(0, 0, 0, 0)";
    input_symbol_container.onclick = clearInput;
    symbolState = "clear";
        
    setTimeout(() => {      
      close_symbol.style.fill = "rgb(137, 245, 242)";  
      input_symbol_container.style.transition = "all 0.15s ease-in-out";   
    }, 100);    
  }
});


// Triggers fetch on 'Enter' key
query.addEventListener("keydown", (event) => {
  if(event.key == "Enter") {  
    clearTimeout(typingTimeout);
    query.blur();
    getAnimeList('default');      
  }
});


// Clears input value
function clearInput() {  
  query.focus();
  query.value = "";
  const event = new Event("input"); 
  query.dispatchEvent(event); 

  query.style.backgroundColor = "#006381";
  input_symbol_container.style.backgroundColor = "#006381";
  setTimeout(() => {
    query.style.backgroundColor = "#253947";
    input_symbol_container.style.backgroundColor = "#253947";
  }, 500);
}

// Changes colors of input on blur
query.addEventListener("blur", () => {
  query.style.backgroundColor = "white";  
  input_symbol_container.style.backgroundColor = "white";    
  close_symbol.style.fill = "#006381"; 
  search_symbol.style.fill = "#006381"; 
});

// Changes colors of input on focus
query.addEventListener("focus", () => {
  query.style.backgroundColor = "#253947";  
  input_symbol_container.style.backgroundColor = "#253947";    
  close_symbol.style.fill = "rgb(137, 245, 242)";
  search_symbol.style.fill = "rgb(137, 245, 242)";
});


// Toggles between SFW and NSFW and triggers fetch after each toggle
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


// Loading Animation
function loadingAnimation(loading) {  
  const texts = ["Loading", "Loading.", "Loading..", "Loading..."];
  let index = 0;

  function animate() {
    if (getComputedStyle(loading).display === "block") {
      loading.innerText = texts[index];
      index = (index + 1) % texts.length; 
      setTimeout(animate, 250); 
    }
  }

  animate(); 
}


// Takes screenshot of Anime Card and save it with the Anime name as a PNG image file
function takeScreenshot(wrapper, imgContainer, img, currentScreenshotButtonStatus) { 
  if(currentScreenshotButtonStatus != "screenshot") {
    return;
  }

  const animeTitle = (wrapper.querySelector('h4').innerText)
  .replace(/[\/\\:*?"<>|]/g, '') // Replaces illegal file name characters
  .normalize("NFD") // Normalizes the string to decompose diacritical marks
  .replace(/[\u0300-\u036f]/g, "") // Removes diacritical marks
  .replace(/\s{2,}/g, " ") // Replaces multiple spaces with a single space
  .trim(); 

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

  // Draws Element Node to canvas
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


// Fetches the anime data using Jikan API
let currentController = null;
async function getAnimeList(endPoint) {    
  if (currentController) {
    currentController.abort();    
  }
  currentController = new AbortController();
  const signal = currentController.signal;

  const jikanAPI_URL = 'https://api.jikan.moe/v4';  
  const animeSearch = `${jikanAPI_URL}/anime?q=${encodeURIComponent(query.value.trim())}&sfw=${sfw}`;
  search_result.innerHTML = "";
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
    animeListCount.innerText = "";     
    errorDisplay.style.display = "none";
    loading.style.display = "block";
    loadingAnimation(loading);

    const response = await fetch(url, {signal});    
    const data = await response.json();
    const dataLength = data.pagination.items.count;    
    loading.style.display = "none";    

    if(dataLength > 0) {          
      errorDisplay.style.display = "none";  
      animeListCount.innerText = `Showing ${dataLength} results: `;
      for(let i = 0; i < dataLength; i++) {
        const animeData = data.data[i];      
        const genresList = animeData.genres.map(genre => genre.name).join(' / ');   
        const animeImageURL = animeData.images.jpg.large_image_url;   
        const animeTitle = animeData.title_english || animeData.title;                        

        search_result.innerHTML += `
          <div id="${i}" class="card-wrapper" onclick="takeScreenshot(this, this.querySelector('.image-container') ,this.querySelector('img'), currentScreenshotButtonStatus)" tabindex="0">
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
    animeListCount.innerText = "";    
    loading.style.display = "none";
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = `${error.message}!`;    
  } 
}

getAnimeList('topAnime');