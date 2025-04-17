// Butonlara tıklama olaylarını bağlama
document.getElementById('addPlayerButton').addEventListener('click', addOrUpdatePlayer);
document.getElementById('createTeamsButton').addEventListener('click', createTeams);
document.getElementById('goToMatchResultButton').addEventListener('click', goToMatchResult);
document.getElementById('deleteSelectedDataButton').addEventListener('click', deleteSelectedData);
document.getElementById('downloadPDFButton').addEventListener('click', downloadSelectedPDF);
document.getElementById('saveMatchResultButton').addEventListener('click', saveMatchResult);
document.getElementById('goBackToMainButton').addEventListener('click', goBackToMain);
document.getElementById('downloadMatchResultPDFButton').addEventListener('click', downloadMatchResultPDF);
document.getElementById('deleteSavedMatchResultButton').addEventListener('click', deleteSavedMatchResult);

// Oyuncular ve veriler
const players = [];
const savedData = [];
const savedMatchResults = [];
let editingPlayerIndex = null;
let selectedDataIndex = null;
let selectedMatchResultIndex = null;

// Oyuncu ekleme veya düzenleme
function addOrUpdatePlayer() {
    const name = document.getElementById('name').value;
    const position = document.getElementById('position').value;
    const goalkeeperSkill = parseInt(document.getElementById('goalkeeperSkill').value);
    const defenderSkill = parseInt(document.getElementById('defenderSkill').value);
    const midfielderSkill = parseInt(document.getElementById('midfielderSkill').value);
    const forwardSkill = parseInt(document.getElementById('forwardSkill').value);

    if (!name || !position || isNaN(goalkeeperSkill) || isNaN(defenderSkill) || isNaN(midfielderSkill) || isNaN(forwardSkill)) {
        alert("Lütfen tüm bilgileri doldurun!");
        return;
    }

    const player = { name, position, goalkeeperSkill, defenderSkill, midfielderSkill, forwardSkill };

    if (editingPlayerIndex !== null) {
        players[editingPlayerIndex] = player;
        editingPlayerIndex = null;
    } else {
        players.push(player);
    }

    clearForm();
    displayPlayers();
}

// Formu temizleme
function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('position').value = '';
    document.getElementById('goalkeeperSkill').value = '';
    document.getElementById('defenderSkill').value = '';
    document.getElementById('midfielderSkill').value = '';
    document.getElementById('forwardSkill').value = '';
}

// Oyuncuları listeleme
function displayPlayers() {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = '';
    players.forEach((player, index) => {
        playersDiv.innerHTML += `
            <div class="list-group-item player-card">
                ${index + 1}. ${player.name} (${player.position}) - 
                Kalecilik: ${player.goalkeeperSkill}, Stoper: ${player.defenderSkill}, 
                Orta Saha: ${player.midfielderSkill}, Forvet: ${player.forwardSkill}
                <button class="btn btn-sm btn-warning float-end ms-2" onclick="editPlayer(${index})">Düzenle</button>
                <button class="btn btn-sm btn-danger float-end" onclick="deletePlayer(${index})">Sil</button>
            </div>`;
    });
}

// Oyuncu düzenleme
function editPlayer(index) {
    const player = players[index];
    document.getElementById('name').value = player.name;
    document.getElementById('position').value = player.position;
    document.getElementById('goalkeeperSkill').value = player.goalkeeperSkill;
    document.getElementById('defenderSkill').value = player.defenderSkill;
    document.getElementById('midfielderSkill').value = player.midfielderSkill;
    document.getElementById('forwardSkill').value = player.forwardSkill;
    editingPlayerIndex = index;
}

// Oyuncu silme
function deletePlayer(index) {
    players.splice(index, 1);
    displayPlayers();
}

