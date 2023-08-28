const config = {
    fieldFilter: '',
    listPlayers: [],
    weeklyPlayers: [],
    showWeekly: false,
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

async function loadWeeklyPlayers() {
    try {
        const initialResponse = await fetch('https://raw.githubusercontent.com/SC-KOTH/Rank/main/resultado.txt');
        const finalResponse = await fetch('https://raw.githubusercontent.com/SC-KOTH/Rank/main/resultado2.txt');
        const initialPlayers = await initialResponse.json();
        const finalPlayers = await finalResponse.json();

        const uidToInitialPlayer = {}; // Mapa de uid para jogador inicial
        initialPlayers.forEach(player => {
            uidToInitialPlayer[player.uid] = player;
        });

        finalPlayers.sort((a, b) => a.name.localeCompare(b.name));

        const weeklyPlayers = finalPlayers.map((finalPlayer) => {
            const initialPlayer = uidToInitialPlayer[finalPlayer.uid];

            if (initialPlayer) {
                const weeklyKills = Math.max(initialPlayer.kills - finalPlayer.kills, 0);
                const weeklyDeaths = Math.max(initialPlayer.deaths - finalPlayer.deaths, 0);
                const weeklyKd = weeklyDeaths !== 0 ? (weeklyKills / weeklyDeaths).toFixed(2) : (weeklyKills).toFixed(2);
                return {
                    ...finalPlayer,
                    position: 0, // Será definido posteriormente
                    kills: weeklyKills,
                    deaths: weeklyDeaths,
                    longestShot: initialPlayer.longestShot, // Importar Tiro Mais Longo
                    headshotLongest: initialPlayer.headshotLongest, // Importar HS mais longo
                    killStreak: initialPlayer.killStreak, // Importar Maior Kill Streak
                    kd: weeklyKd
                };
            } else {
                return null; // Não há correspondência de uid, não incluir na lista
            }
        }).filter(player => player !== null); // Filtrar para remover jogadores nulos

        // Ordenar jogadores semanais com base em kills semanais (decrescente)
        weeklyPlayers.sort((a, b) => b.kills - a.kills);

        // Atribuir a posição da tabela semanal
        const weeklyPlayersWithPosition = weeklyPlayers.map((player, index) => ({
            ...player,
            position: index + 1
        }));

        config.weeklyPlayers = weeklyPlayersWithPosition;
    } catch (error) {
        console.error('Error loading weekly players:', error);
    }
}

// Função para alternar entre ranking geral e ranking semanal
function toggleRanking(type) {
    config.showWeekly = type === 'weekly';
    config.pagination.currentPage = 1;
    main();
}

// Event listener para os botões de alternância
const toggleGeneralButton = document.getElementById('toggle-general');
const toggleWeeklyButton = document.getElementById('toggle-weekly');

toggleGeneralButton.addEventListener('click', () => toggleRanking('general'));
toggleWeeklyButton.addEventListener('click', () => toggleRanking('weekly'));

const createRow = (player) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${player.position}º</td>
        <td><strong>${player.name}</strong></td>
        <td>${player.kills}</td>
        <td>${player.deaths}</td>
        <td>${player.longestShot || '-'}</td>
        <td>${player.headshotLongest || '-'}</td>
        <td>${player.killStreak || '-'}</td>
        <td>${player.kd}</td>
    `;
    table.appendChild(row);
};

function calculatePlayersPerPage() {
    const screenHeight = window.innerHeight;
    return Math.floor(screenHeight / 60);
}

const table = document.querySelector('#table-body');
const input = document.querySelector('#search-input');
input.addEventListener('input', filterPlayers);

const pagePrevious = document.querySelector('#prev-page');
pagePrevious.addEventListener('click', () => handlePagination('<'));

const pageNext = document.querySelector('#next-page');
pageNext.addEventListener('click', () => handlePagination('>'));

function paginate(array, pageSize, pageNumber) {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
}

function clearTable() {
    table.innerHTML = '';
}

function filterPlayers() {
    config.fieldFilter = input.value.toLowerCase().replace(/\s+/g, '');
    config.pagination.currentPage = 1;
    main();
}

function updatePaginationButtons() {
    pagePrevious.disabled = config.pagination.currentPage <= 1;
    pageNext.disabled = config.pagination.currentPage >= config.pagination.totalPages;
}

function handlePagination(type) {
    if (type === '>' && config.pagination.currentPage < config.pagination.totalPages) {
        config.pagination.currentPage++;
    } else if (type === '<' && config.pagination.currentPage > 1) {
        config.pagination.currentPage--;
    }

    main();
}

async function main() {
    await loadPlayers();
    await loadWeeklyPlayers(); // Carrega os dados semanais

    const filtered = (config.showWeekly ? config.weeklyPlayers : config.listPlayers).filter(p =>
        (p.name && p.name.toLowerCase().replace(/\s+/g, '').includes(config.fieldFilter)) ||
        (p.uid && p.uid.includes(config.fieldFilter))
    );

    const filteredAndSorted = sortPlayers(filtered);

    config.pagination.totalPages = Math.ceil(filteredAndSorted.length / config.pagination.perPage);

    updatePaginationButtons();

    const paginated = paginate(filteredAndSorted, config.pagination.perPage, config.pagination.currentPage);

    clearTable();
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

function sortPlayers(players) {
    const { column, order } = sortData;
    if (column && order) {
        const sorted = [...players];

        sorted.sort((a, b) => {
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

        return sorted;
    }
    return players;
}

const sortIcons = document.querySelectorAll(".sort-icon");
sortIcons.forEach(icon => {
    icon.addEventListener("click", event => {
        const clickedColumn = event.target.getAttribute("data-column");
        if (clickedColumn === sortData.column) {
            sortData.order = sortData.order === "asc" ? "desc" : "asc";
        } else {
            sortData.column = clickedColumn;
            sortData.order = "asc";
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

// Função para alternar entre ranking geral e ranking semanal
function toggleRanking(type) {
    config.showWeekly = type === 'weekly';
    config.pagination.currentPage = 1;

    if (config.showWeekly) {
        toggleGeneralButton.classList.remove('selected');
        toggleWeeklyButton.classList.add('selected');
    } else {
        toggleGeneralButton.classList.add('selected');
        toggleWeeklyButton.classList.remove('selected');
    }

    main();
}