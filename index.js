const jikanAPI_URL = 'https://api.jikan.moe/v4';  

const query = document.getElementById("query");
const input_symbol_container = document.querySelector("#input-symbol-container");

const search_symbol = document.querySelector("#search-symbol");
const close_symbol = document.querySelector("#close-symbol");

const loading = document.getElementById("loading");
const errorDisplay = document.getElementById("error");  
const animeListCount = document.getElementById("animeListCount");

let search_result = document.getElementById("search-result");
let fetchAbortController = null;
let sfw = 1;

/*################### Filter Button Code ###################*/

const filter_button = document.querySelector("#filter-button");
const filter_apply_button = document.querySelector("#filter-apply-button");
const filter_container = document.querySelector("#filter-container");
const filter_container_selectTags = document.querySelectorAll("select");

const type_select = document.querySelector("#type");
const status_select = document.querySelector("#status");
const score_select = document.querySelector("#score");
const rating_select = document.querySelector("#rating");

const start_year = document.querySelector("#start-year");
const start_month = document.querySelector("#start-month");
const start_day = document.querySelector("#start-day");

const end_year = document.querySelector("#end-year");
const end_month = document.querySelector("#end-month");
const end_day = document.querySelector("#end-day");

let genresSelectedArray = [];
const genre_buttons_container = document.querySelector("#genre-buttons-container");  
let allGenreButtons;
const error_genre_display = document.querySelector("#error-genre-display");

let filter_enable_status = false;

// Clears Filter data on load with a 1500ms delay 
window.addEventListener('load', function() {
  setTimeout(clearFilterSelection, 1500);
});


function manageDateFilterPrecedence(selectTag) {   
  // Corrects the start and end date precedence dynamically
  if(start_year.value != "" && end_year.value != "") {
    if(Number(start_year.value) > Number(end_year.value)) {      
      end_year.value = start_year.value;
    }
  }

  if(start_month.value != "" && end_month.value != "" && start_year.value == end_year.value) {
    if(Number(start_month.value) > Number(end_month.value)) {      
      end_month.value = start_month.value;
    }
  }

  if(start_day.value != "" && end_day.value != "" && 
    start_year.value == end_year.value && 
    start_month.value == end_month.value) {
    if(Number(start_day.value) > Number(end_day.value)) {      
      end_day.value = start_day.value;
    }
  }
  
  // Enables or Disables the tags based date precedence
  if(selectTag == start_year && selectTag.style.color == "orange") {
    start_month.disabled = false;
  } else if (selectTag == start_year) {
    start_month.value = "";
    changeColorAfterSelection(start_month);
    start_month.disabled = true;
    
    start_day.value = "";
    changeColorAfterSelection(start_day);
    start_day.disabled = true;
  }
  
  if(selectTag == start_month && selectTag.style.color == "orange") {
    start_day.disabled = false;
  } else if (selectTag == start_month) {
    start_day.value = "";
    changeColorAfterSelection(start_day);
    start_day.disabled = true;
  }
  
  if(selectTag == end_year && selectTag.style.color == "orange") {
    end_month.disabled = false;
  } else if (selectTag == end_year) {
    end_month.value = "";
    changeColorAfterSelection(end_month);
    end_month.disabled = true;
    
    end_day.value = "";
    changeColorAfterSelection(end_day);
    end_day.disabled = true;
  }
  
  if(selectTag == end_month && selectTag.style.color == "orange") {
    end_day.disabled = false;
  } else if (selectTag == end_month) {
    end_day.value = "";
    changeColorAfterSelection(end_day);
    end_day.disabled = true;
  }
}


function isFilterApplied() {
  if(type_select.value != "" || status_select.value != "" || score_select.value != "" ||
    rating_select.value != "" || start_year.value != "" || start_month.value != "" ||
    start_day.value != "" || end_year.value != "" || end_month.value != "" ||
    end_day.value != "" || genresSelectedArray.length != 0) {
      return true;
  }
}


filter_container_selectTags.forEach(selectTag => {
  selectTag.addEventListener('change', function() {
    changeColorAfterSelection(this);
    manageDateFilterPrecedence(this);
  });
});


function showFilterOptions() {
  if(filter_enable_status == false) {
    filter_container.style.display = "block";        
    filter_button.style.backgroundColor = "#ffa600";      
    fetchAndDisplayGenreButtons();
    filter_enable_status = true;
  } else {
    if(isFilterApplied()) {      
      filter_button.style.backgroundColor = "#ffa600";  
    } else {
      filter_button.style.backgroundColor = "#00eeff";  
    }
    
    filter_container.style.display = "none";
    filter_enable_status = false;
  }
}


function clearFilterSelection() {
  filter_container_selectTags.forEach(selectTag => {
    selectTag.value = "";
    changeColorAfterSelection(selectTag);
    manageDateFilterPrecedence(selectTag);
  });
  
  genresSelectedArray.length = 0;   
  if(allGenreButtons) {
    allGenreButtons.forEach(buttonTag => { 
      changeGenreButtonColor(buttonTag, true);
    });  
  }
}


