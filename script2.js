const config = {
    fieldFilter: '',
    listPlayers: [],
    pagination: {
        perPage: 20,
        currentPage: 1
    }
}

async function loadPlayers() {
    const response = await fetch('https://raw.githubusercontent.com/SC-KOTH/Rank/main/resultado.txt');
    const players = await response.json();

    config.listPlayers = _.orderBy(players, ['kills'], ['desc']).map((p, i) => {
        p.position = ++i;
        p.kd = p.deaths !== 0 ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2);
        return p;
    });
}

const createRow = (player) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${player.position}º</td>
      <td><strong>${player.name}</strong></td>
      <td>${player.kills}</td>
      <td>${player.deaths}</td>
      <td>${player.longestShot === 0 ? '-' : player.longestShot}</td>
      <td>${player.headshotLongest === 0 ? '-' : player.headshotLongest}</td>
      <td>${player.killStreak === 0 ? '-' : player.killStreak}</td>
      <td>${player.kd}</td>
    `;
    table.appendChild(row);
}

const paginate = (array, pageSize, pageNumber) => {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

const clearTable = () => {
    table.innerHTML = ''
}

const filterPlayer = (e) => {
    const value = e.target.value;
    config.fieldFilter = value
    clearTable()
    config.pagination.currentPage = 1;
    
    main()
}

const handlePagination = (type) => {
    if (type === '>') {
        config.pagination.currentPage++
    } else {
        config.pagination.currentPage--
    }
    
    clearTable()
    main()
}

const table = document.querySelector('#table-body')
const input = document.querySelector('#search-input')
input.addEventListener('keydown', filterPlayer)

const pagePrevious = document.querySelector('#prev-page')
pagePrevious.addEventListener('click', () => handlePagination('<'))

 const pageNext = document.querySelector('#next-page')
pageNext.addEventListener('click', () => handlePagination('>'))

const main = async () => {
    await loadPlayers()
    
    if (config.pagination.currentPage <= 1) {
        pagePrevious.setAttribute('disabled', true)
    } else {
        pagePrevious.removeAttribute('disabled')
    }

    const filtered = config
        .listPlayers
        .filter((p) => _.startsWith(p.name, config.fieldFilter))
    
    paginate(filtered, config.pagination.perPage, config.pagination.currentPage).map(createRow)
    
    console.log()
    
}

main();