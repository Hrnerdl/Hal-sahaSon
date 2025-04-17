// Tüm butonlara işlevleri bağlama
document.getElementById('addOrUpdatePlayerBtn').addEventListener('click', addOrUpdatePlayer);
document.getElementById('createTeamsBtn').addEventListener('click', createTeams);
document.getElementById('goToMatchResultBtn').addEventListener('click', goToMatchResult);
document.getElementById('deleteSelectedDataBtn').addEventListener('click', deleteSelectedData);
document.getElementById('downloadPDFBtn').addEventListener('click', downloadSelectedPDF);
document.getElementById('saveMatchStatisticsBtn').addEventListener('click', saveMatchStatistics);
document.getElementById('goBackToMainBtn').addEventListener('click', goBackToMain);

// Oyuncular ve takımlar için global diziler
const players = [];
const savedData = [];
let editingPlayerIndex = null;
let selectedDataIndex = null;

// Oyuncunun yetenek aralığını doğrulama
function validateSkillRange(skill) {
    return skill >= 0 && skill <= 10;
}

// Oyuncu ekleme veya güncelleme
function addOrUpdatePlayer() {
    const name = document.getElementById('name').value;
    const position = document.getElementById('position').value;
    const goalkeeperSkill = parseInt(document.getElementById('goalkeeperSkill').value) || 0;
    const defenderSkill = parseInt(document.getElementById('defenderSkill').value) || 0;
    const midfielderSkill = parseInt(document.getElementById('midfielderSkill').value) || 0;
    const forwardSkill = parseInt(document.getElementById('forwardSkill').value) || 0;

    if (!name || !position) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    if (![goalkeeperSkill, defenderSkill, midfielderSkill, forwardSkill].every(validateSkillRange)) {
        alert("Yetenek puanları 0 ile 10 arasında olmalıdır!");
        return;
    }

    const player = {
        name,
        position,
        goalkeeperSkill,
        defenderSkill,
        midfielderSkill,
        forwardSkill,
    };

    if (editingPlayerIndex !== null) {
        players[editingPlayerIndex] = player;
        editingPlayerIndex = null;
    } else {
        players.push(player);
    }

    clearForm();
    displayPlayers();
}

// Formu temizle
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
                ${index + 1}. ${player.name} (${player.position}) - Kalecilik: ${player.goalkeeperSkill}, Stoper: ${player.defenderSkill}, Orta Saha: ${player.midfielderSkill}, Forvet: ${player.forwardSkill}
                <button class="btn btn-sm btn-warning float-end ms-2" onclick="editPlayer(${index})">Düzenle</button>
                <button class="btn btn-sm btn-danger float-end" onclick="deletePlayer(${index})">Sil</button>
            </div>`;
    });
}

// Oyuncuyu düzenleme
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

// Oyuncuyu sil
function deletePlayer(index) {
    players.splice(index, 1);
    displayPlayers();
}

// Takımları oluştur
function createTeams() {
    const matchDate = document.getElementById('matchDate').value;
    if (!matchDate) {
        alert("Lütfen halı saha tarihi seçin.");
        return;
    }

    if (players.length < 14) {
        alert("En az 14 oyuncu girilmelidir!");
        return;
    }

    const teams = [[], []];
    players.forEach((player, index) => {
        teams[index % 2].push(player);
    });

    displayTeams(teams);
    saveData(matchDate, teams);
}

// Takımları listeleme
function displayTeams(teams) {
    const teamsDiv = document.getElementById('teams');
    teamsDiv.innerHTML = '';
    teams.forEach((team, index) => {
        teamsDiv.innerHTML += `<h5 class="team-title">Takım ${index + 1}</h5>`;
        team.forEach(player => {
            teamsDiv.innerHTML += `<p>${player.name} (${player.position})</p>`;
        });
    });
}

// Veriyi kaydetme
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
        savedDataDiv.innerHTML += `
            <div class="list-group-item ${index === selectedDataIndex ? 'selected-data' : ''}" onclick="loadSavedData(${index})">
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

