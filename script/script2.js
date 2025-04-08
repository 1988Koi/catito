//fazer isso para tentar organizar esse inferno de codigo ja gastei tanto tempo nisso, quando isso tudo vai acabar?


// ==================================
// Variaveis Globais
// ==================================
let audio = null;
let combo = 0;
let score = 0;
let totalAccumulatedPoints = 10000;
let activeNotes = [];
let chartNotes = [];
let lastSpawnIndex = 0;
let gameLoopRequestId = null;
let currentSongHits = 0;
let currentSongTotalNotes = 0;
let currentMaxCombo = 0;

// ==================================
// Referencias a Elementos HTML
// ==================================
const container = document.getElementById("noteContainer");
const comboText = document.getElementById("combo");
const rankDisplayElement = document.getElementById("rankDisplay");
const scoreText = document.getElementById("score");
const hitText = document.getElementById("hitText");
const musicSelect = document.getElementById("musicSelect");
const skinSelect = document.getElementById("skinSelect");
const openShopButton = document.getElementById("openShopButton");
const closeShopButton = document.getElementById("closeShopButton");
const shopContainer = document.getElementById("shopContainer");
const shopPointsDisplay = document.getElementById("shopPointsDisplay");
const buyButtons = document.querySelectorAll(".buyButton");
const totalPointsDisplay = document.getElementById("totalPointsDisplay");
const achievementsButton = document.getElementById("achievementsButton");
const achievementsPanel = document.getElementById("achievementsPanel");
const achievementsList = document.getElementById("achievementsList"); // Onde a lista será mostrada
const closeAchievementsButton = document.getElementById("closeAchievementsButton");

// ==================================
// Configuracoes e Constantes
// ==================================
const laneKeys = { d: 0, f: 1, j: 2, k: 3 };
const hitWindowTop = 440;
const hitWindowBottom = 370;

// ==================================
// Definicoes de Conquistas
// ==================================
const achievements = {
    'ttff_300_notes': { name: "Aprendiz de Herói da Guitarra", description: "Acerte 300+ notas em Through the Fire and Flames.", unlocked: false },
    'reach_100_combo': { name: "Combo 100!", description: "Alcance um combo de 100 em qualquer música.", unlocked: false },
    'glimpse': { name: "She takes the world off my shoulders", description: "When it was ever hard to move. (100+ hits em Glimpse of Us)", unlocked: false },
    'you': { name: "Lost in the blues", description: "no one loves me like you do.. (100+ hits em Like You Do)", unlocked: false },
    'first_s_rank': { name: "Perfeccionista", description: "Consiga seu primeiro Rank S.", unlocked: false },
    'buy_waluigi': { name: "WAH!", description: "Apoie a venda de tacos do waluigi.", unlocked: false },
    'buy_nectar': { name: "You're the one, more than fun", description: "You're the sanctuary (Compre o Quadro Nectar).", unlocked: false },
    'buy_jojito': { name: "Jojito!!!", description: "Cuide bem dele.", unlocked: false },
};
let unlockedAchievements = [];

// ==================================
// Listeners Globais
// ==================================
document.addEventListener("keydown", (e) => {
  if (laneKeys.hasOwnProperty(e.key)) {
    checkHit(laneKeys[e.key]);
  }
});

// ==================================
// Funoees do Jogo
// ==================================
function showHit() {
  hitText.style.display = "block";
  setTimeout(() => (hitText.style.display = "none"), 300);
}

function spawnNote(lane) {
  const el = document.createElement("div");
  el.classList.add("note");
  el.classList.add(`lane-${lane}`);
  el.style.top = "0px";
  const teclaVisual = ["D", "F", "J", "K"][lane];
  el.textContent = teclaVisual;
  container.appendChild(el);
  return el;
}

function updateNotes() {
  activeNotes.forEach((note) => {
    const top = parseFloat(note.el.style.top);
    note.el.style.top = `${top + 5}px`; 
    if (top > 580 && !note.hit) { 
      note.hit = true; 
      combo = 0; 
      comboText.textContent = combo;
      note.el.remove();
    }
  });
  activeNotes = activeNotes.filter((n) => !n.hit); 
}

