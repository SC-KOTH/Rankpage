const config = {
    fieldFilter: '',
    listPlayers: [],
    pagination: {
        perPage: calculatePlayersPerPage(),
        currentPage: 1,
        totalPages: 0
    }
};

async function loadPlayers() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/SC-KOTH/Rank/main/resultado.txt');
        const players = await response.json();

        players.sort((a, b) => b.kills - a.kills);

        config.listPlayers = players.map((p, i) => ({
            ...p,
            position: i + 1,
            kd: p.deaths !== 0 ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2)
        }));
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

const createRow = (player) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${player.position}º</td>
        <td id="teste"><strong>${player.name}</strong></td>
        <td>${player.kills}</td>
        <td>${player.deaths}</td>
        <td>${player.longestShot || '-'}</td>
        <td>${player.headshotLongest || '-'}</td>
        <td>${player.killStreak || '-'}</td>
        <td>${player.kd}</td>
    `;
    table.appendChild(row);
};



const paginate = (array, pageSize, pageNumber) => {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
};


const clearTable = () => {
    table.innerHTML = '';
};

const filterPlayers = () => {
    config.fieldFilter = input.value.toLowerCase().replace(/\s+/g, '');
    config.pagination.currentPage = 1;
    main(); // Atualiza a tabela com a filtragem e ordenação aplicadas
};


const updatePaginationButtons = () => {
    pagePrevious.disabled = config.pagination.currentPage <= 1;
    pageNext.disabled = config.pagination.currentPage >= config.pagination.totalPages;
};

const table = document.querySelector('#table-body');
const input = document.querySelector('#search-input');
input.addEventListener('input', filterPlayers);

const pagePrevious = document.querySelector('#prev-page');
pagePrevious.addEventListener('click', () => handlePagination('<'));

const pageNext = document.querySelector('#next-page');
pageNext.addEventListener('click', () => handlePagination('>'));

function calculatePlayersPerPage() {
    const screenHeight = window.innerHeight;
    return Math.floor(screenHeight / 60);
}

const handlePagination = (type) => {
    if (type === '>' && config.pagination.currentPage < config.pagination.totalPages) {
        config.pagination.currentPage++;
    } else if (type === '<' && config.pagination.currentPage > 1) {
        config.pagination.currentPage--;
    }

    main(); // Atualiza a tabela após mudar a página
};

async function main() {
    await loadPlayers();

    const filteredAndSorted = sortPlayers();

    config.pagination.totalPages = Math.ceil(filteredAndSorted.length / config.pagination.perPage);

    updatePaginationButtons();

    const paginated = paginate(filteredAndSorted, config.pagination.perPage, config.pagination.currentPage);

    clearTable(); // Limpa a tabela antes de criar as novas linhas
    paginated.forEach(createRow);
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        config.pagination.perPage = calculatePlayersPerPage();
        config.pagination.currentPage = 1;
        clearTable();
        main();
    }, 200);
});

main();

const sortData = {
    column: "",
    order: "" // "asc" for crescente, "desc" for decrescente
};

function sortPlayers() {
    const { column, order } = sortData;
    if (column && order) {
        const filtered = config.listPlayers.filter(p =>
            p.name.toLowerCase().replace(/\s+/g, '').includes(config.fieldFilter) ||
            p.uid.includes(config.fieldFilter)
        );

        filtered.sort((a, b) => {
            const aValue = a[column];
            const bValue = b[column];

            if (order === "asc") {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
                return 0;
            } else {
                if (aValue < bValue) return 1;
                if (aValue > bValue) return -1;
                return 0;
            }
        });

        return filtered;
    }
    return config.listPlayers;
}


const sortIcons = document.querySelectorAll(".sort-icon");
sortIcons.forEach(icon => {
    icon.addEventListener("click", event => {
        const clickedColumn = event.target.getAttribute("data-column");
        if (clickedColumn === sortData.column) {
            sortData.order = sortData.order === "desc" ? "asc" : "desc";
        } else {
            sortData.column = clickedColumn;
            sortData.order = "desc";
        }
        
        const filtered = config.listPlayers.filter(p =>
            p.name.toLowerCase().replace(/\s+/g, '').includes(config.fieldFilter) ||
            p.uid.includes(config.fieldFilter)
        );
        
        sortPlayers(filtered); // Passa a lista filtrada para a função de ordenação
        config.pagination.currentPage = 1;
        main(); // Gera a tabela com jogadores filtrados e ordenados
    });
});

// Adicione um evento de clique ao título para recarregar a página
const title = document.getElementById('title');
title.addEventListener('click', () => {
    location.reload(); // Recarrega a página
});

//mutador de som
document.addEventListener("DOMContentLoaded", function() {
  const audioElement = document.getElementById("background-music");
  const muteButton = document.getElementById("mute-button");

  let isMuted = false;

  muteButton.addEventListener("click", function() {
    if (isMuted) {
      audioElement.volume = 0.3;
      muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
      muteButton.classList.remove("muted"); // Remove a classe "muted"
    } else {
      audioElement.volume = 0;
      muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
      muteButton.classList.add("muted"); // Adiciona a classe "muted"
    }
    isMuted = !isMuted;
  });

  audioElement.volume = 0.3; // Defina o volume inicial
});
