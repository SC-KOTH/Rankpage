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

const paginate = (array, pageSize, pageNumber) => {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
};

const clearTable = () => {
    table.innerHTML = '';
};

const filterPlayers = () => {
    config.fieldFilter = input.value.toLowerCase().replace(/\s+/g, '');
    config.pagination.currentPage = 1;
    clearTable();
    main();
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
    
    clearTable();
    main();
};

async function main() {
    await loadPlayers();

    const filtered = config.listPlayers.filter(p =>
        p.name.toLowerCase().replace(/\s+/g, '').includes(config.fieldFilter) ||
        p.uid.includes(config.fieldFilter)
    );

    config.pagination.totalPages = Math.ceil(filtered.length / config.pagination.perPage);

    updatePaginationButtons();

    const paginated = paginate(filtered, config.pagination.perPage, config.pagination.currentPage);
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