function checkHit(lane) {
  activeNotes.forEach(note => {
    const top = parseFloat(note.el.style.top);
    if (note.lane === lane && top > hitWindowBottom && top < hitWindowTop && !note.hit) {
      note.hit = true;
      score += 100; 
      combo += 1;
      currentSongHits++;
      currentMaxCombo = Math.max(currentMaxCombo, combo);

      comboText.textContent = combo;
      scoreText.textContent = score;
      if (rankDisplayElement) {
        rankDisplayElement.textContent = currentSongHits;
      }

      showHit(); // 
      note.el.remove(); 
    }
  });
}

function gameLoop() {
  if (!audio || audio.paused) { gameLoopRequestId = null; return; }
  const currentTime = audio.currentTime;
  while (lastSpawnIndex < chartNotes.length && chartNotes[lastSpawnIndex][0] <= currentTime + 1.5) { 
    const [noteTime, lane] = chartNotes[lastSpawnIndex];
    const travelTime = ((hitWindowBottom + hitWindowTop) / 2) / 5 / 60;
    if (currentTime >= noteTime - travelTime) {
        const el = spawnNote(lane);
        activeNotes.push({ el, hit: false, lane, spawnTime: noteTime });
        lastSpawnIndex++;
    } else { break; } 
  }
  updateNotes();
  gameLoopRequestId = requestAnimationFrame(gameLoop);
}

function parseChart(chartText, resolution = 192, bpm = 120) {
  const headerMatchBPM = chartText.match(/BPM:\s*(\d+(\.\d+)?)/i);
  const headerMatchRes = chartText.match(/Resolution:\s*(\d+)/i);
  if (headerMatchBPM) bpm = parseFloat(headerMatchBPM[1]);
  if (headerMatchRes) resolution = parseInt(headerMatchRes[1]);
  console.log(`Parsing chart with BPM: ${bpm}, Resolution: ${resolution}`);

  const lines = chartText.split("\n");
  const notes = [];
  const tickToSeconds = (tick) => (tick / resolution) * (60 / bpm);

  let inNotesSection = false;

  for (const line of lines) {
      if (line.trim() === "[ExpertSingle]") {
          inNotesSection = true;
          continue;
      }
      if (line.trim().startsWith("[") && line.trim() !== "[ExpertSingle]") {
          inNotesSection = false;
          continue;
      }

      if (inNotesSection) {
          const parts = line.trim().split(" = ");
          if (parts.length === 2 && parts[1].startsWith("N ")) {
              const tickStr = parts[0];
              const noteData = parts[1].substring(2).trim().split(/\s+/); // Remove "N " e divide
              const lane = parseInt(noteData[0]);
              const tick = parseInt(tickStr);

              if (!isNaN(tick) && !isNaN(lane) && lane >= 0 && lane <= 3) {
                  const time = tickToSeconds(tick);
                  notes.push([time, lane]);
              }
          }
      }
  }

  notes.sort((a, b) => a[0] - b[0]);
  return notes;
}

function startGame() {
  console.log("Iniciando o jogo...");
  const selectedMusic = musicSelect.value;

  container.innerHTML = "";
  activeNotes = [];
  combo = 0;
  score = 0;
  currentSongHits = 0;
  currentSongTotalNotes = 0;
  currentMaxCombo = 0;
  comboText.textContent = "0";
  scoreText.textContent = "0";
  lastSpawnIndex = 0;

  if (audio) { audio.pause(); audio.removeEventListener('ended', handleSongEnd); }
  if (gameLoopRequestId) { cancelAnimationFrame(gameLoopRequestId); gameLoopRequestId = null; }

  if (rankDisplayElement) {
    rankDisplayElement.textContent = currentSongHits;
    rankDisplayElement.style.display = 'block';
    rankDisplayElement.className = '';
  }

  audio = new Audio(`music/${selectedMusic}.mp3`);
  audio.currentTime = 0;
  audio.addEventListener('ended', handleSongEnd);

  fetch(`music/${selectedMusic}.chart`)
    .then(response => { if (!response.ok) throw new Error(`Erro ${response.statusText}`); return response.text(); })
    .then(chartText => {
        try {
            chartNotes = parseChart(chartText); currentSongTotalNotes = chartNotes.length;
            console.log(`Chart loaded: ${currentSongTotalNotes} notes.`);
            audio.play().then(() => {
                console.log("Áudio iniciado, game loop.");
                if (!gameLoopRequestId) gameLoopRequestId = requestAnimationFrame(gameLoop);
            }).catch(err => { console.error("Erro play:", err); alert("Clique na tela antes de iniciar."); });
        } catch(error) { console.error("Erro parse:", error); alert("Erro .chart."); }
    })
    .catch(error => { console.error("Erro fetch:", error); alert(`Erro ao carregar .chart: ${selectedMusic}.`); });
}

