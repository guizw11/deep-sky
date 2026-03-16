const API_KEY = "DEMO_KEY";

const image = document.getElementById("photo");
const loading = document.getElementById("loading");
const informations_box = document.getElementById("informations");
const photo_date = document.getElementById("photo_date");
const copyright = document.getElementById("copyright");
const error_message = document.getElementById("error_message");
const title = document.getElementById("title");
const user_date = document.getElementById("date");
const message = document.getElementById("message");
const favorites = document.getElementById("favorites");
const cards = document.getElementById("cards");
const success = document.getElementById("success");
if (message && favorites) {
  message.style.display = "none";
  favorites.style.display = "none";
}

let imageInfos;

function clearView() {
  if (informations_box) informations_box.style.display = "none";
  if (error_message) error_message.style.display = "none";
  if (loading) loading.style.display = "none";
  if (success) success.style.display = "none";
}

function randomDate() {
  const start = new Date("1995-06-16");
  const today = new Date();
  const randomTime = start.getTime() + Math.random() * (today.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split("T")[0];
}

clearView();

let isLoading = false;

async function callApi(url) {
  try {
    if (isLoading) return;
    isLoading = true;
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) throw new Error("Limite de requisições atingido.");
      if (response.status === 400) throw new Error("Data inválida.");
      if (response.status === 500) throw new Error("Imagem indisponível, tente outra data!")
      throw new Error("Houve um erro: " + response.status);
    }
    
    const data = await response.json();
    
    image.src = data.url;
    image.alt = data.copyright || "NASA";
    title.textContent = data.title;
    copyright.textContent = "© " + (data.copyright || "NASA");
    
    imageInfos = {
      image: data.url,
      imageAlt: data.copyright || "NASA",
      title: data.title,
      copyright: "© " + (data.copyright || "NASA"),
      date: data.date
    };
    
    const photo_date_formatted = new Date(data.date + "T00:00:00").toLocaleDateString("pt-BR");
    photo_date.textContent = photo_date_formatted;
  
    image.onload = () => {
      informations_box.style.display = "block";
      loading.style.display = "none";
      isLoading = false;
    };
    
    image.onerror = () => {
      if (error_message) {
        error_message.textContent = "Erro ao carregar imagem.";
        error_message.style.display = "block";
      }
      if (loading) loading.style.display = "none";
      isLoading = false;
    };
    
  } catch(error) {
    if (error_message) {
      error_message.textContent = error.message === "Failed to fetch" 
        ? "Sem conexão com a internet." 
        : error.message;
      error_message.style.display = "block";
    }
    if (loading) loading.style.display = "none";
    isLoading = false;
  }
}

function loadToday() {
  clearView();
  if (loading) loading.style.display = "block";
  callApi(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
}

function loadRandom() {
  clearView();
  if (loading) loading.style.display = "block";
  callApi(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${randomDate()}`);
}

if (user_date) {
  user_date.addEventListener("change", () => {
    const input = user_date.value;
    clearView();
    if (loading) loading.style.display = "block";
    callApi(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${input}`);
  });
}

function favorite() {
  if (!imageInfos) {
    if (error_message) {
      error_message.textContent = "Nenhuma imagem carregada para favoritar.";
      error_message.style.display = "block";
    }
    return;
  }

  try {
    let favoritesArray = JSON.parse(localStorage.getItem("favorites")) || [];
    
    const exists = favoritesArray.some(fav => fav.image === imageInfos.image);
    if (exists) {
      if (error_message) {
        error_message.textContent = "Imagem já está nos favoritos!";
        error_message.style.display = "block";
      }
      return;
    }
    
    favoritesArray.push(imageInfos);
    localStorage.setItem("favorites", JSON.stringify(favoritesArray));
    
    if (error_message) {
      error_message.style.display = "none";
    }
    
    success.style.display = "block";
  } catch {
    if (error_message) {
      error_message.textContent = "Erro ao favoritar a imagem!";
      error_message.style.display = "block";
    }
  }
}

function viewFavorites() {
  if (!cards) return;

  try {
    const favoritesArray = JSON.parse(localStorage.getItem("favorites")) || [];
    
    if (favoritesArray.length === 0) {
      cards.innerHTML = "<p class='col-span-full text-center text-gray-400 py-8'>Nenhum favorito ainda</p>";
      if (message) message.style.display = "block";
      return;
    }
    
    if (favorites) favorites.style.display = "grid";
    cards.innerHTML = "";
    
    favoritesArray.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "bg-gradient-to-b from-blue to-gray-900 backdrop-blur-md bg-black/40 rounded-xl border-2 border-slate-950 overflow-hidden hover:scale-105 transition duration-300";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.imageAlt}" class="rounded-t-xl w-full aspect-video object-cover">
        <div class="p-3 md:p-4">
          <h2 class="font-funnel text-center text-lg text-gray-100 font-bold mb-2">${item.title}</h2>
          <p class="font-lato text-center text-gray-300 text-xs mb-3">${item.date || 'Data não disponível'}</p>
          <p class="font-lato text-center text-gray-200 text-xs mb-3 line-clamp-2">${item.copyright}</p>
          <button class="remove-favorite-btn w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition duration-300" data-index="${index}">Remover</button>
        </div>
      `;
      cards.appendChild(card);
    });
    
    document.querySelectorAll(".remove-favorite-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        removeFavorite(parseInt(e.target.dataset.index));
      });
    });
    
  } catch {
    if (error_message) {
      error_message.textContent = "Erro ao carregar favoritos!";
      error_message.style.display = "block";
    }
  }
}

function removeFavorite(index) {
  try {
    let favoritesArray = JSON.parse(localStorage.getItem("favorites")) || [];
    favoritesArray.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favoritesArray));
    viewFavorites();
  } catch {
    if (error_message) {
      error_message.textContent = "Erro ao remover favorito!";
      error_message.style.display = "block";
    }
  }
}

