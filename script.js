// Função para buscar a lista de jogadores a partir do arquivo de texto
async function fetchPlayersData() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/SC-KOTH/Rank/main/resultado.txt');
    if (!response.ok) {
      throw new Error('Erro na requisição');
    }
    const data = await response.json(); // Use response.json() para interpretar como JSON
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados dos jogadores:', error);
    return [];
  }
}

let playersData = []; // Declaração da estrutura playersData vazia

// Chamada da função fetchPlayersData para obter os dados dos jogadores
fetchPlayersData().then(data => {
  playersData = data; // Atribui os dados obtidos a playersData
  playersData.forEach(player => {
    player.kd = player.deaths !== 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
  });
  updateTable(); // Atualiza a tabela
  updatePageIndicator(); // Atualiza o indicador de página
});

const playersPerPage = 15;
let currentPage = 1;

const tableBody = document.getElementById('table-body');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

function updateTable() {
  tableBody.innerHTML = '';
  const startIndex = (currentPage - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const sortedPlayers = playersData.slice().sort((a, b) => b.kills - a.kills);
  for (let i = startIndex; i < endIndex && i < sortedPlayers.length; i++) {
    let player = sortedPlayers[i];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i+1}</td>
      <td>${player.name}</td>
      <td>${player.kills}</td>
      <td>${player.deaths}</td>
      <td>${player.longestShot}</td>
      <td>${player.headshotLongest}</td>
      <td>${player.killStreak}</td>
      <td>${player.kd}</td>
    `;
    tableBody.appendChild(row);
  }

  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = endIndex >= sortedPlayers.length;
}

const pageIndicator = document.getElementById('page-indicator');

function updatePageIndicator() {
  const maxPages = Math.ceil(playersData.length / playersPerPage);
  pageIndicator.textContent = `Página ${currentPage} de ${maxPages}`;
}

prevPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    updateTable();
    updatePageIndicator();
  }
});

nextPageButton.addEventListener('click', () => {
  const maxPages = Math.ceil(playersData.length / playersPerPage);
  if (currentPage < maxPages) {
    currentPage++;
    updateTable();
    updatePageIndicator();
  }
});

updateTable();
updatePageIndicator();


// document.getElementById('search-icon').addEventListener('click', function () {
//   filterPlayers();
// });
//
// document.getElementById('search-input').addEventListener('input', function () {
//   filterPlayers();
// });

document.querySelector('#search-input').addEventListener('keydown',  (event) => {
  filterPlayers2(event.target.value);
});

async function filterPlayers2(input) {
  const players = await fetchPlayersData()
  
  console.log(players.filter((p) => p.name === input))
}

async function filterPlayers() {
  const searchValue = document.getElementById('search-input').value.toLowerCase();
  
  if(searchValue != "") {
    try {
      const response = await fetch('https://raw.githubusercontent.com/SC-KOTH/Rank/main/resultado.txt');
    if (!response.ok) {
      console.error('Erro na requisição');
      return;
    }
    
    const playersData1 = await response.json();
    
    const filteredPlayers = playersData1.filter(({ name }) => name.toLowerCase() === searchValue);
  
    playersData = filteredPlayers;
    
    playersData.forEach(player => {
        player.kd = player.deaths !== 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
    });
    updateTable(); // Atualiza a tabela
    updatePageIndicator(); // Atualiza o indicador de página
    } catch (error) {
      fetchPlayersData().then(data => {
        playersData = data; // Atribui os dados obtidos a playersData
        playersData.forEach(player => {
          player.kd = player.deaths !== 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
        });
        updateTable(); // Atualiza a tabela
        updatePageIndicator(); // Atualiza o indicador de página
      });
      
    }
  } else {
    fetchPlayersData().then(data => {
      playersData = data; // Atribui os dados obtidos a playersData
      playersData.forEach(player => {
        player.kd = player.deaths !== 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
      });
      updateTable(); // Atualiza a tabela
      updatePageIndicator(); // Atualiza o indicador de página
    });
  };
}