function handleSongEnd() {
  console.log("Música terminou. Pontuação:", score, "Acertos:", currentSongHits, "MaxCombo:", currentMaxCombo, "Total Notas:", currentSongTotalNotes);

  let rank = "D"; let accuracy = 0;
  if (currentSongTotalNotes > 0) {
      accuracy = (currentSongHits / currentSongTotalNotes) * 100;
      if (accuracy >= 100) rank = "S";
      else if (accuracy >= 95) rank = "A";
      else if (accuracy >= 90) rank = "B";
      else if (accuracy >= 80) rank = "C";
      else rank = "D";
      console.log(`Precisão: ${accuracy.toFixed(2)}% - Rank: ${rank}`);
  } else { console.log("Rank não calculado."); }

  totalAccumulatedPoints += score;
  localStorage.setItem('totalAccumulatedPoints', totalAccumulatedPoints);
  console.log("Pontos totais salvos:", totalAccumulatedPoints);
  if (totalPointsDisplay) totalPointsDisplay.textContent = totalAccumulatedPoints;
  if (shopPointsDisplay && shopContainer.style.display === 'block') shopPointsDisplay.textContent = totalAccumulatedPoints;

  if (gameLoopRequestId) { cancelAnimationFrame(gameLoopRequestId); gameLoopRequestId = null; console.log("Loop parado."); }

  alert(`Música finalizada!\nRank: ${rank}\nPrecisão: ${accuracy.toFixed(1)}% (${currentSongHits}/${currentSongTotalNotes})\nMax Combo: ${currentMaxCombo}\nPontuação: ${score}\nTotal Acumulado: ${totalAccumulatedPoints}`);

  const currentMusicId = musicSelect.value;

  // VERIFICAR AS CONQUISTAS FAZ 7 HORAS QUE JA TO NESSA MESMA COISA
  if (currentMaxCombo >= 100) { unlockAchievement('reach_100_combo'); }
  if (currentMusicId === 'glimpse' && currentSongHits >= 100) { unlockAchievement('glimpse'); }
  if (currentMusicId === 'likeyoudo' && currentSongHits >= 100) { unlockAchievement('you'); }
  if (currentMusicId === 'fireandflames' && currentSongHits >= 300) { unlockAchievement('ttff_300_notes'); }
  if (rank === 'S') { unlockAchievement('first_s_rank'); }

  if(rankDisplayElement) {
      rankDisplayElement.textContent = `Rank: ${rank}`;
      // rankDisplayElement.className = ''
      rankDisplayElement.classList.add(`rank-${rank}`);
      rankDisplayElement.style.display = 'block';
  }
}

// ==================================
// Funcoes da UI (Skin, Loja, Decorações, Conquistas)
// ==================================
function changeSkin() {
  const selectedSkin = skinSelect.value;
  document.body.className = "";
  if (selectedSkin !== "default") {
    document.body.classList.add(`skin-${selectedSkin}`);
  }
  localStorage.setItem("selectedSkin", selectedSkin);
}

function openShop() {
  console.log("Abrindo a loja...");
  const currentPoints = parseInt(localStorage.getItem('totalAccumulatedPoints')) || 0;
  if (shopPointsDisplay) shopPointsDisplay.textContent = currentPoints;
  if (shopContainer) shopContainer.style.display = 'block';
}

