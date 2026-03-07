const API_KEY = "DEMO_KEY";

const image = document.getElementById("photo");
const loading = document.getElementById("loading");
const informations_box = document.getElementById("informations");
const photo_date = document.getElementById("photo_date");
const copyright = document.getElementById("copyright");
const error_message = document.getElementById("error_message");
const title = document.getElementById("title");

const user_date = document.getElementById("date");

function clearView() {
  informations_box.style.display = "none";
  error_message.style.display = "none";
  loading.style.display = "none";
}

function randomDate() {
  const start = new Date("1995-06-16");
  const today = new Date();
    
  const randomTime = start.getTime() + Math.random() * (today.getTime() - start.getTime());
  const randomDate = new Date(randomTime).toISOString().split("T")[0];
  return randomDate;
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
      throw new Error("Houve um erro: " + response.status);
    }
    const data = await response.json();
    
    image.src = data.url;
    image.alt = data.copyright || "NASA";
    title.textContent = data.title;
    copyright.textContent = "© " + (data.copyright || "NASA");
    
    const photo_date_formatted = new Date(data.date + "T00:00:00").toLocaleDateString("pt-BR");
    photo_date.textContent = photo_date_formatted;
  
    image.onload = () => {
      informations_box.style.display = "block";
      loading.style.display = "none";
      isLoading = false;
    };
    
    image.onerror = () => {
      error_message.textContent = "Erro ao carregar imagem.";
      error_message.style.display = "block";
      loading.style.display = "none";
      isLoading = false;
    };
    
  } catch(error) {
      if (error.message === "Failed to fetch") {
          error_message.textContent = "Sem conexão com a internet.";
      } else {
        error_message.textContent = error.message;
      }
      loading.style.display = "none";
      error_message.style.display = "block";
      isLoading = false;
  }
}

function loadToday() {
  clearView();
  loading.style.display = "block";
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
  callApi(url);
}

function loadRandom() {
  clearView();
  loading.style.display = "block";
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${randomDate()}`;
  callApi(url);
}

user_date.addEventListener("change", async () => {
    const input = user_date.value;
    clearView();
    loading.style.display = "block";
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${input}`;
    callApi(url);
})