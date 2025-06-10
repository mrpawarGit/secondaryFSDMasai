const api = "https://rickandmortyapi.com/api/character";
let currentPage = api;

// fetch
async function fetchData(newUrl) {
  let res = await fetch(newUrl);
  let data = await res.json();

  dispData(data.results);

  // paginationData(data.info);
}

// display
function dispData(data) {
  let container = document.getElementById("charContainer");
  container.innerHTML = "";

  data.forEach((character) => {
    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${character.image}" alt="${character.image}">
      <h4>${character.name}</h4>
      <p>${character.species} - ${character.status}</p>
      <p>Location: ${character.location.name}</p>
    `;
    card.addEventListener("click", () => openCharacter(character));
    container.appendChild(card);
  });
}

// pagination
let pNO = 1;
document.getElementById("next-btn").addEventListener("click", () => {
  cPage = `https://rickandmortyapi.com/api/character?page=${++pNO}`;
  fetchData(cPage);
});
document.getElementById("prev-btn").addEventListener("click", () => {
  cPage = `https://rickandmortyapi.com/api/character?page=${--pNO}`;
  if (pNO <= 0) pNO = 1;
  fetchData(cPage);
});

fetchData(currentPage);

// search

let timeout;

document.getElementById("search").addEventListener("input", (e) => {
  clearTimeout(timeout);
  let name = e.target.value.toLowerCase();
  timeout = setTimeout(() => {
    let url = `${api}/?name=${name}`;
    fetchData(url);
  }, 300);
});

// filter
document
  .getElementById("statusFilter")
  .addEventListener("change", applyFilters);
document
  .getElementById("speciesFilter")
  .addEventListener("change", applyFilters);

function applyFilters() {
  pNO = 1;
  let name = document.getElementById("search").value.trim();
  let status = document.getElementById("statusFilter").value;
  let species = document.getElementById("speciesFilter").value;

  let para = [];

  if (name) para.push(`name=${name}`);
  if (status) para.push(`status=${status}`);
  if (species) para.push(`species=${species}`);

  let url = `${api}/?${para.join("&")}`;
  fetchData(url);
}

// newPage
function openCharacter(character) {
  console.log("hello");
}