// Takım oluşturma
function createTeams() {
    const matchDate = document.getElementById('matchDate').value;
    if (!matchDate) {
        alert("Lütfen halı saha tarihi seçin.");
        return;
    }

    if (players.length < 14) {
        alert("En az 14 oyuncu girmelisiniz.");
        return;
    }

    if (players.length % 2 !== 0) {
        alert("Oyuncu sayısı tek olduğu için takımlar eşit şekilde oluşturulamaz.");
        return;
    }

    const teams = [[], []];

    // Savunmacı ve hücumcu oyuncuları ayır
    const defenders = players.filter(player => player.position === "goalkeeper" || player.position === "defender");
    const attackers = players.filter(player => player.position === "midfielder" || player.position === "forward");

    // Savunmacı oyuncuları dağıt
    distributePlayers(defenders, teams);

    // Hücumcu oyuncuları dağıt
    distributePlayers(attackers, teams);

    displayTeams(teams);

    // Veriyi kaydet
    saveData(matchDate, teams);
}

// Oyuncuları iki takıma eşit şekilde dağıt
function distributePlayers(players, teams) {
    players.forEach((player, index) => {
        teams[index % 2].push(player);
    });
}

// Takımları listeleme
function displayTeams(teams) {
    const teamsDiv = document.getElementById('teams');
    teamsDiv.innerHTML = '';
    teams.forEach((team, index) => {
        teamsDiv.innerHTML += `<div class="team-title">Takım ${index + 1}</div>`;
        team.forEach(player => {
            teamsDiv.innerHTML += `<p>${player.name} (${player.position})</p>`;
        });
    });
}

// Veriyi kaydet
function saveData(matchDate, teams) {
    const data = {
        date: matchDate,
        timestamp: new Date().toLocaleString(),
        teams: JSON.parse(JSON.stringify(teams))
    };
    savedData.push(data);
    displaySavedData();
}

// Kaydedilen verileri listeleme
function displaySavedData() {
    const savedDataDiv = document.getElementById('savedData');
    savedDataDiv.innerHTML = '';
    savedData.forEach((data, index) => {
        const isSelected = index === selectedDataIndex ? 'selected-data' : '';
        savedDataDiv.innerHTML += `
            <div class="list-group-item ${isSelected}" onclick="loadSavedData(${index})" style="cursor: pointer;">
                <strong>Tarih:</strong> ${data.date} - <strong>Oluşturma:</strong> ${data.timestamp}
            </div>`;
    });
}

// Kaydedilen veriyi yükleme
function loadSavedData(index) {
    selectedDataIndex = index;
    const data = savedData[index];
    players.length = 0;
    data.teams.flat().forEach(player => players.push(player));
    displayPlayers();
    displayTeams(data.teams);
    displaySavedData();
}

// Kaydedilen veriyi silme
function deleteSelectedData() {
    if (selectedDataIndex === null) {
        alert("Lütfen bir kayıt seçin.");
        return;
    }
    savedData.splice(selectedDataIndex, 1);
    selectedDataIndex = null;
    displaySavedData();
    clearForm();
    document.getElementById('teams').innerHTML = '';
}

// PDF olarak indir
function downloadSelectedPDF() {
    if (selectedDataIndex === null) {
        alert("Lütfen bir kayıt seçin.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = savedData[selectedDataIndex];

    let y = 10;

    doc.text(`Tarih: ${data.date}`, 10, y);
    y += 10;
    doc.text(`Oluşturma: ${data.timestamp}`, 10, y);
    y += 10;

    data.teams.forEach((team, teamIndex) => {
        doc.text(`Takım ${teamIndex + 1}:`, 10, y);
        y += 10;
        team.forEach((player, playerIndex) => {
            doc.text(`${playerIndex + 1}. ${player.name}`, 20, y);
            y += 10;
        });
        y += 5;
    });

    doc.save(`halisaha_takim_${data.date}.pdf`);
}

// Maç Sonucu Kaydetme ve Tabloları Güncelleme
function saveMatchResult() {
    alert("Maç sonucu kaydedildi!");
}

// Ana Sayfaya Geri Dön
function goBackToMain() {
    document.getElementById('matchResultPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
}