function closeShop() {
  console.log("Fechando a loja.");
  if (shopContainer) shopContainer.style.display = 'none';
}

function displayOwnedDecorations() {
    const ownedDecorations = JSON.parse(localStorage.getItem('ownedDecorations')) || [];
    const spots = document.querySelectorAll('.deco-spot');

    spots.forEach((spot, index) => {
        const intendedItemId = spot.dataset.intendedItem;
        const classesToRemove = Array.from(spot.classList).filter(cls => !cls.startsWith('deco-spot'));
        spot.classList.remove(...classesToRemove);

        if (!intendedItemId) return;

        if (ownedDecorations.includes(intendedItemId)) {
            const className = intendedItemId.replace('deco_', '').replace(/_/g, '-');
            spot.classList.add(className);
        }
    });
}


function comprarItemLoja(itemId, itemCost) {
  let pontosAtuaisTexto = localStorage.getItem('totalAccumulatedPoints');
  let pontosAtuais = parseInt(pontosAtuaisTexto) || 0;

  console.log(`Tentando comprar item: ${itemId}, Custo: ${itemCost}, Pontos atuais: ${pontosAtuais}`);

  if (pontosAtuais >= itemCost) {
    pontosAtuais -= itemCost;
    totalAccumulatedPoints = pontosAtuais;
    localStorage.setItem('totalAccumulatedPoints', totalAccumulatedPoints);

    if(shopPointsDisplay) shopPointsDisplay.textContent = pontosAtuais;
    if(totalPointsDisplay) totalPointsDisplay.textContent = pontosAtuais;

    console.log(`Compra efetuada! Pontos restantes: ${pontosAtuais}`);
    alert(`Item '${itemId}' comprado com sucesso!`);

    if (itemId.startsWith('deco_')) {
        let ownedDecorations = JSON.parse(localStorage.getItem('ownedDecorations')) || [];
        if (!ownedDecorations.includes(itemId)) {
            ownedDecorations.push(itemId);
            localStorage.setItem('ownedDecorations', JSON.stringify(ownedDecorations));
            console.log("Decorações possuídas atualizadas:", ownedDecorations);
            displayOwnedDecorations();
        } else {
            console.log(`Decoração ${itemId} já foi comprada.`);
            alert("Você já possui esta decoração!");
        }
        if (itemId === 'deco_waluigi') { unlockAchievement('buy_waluigi'); }
        if (itemId === 'deco_nectar') { unlockAchievement('buy_nectar'); }
        if (itemId === 'deco_jojito') { unlockAchievement('buy_jojito'); }

    } else if (itemId.startsWith('skin_')) {
        let unlockedSkins = JSON.parse(localStorage.getItem('unlockedSkins')) || [];
        if (!unlockedSkins.includes(itemId)) {
            unlockedSkins.push(itemId);
            localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
            console.log("Skins desbloqueadas:", unlockedSkins);
        }
    }

    return true;
  } else {
    console.log("Pontos insuficientes!");
    alert(`Pontos insuficientes! Você precisa de ${itemCost}, mas só tem ${pontosAtuais}.`);
    return false;
  }
}

function unlockAchievement(id) {
    if (achievements[id] && !achievements[id].unlocked) {
        console.log(`>>> Conquista Desbloqueada: ${achievements[id].name} <<<`);
        achievements[id].unlocked = true;
        if (!unlockedAchievements.includes(id)) {
             unlockedAchievements.push(id);
        }
        console.log("ARRAY ANTES DE SALVAR:", JSON.stringify(unlockedAchievements));
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
        console.log("localStorage.setItem chamado para conquistas.");

        alert(`Conquista Desbloqueada!\n${achievements[id].name}\n${achievements[id].description}`);

        totalAccumulatedPoints += 500;
        localStorage.setItem('totalAccumulatedPoints', totalAccumulatedPoints);
        if(totalPointsDisplay) totalPointsDisplay.textContent = totalAccumulatedPoints;
        if(shopPointsDisplay) shopPointsDisplay.textContent = totalAccumulatedPoints;
    } else if (achievements[id] && achievements[id].unlocked) {
    } else {
        console.warn(`Tentativa de desbloquear conquista inválida ou não definida: ${id}`);
    }
}