function updateGenresSelectedArray(value) {
  const index = genresSelectedArray.indexOf(value);

  if (index === -1) {    
    genresSelectedArray.push(value);
  } else {    
    genresSelectedArray.splice(index, 1);
  }
}


function changeColorAfterSelection(selectTagObject) {
  if(selectTagObject.value == "") {
    selectTagObject.style.color = "#03ffdd";
    selectTagObject.style.border = "1px solid #00eeff";  
    selectTagObject.style.backgroundColor = "#13171d";
    return;
  }

  selectTagObject.style.color = "orange";
  selectTagObject.style.border = "1px solid orange";  
  selectTagObject.style.backgroundColor = "#1d1713";
}


function populateYearDropdown(yearSelect) {     
  if(yearSelect.querySelectorAll('option').length > 1) {
    return;
  }

  const currentYear = new Date().getFullYear();      
  for (let year = currentYear; year >= 1907; year--) {
    const option = document.createElement('option');
    option.value = year;     
    option.textContent = year;    
    yearSelect.appendChild(option);
  }
}


function populateMonthDropdown(monthSelect) {   
  if(monthSelect.querySelectorAll('option').length > 1) {
    return;
  }

  for (let month = 1; month <= 12; month++) {
    const option = document.createElement('option');
    option.value = month;     
    option.textContent = month;
    monthSelect.appendChild(option);
  }
}


function populateDayDropdown(daySelect) {
  if(daySelect.querySelectorAll('option').length > 1) {
    return;
  }

  for (let day = 1; day <= 31; day++) {
    const option = document.createElement('option');
    option.value = day;     
    option.textContent = day;
    daySelect.appendChild(option);
  }
}


function changeGenreButtonColor(genreButton, changeToDefault = false) {  
  if(genreButton.style.color == "orange" || changeToDefault) {
    genreButton.style.color = "#03ffdd";
    genreButton.style.border = "1px solid #00eeff";  
    genreButton.style.backgroundColor = "#13171d";  
  } else {
    genreButton.style.color = "orange";
    genreButton.style.border = "1px solid orange";  
    genreButton.style.backgroundColor = "#1d1713";
  }
}


async function fetchAndDisplayGenreButtons() {  
  if(genre_buttons_container.querySelectorAll('button').length != 0) {
    return;
  }
  
  error_genre_display.innerHTML = "";
  let url = `${jikanAPI_URL}/genres/anime`;    
  try {
    const response = await fetch(url);    
    const data = await response.json();
    
    const sortedGenres = data.data.sort((a, b) => a.mal_id - b.mal_id);

    sortedGenres.forEach(genre => {
      const button = document.createElement('button');
      button.className = 'genre-button';
      button.textContent = genre.name;
      button.value = genre.mal_id;   
      button.addEventListener('click', function() {  
        updateGenresSelectedArray(this.value);
        changeGenreButtonColor(this);
      });

      genre_buttons_container.appendChild(button);
    });

    allGenreButtons = genre_buttons_container.querySelectorAll('button');
  } catch(error) {        
    error_genre_display.innerHTML = `${error.message} genres!`;
  }
}

/*##########################################################*/



/*################# Screenshot Button Code #################*/

// Toggles between watch order and screenshot button
function screenshot_Button_Toggle(callingButton, otherButton) {
  callingButton.style.display = "none";  
  otherButton.style.display = "block";
  (sessionStorage.getItem("currentScreenshotButtonStatus") == "screenshot") ? sessionStorage.setItem("currentScreenshotButtonStatus", "watch-order") : sessionStorage.setItem("currentScreenshotButtonStatus", "screenshot");
}