// PDF indirme
function downloadSelectedPDF() {
    if (selectedDataIndex === null) {
        alert("Lütfen bir kayıt seçin.");
        return;
    }
    const { jsPDF } = window.jspdf || {}; // Eğer undefined ise boş obje döner
	if (!jsPDF) {
    console.error("jsPDF yüklenemedi. Lütfen jsPDF kütüphanesinin doğru şekilde yüklendiğinden emin olun.");
    return;
}
const doc = new jsPDF();

    let y = 10;

    doc.text(`Tarih: ${data.date}`, 10, y);
    y += 10;
    doc.text(`Oluşturma: ${data.timestamp}`, 10, y);
    y += 10;

    data.teams.forEach((team, teamIndex) => {
        doc.text(`Takım ${teamIndex + 1}:`, 10, y);
        y += 10;
        team.forEach((player, playerIndex) => {
            doc.text(`${playerIndex + 1}. ${player.name} (${player.position})`, 20, y);
            y += 10;
        });
        y += 5;
    });

    doc.save(`halisaha_takim_${data.date}.pdf`);
}

// Maç sonucu ekranına geçiş
function goToMatchResult() {
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('matchResultPage').classList.remove('hidden');
    loadMatchResultContent();
}

// Ana sayfaya dönüş
function goBackToMain() {
    document.getElementById('matchResultPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
}

// Maç sonucu içeriğini yükleme
function loadMatchResultContent() {
    const matchResultContent = document.getElementById('matchResultContent');
    matchResultContent.innerHTML = '';

    if (selectedDataIndex === null) {
        matchResultContent.innerHTML = '<p class="text-danger text-center">Lütfen bir kayıt seçin.</p>';
        return;
    }

    const data = savedData[selectedDataIndex];
    data.teams.forEach((team, teamIndex) => {
        matchResultContent.innerHTML += `<h3 class="text-center mt-4">Takım ${teamIndex + 1}</h3>`;
        team.forEach(player => {
            matchResultContent.innerHTML += `
                <div class="card p-3 mb-3">
                    <h5>${player.name} (${player.position})</h5>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="${player.name}-goal" class="form-label">Gol</label>
                            <input type="number" id="${player.name}-goal" class="form-control" placeholder="Gol" min="0">
                        </div>
                        <div class="col-md-6">
                            <label for="${player.name}-assist" class="form-label">Asist</label>
                            <input type="number" id="${player.name}-assist" class="form-control" placeholder="Asist" min="0">
                        </div>
                    </div>
                </div>`;
        });
    });
}

// Maç istatistiklerini kaydetme
function saveMatchStatistics() {
    const matchResultContent = document.getElementById('matchResultContent');
    const goalTableBody = document.querySelector('#goalTable tbody');
    const assistTableBody = document.querySelector('#assistTable tbody');
    goalTableBody.innerHTML = '';
    assistTableBody.innerHTML = '';

    const data = savedData[selectedDataIndex];
    const playerStats = [];

    data.teams.forEach(team => {
        team.forEach(player => {
            const goalInput = document.getElementById(`${player.name}-goal`);
            const assistInput = document.getElementById(`${player.name}-assist`);
            const goals = parseInt(goalInput.value) || 0;
            const assists = parseInt(assistInput.value) || 0;
            playerStats.push({ name: player.name, goals, assists });
        });
    });

    playerStats.sort((a, b) => b.goals - a.goals).forEach(stat => {
        goalTableBody.innerHTML += `<tr><td>${stat.name}</td><td>${stat.goals}</td></tr>`;
    });

    playerStats.sort((a, b) => b.assists - a.assists).forEach(stat => {
        assistTableBody.innerHTML += `<tr><td>${stat.name}</td><td>${stat.assists}</td></tr>`;
    });

    alert("Maç sonucu başarıyla kaydedildi ve sıralamalar güncellendi!");
}