function openAchievementsPanel() {
    if (!achievementsList || !achievementsPanel) return;
    achievementsList.innerHTML = ''; 
    const sortedIds = Object.keys(achievements).sort((a, b) => (achievements[b].unlocked ? 1 : 0) - (achievements[a].unlocked ? 1 : 0));

    for (const id of sortedIds) {
        const achievement = achievements[id];
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('achievement-item');
        if (achievement.unlocked) itemDiv.classList.add('unlocked');
        const nameSpan = document.createElement('span'); nameSpan.classList.add('achievement-name'); nameSpan.textContent = achievement.name || '???';
        const descSpan = document.createElement('span'); descSpan.classList.add('achievement-desc'); descSpan.textContent = achievement.description || '---';
        itemDiv.appendChild(nameSpan); itemDiv.appendChild(document.createElement('br')); itemDiv.appendChild(descSpan);
        achievementsList.appendChild(itemDiv);
    }
    achievementsPanel.style.display = 'flex';
}

function closeAchievementsPanel() {
    if (achievementsPanel) achievementsPanel.style.display = 'none';
}

// ==================================
// Event Listeners da Interface
// ==================================
const startButton = document.getElementById("startButton");
if (startButton) { startButton.addEventListener('click', startGame); }
else { console.warn("Botão 'startButton' não encontrado."); }

if (openShopButton) { openShopButton.addEventListener('click', openShop); }
else { console.warn("Botão 'openShopButton' não encontrado."); }

if (closeShopButton) { closeShopButton.addEventListener('click', closeShop); }
else { console.warn("Botão 'closeShopButton' não encontrado."); }

if (buyButtons.length > 0) {
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cost = parseInt(button.getAttribute('data-cost'));
            const itemId = button.getAttribute('data-itemid');
            if (!isNaN(cost) && itemId) comprarItemLoja(itemId, cost);
            else console.error("Botão de compra inválido.", button);
        });
    });
} else { console.warn("Nenhum botão '.buyButton' encontrado."); }

if (skinSelect) { skinSelect.addEventListener("change", changeSkin); }
else { console.warn("Elemento 'skinSelect' não encontrado."); }

if (achievementsButton) { achievementsButton.addEventListener('click', openAchievementsPanel); }
else { console.warn("Botão 'achievementsButton' não encontrado."); }

if (closeAchievementsButton) { closeAchievementsButton.addEventListener('click', closeAchievementsPanel); }
else { console.warn("Botão 'closeAchievementsButton' não encontrado."); }

// ==================================
// Inicializacao ao Carregar a Pagina
// ==================================
window.addEventListener("load", () => {
  console.log("Página carregada. Inicializando...");

  const savedSkin = localStorage.getItem("selectedSkin");
  if (savedSkin && skinSelect) { skinSelect.value = savedSkin; changeSkin(); }

  const savedPoints = localStorage.getItem('totalAccumulatedPoints');
  totalAccumulatedPoints = parseInt(savedPoints) || 0;
  console.log("Pontos totais carregados:", totalAccumulatedPoints);
  if (totalPointsDisplay) { totalPointsDisplay.textContent = totalAccumulatedPoints; }

  console.log("Carregando conquistas do localStorage...");
  try { 
      unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
  } catch (e) {
      console.error("Erro ao carregar conquistas salvas:", e);
      unlockedAchievements = []; 
  }
  console.log("IDs carregados:", unlockedAchievements);
  // eu quero chorar
  for (const id of unlockedAchievements) {
      if (achievements[id]) {
          achievements[id].unlocked = true;
      }
  }

  displayOwnedDecorations();

  console.log("Inicialização completa.");
});


//voce tambem acha que Deus vive no ceu pois ele tem medo de suas proprias criacoes?