// Takes screenshot of Anime Card and save it with the Anime name as a PNG image file
function takeScreenshot(wrapper, imgContainer, img) { 
  if(sessionStorage.getItem("currentScreenshotButtonStatus") != "screenshot") {
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

/*##########################################################*/


// Disables autocomplete on query input tag for Windows and Linux (Desktop)
(/Windows/i.test(navigator.userAgent) || (/Linux/i.test(navigator.userAgent) && !/Android/i.test(navigator.userAgent))) ? query.setAttribute('autocomplete', 'off') : null;


// Loads the appropriate button based on session data, if null then watch-order gets loaded as default
window.addEventListener("load", () => {
  if(sessionStorage.getItem("currentScreenshotButtonStatus") == "screenshot") {
    document.querySelector("#screenshot-button").style.display = "block";
  } else if (sessionStorage.getItem("currentScreenshotButtonStatus") == "watch-order") {
    document.querySelector("#watch-order-button").style.display = "block";    
  } else {
    sessionStorage.setItem("currentScreenshotButtonStatus", "watch-order");
    document.querySelector("#watch-order-button").style.display = "block";   
  }
});  


// Restarts the fetch when online, if the device was offline during fetch 
let wasOffline = false;
function refresh_Search_When_Online() {
  if (!navigator.onLine) {
    wasOffline = true;
    return;
  } 
  
  if(wasOffline) {
    displayAnimeList('getQueryAnimeList');
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
      displayAnimeList('getQueryAnimeList');  
    }
  }, 1000);

  // Changes the symbol next to query input tag, based on if input value is empty or not
  if(symbolState == "clear" && query.value.trim() == '') {
    input_symbol_container.style.transition = "all 0s ease-in-out";  
    close_symbol.style.display = "none";  
    search_symbol.style.display = "block";
    search_symbol.style.fill = "rgba(0, 0, 0, 0)";        

    input_symbol_container.onclick = () => { displayAnimeList('getQueryAnimeList') };
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
    displayAnimeList('getQueryAnimeList');      
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
  displayAnimeList('getQueryAnimeList');
}


// Loading Animation
function loadingAnimation() {  
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


function showError(error) {
  animeListCount.innerText = "";    
  loading.style.display = "none";
  errorDisplay.style.display = "block";
  errorDisplay.innerHTML = `${error.message}!`;  
}


function showLoading(enable_boolean) {
  animeListCount.innerText = "";     
  errorDisplay.style.display = "none";  

  if(enable_boolean == false) {
    loading.style.display = "none";
  } else {
    loading.style.display = "block";
    loadingAnimation();
  }
}


function showAnimeListCount(dataLength) {
  loading.style.display = "none"; 
  errorDisplay.style.display = "none"; 
  animeListCount.innerText = `Showing ${dataLength} results: `;
}


function clearSearchResults() {
  search_result.innerHTML = "";
}



/*############ Fetch and Display AnimeList Code ############*/

async function getQueryAnimeList() {
  if (fetchAbortController) {
    fetchAbortController.abort();    
  }
  fetchAbortController = new AbortController();
  const signal = fetchAbortController.signal;

  search_result.innerHTML = "";
  let url = `${jikanAPI_URL}/anime?q=${encodeURIComponent(query.value.trim())}&sfw=${sfw}`;

  const response = await fetch(url, {signal});    
  const data = await response.json();
  return data;
}


async function getTopAnimeList() {
  if (fetchAbortController) {
    fetchAbortController.abort();    
  }
  fetchAbortController = new AbortController();
  const signal = fetchAbortController.signal;

  search_result.innerHTML = "";
  let url = `${jikanAPI_URL}/top/anime?sfw=${sfw}`;
  
  const response = await fetch(url, {signal});    
  const data = await response.json();
  return data;
}


async function getAnimeListByQueryWithFilter() {
  if (fetchAbortController) {
    fetchAbortController.abort();    
  }
  fetchAbortController = new AbortController();
  const signal = fetchAbortController.signal;

  search_result.innerHTML = "";

  let startDate = ""; 
  let endDate = "";

  if(start_year.value != "") {
    if(start_month.value != "" && start_day.value != "") {
      startDate = `${start_year.value}-${start_month.value}-${start_day.value}`;
    } else if(start_month.value != "") {
      startDate = `${start_year.value}-${start_month.value}`;
    } else {
      startDate = `${start_year.value}`;
    }
  }

  if(end_year.value != "") {
    if(end_month.value != "" && end_day.value != "") {
      endDate = `${end_year.value}-${end_month.value}-${end_day.value}`;
    } else if(end_month.value != "") {
      endDate = `${end_year.value}-${end_month.value}`;
    } else {
      endDate = `${end_year.value}`;
    }
  }

  //let url = `${jikanAPI_URL}/anime?q=${encodeURIComponent(query.value.trim())}&sfw=${sfw}&type=${type_select.value}&score=${score_select.value}&status=${score_select.value}&rating=${rating_select.value}&start_date=${startDate}&end_date=${endDate}`;
  let url = `${jikanAPI_URL}/anime?rating=${rating_select.value}&status=${score_select.value}&genres=${genresSelectedArray}&q=${encodeURIComponent(query.value.trim())}`;

  const response = await fetch(url, {signal});    
  const data = await response.json();  
  return data;
}


async function displayAnimeList(fetch_option) {
  try {    
    let fetched_data = null;
    showLoading(true);
    clearSearchResults();
   
    switch(fetch_option) {
      case 'getTopAnimeList':
        fetched_data = await getTopAnimeList();
        break;
      case 'getQueryAnimeList':
        (query.value.trim() == "") ? fetched_data = await getTopAnimeList() : fetched_data = await getQueryAnimeList();
        break;        
      case 'getAnimeListByGenres':
        fetched_data = await getAnimeListByGenres();
        break;
      case 'getAnimeListByQueryWithFilter':
        fetched_data = await getAnimeListByQueryWithFilter();
        break;
    }

    showLoading(false);
    const dataLength = fetched_data.data.length;      
    showAnimeListCount(dataLength);

    if(dataLength > 0) {            
      for(let i = 0; i < dataLength; i++) {
        const animeData = fetched_data.data[i];      
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
    } 
  } catch(error) {    
    showError(error);
  } 
}

displayAnimeList('getTopAnimeList');

/*##########################################################*/