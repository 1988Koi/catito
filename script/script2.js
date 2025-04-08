// ==================================
// Variaveis Globais
// ==================================
let audio = null;
let combo = 0;
let score = 0;
let totalAccumulatedPoints = parseInt(localStorage.getItem('totalAccumulatedPoints'));
if (isNaN(totalAccumulatedPoints)) totalAccumulatedPoints = 10000;
let activeNotes = [];
let lastSpawnIndex = 0;
let gameLoopRequestId = null;
let currentSongHits = 0;
let currentSongTotalNotes = 0;
let currentMaxCombo = 0;
let purchasedItems = JSON.parse(localStorage.getItem('purchasedItems')) || [];
let unlockedAchievements = [];

// ==================================
// Mapa de Notas Manual
// ==================================


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
const achievementsList = document.getElementById("achievementsList");
const closeAchievementsButton = document.getElementById("closeAchievementsButton");

// ==================================
// Configuracoes e Constantes
// ==================================
const laneKeys = { d: 0, f: 1, j: 2, k: 3 };
const hitWindowTop = 450;
const hitWindowBottom = 330;

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
    'buy_goku': { name: "It's me", description: "I heard you are pretty strong.", unlocked: false },
};

// ==================================
// Listeners Globais e Funções de Utilidade (Jogo)
// ==================================
document.addEventListener("keydown", (e) => {
  if (laneKeys.hasOwnProperty(e.key)) {
    checkHit(laneKeys[e.key]);
  }
});

function showHit() {
  hitText.style.display = "block";
  setTimeout(() => (hitText.style.display = "none"), 300);
}

function spawnNote(lane) {
  const el = document.createElement("div");
  el.classList.add("note", `lane-${lane}`);
  el.style.top = "0px";
  el.textContent = ["D", "F", "J", "K"][lane];
  container.appendChild(el);
  return el; 
}

function updateNotes() {
  [...activeNotes].forEach((noteData, index) => {
     if (!noteData || !noteData.el) return; 

     const top = parseFloat(noteData.el.style.top);
     noteData.el.style.top = `${top + 5}px`; 

     if (top > 580 && !noteData.hit) { 
       noteData.hit = true; 
       combo = 0;
       comboText.textContent = combo;
       if (noteData.el.parentNode) { 
          noteData.el.remove(); 
       }
       activeNotes.splice(index - (activeNotes.length - [...activeNotes].length), 1); 
     }
  });
  activeNotes = activeNotes.filter(n => n && !n.hit);
}


function checkHit(lane) {
  const candidates = activeNotes.filter(noteData => {
      if (!noteData || !noteData.el || noteData.hit) {
          return false;
      }
      const top = parseFloat(noteData.el.style.top);
      return noteData.lane === lane && top > hitWindowBottom && top < hitWindowTop;
  });

  if (candidates.length === 0) {
      return;
  }

  let targetNoteData = candidates[0];
  if (candidates.length > 1) {
      candidates.sort((a, b) => {
          const topA = parseFloat(a.el.style.top);
          const topB = parseFloat(b.el.style.top);
          return topB - topA;
      });
      targetNoteData = candidates[0];
  }

  if (targetNoteData && !targetNoteData.hit) {

       targetNoteData.hit = true; 
       score += 100;
       combo++;
       currentSongHits++;
       currentMaxCombo = Math.max(currentMaxCombo, combo);

       comboText.textContent = combo;
       scoreText.textContent = score;
       if (rankDisplayElement) {
           rankDisplayElement.textContent = currentSongHits;
       }

       showHit();

       if (targetNoteData.el.parentNode) {
           targetNoteData.el.remove();
       }
  }
}

function gameLoop() {
    if (!audio || audio.paused) { gameLoopRequestId = null; return; }
    updateNotes();
    gameLoopRequestId = requestAnimationFrame(gameLoop);
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

  const chart = noteMaps[selectedMusic];
  if (chart && Array.isArray(chart)) {
    currentSongTotalNotes = chart.length; 
    console.log(`Mapa de notas para ${selectedMusic} carregado: ${currentSongTotalNotes} notas.`);

    chart.forEach(noteInfo => {
      if (noteInfo && typeof noteInfo.time === 'number' && typeof noteInfo.lane === 'number') {
        setTimeout(() => {
           if (audio && !audio.paused && !audio.ended) {
                const noteElement = spawnNote(noteInfo.lane);
                activeNotes.push({ el: noteElement, lane: noteInfo.lane, hit: false });
           }
        }, noteInfo.time);
      } else {
         console.warn("Informação de nota inválida no noteMap:", noteInfo);
      }
    });

    audio.play().then(() => {
        console.log("Áudio iniciado, game loop iniciado.");
        if (!gameLoopRequestId) {
            gameLoopRequestId = requestAnimationFrame(gameLoop);
        }
    }).catch(err => {
        console.error("Erro ao tocar áudio:", err);
        alert("Clique na tela antes de iniciar.");
    });

  } else {
    alert(`Erro: Mapa de notas não encontrado ou inválido para a música "${selectedMusic}"! Verifique o objeto 'noteMaps'.`);
    console.error(`Mapa de notas não encontrado ou inválido para: ${selectedMusic}`);
  }
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
  } else { console.log("Rank não calculado (Total de notas desconhecido)."); }

  totalAccumulatedPoints += score;
  localStorage.setItem('totalAccumulatedPoints', totalAccumulatedPoints);
  console.log("Pontos totais salvos:", totalAccumulatedPoints);
  if (totalPointsDisplay) totalPointsDisplay.textContent = totalAccumulatedPoints;
  if (shopPointsDisplay && shopContainer.style.display === 'block') shopPointsDisplay.textContent = totalAccumulatedPoints;

  if (gameLoopRequestId) { cancelAnimationFrame(gameLoopRequestId); gameLoopRequestId = null; console.log("Loop parado."); }

  alert(`Música finalizada!\nRank: ${rank}\nPrecisão: ${accuracy.toFixed(1)}% (${currentSongHits}/${currentSongTotalNotes})\nMax Combo: ${currentMaxCombo}\nPontuação: ${score}\nTotal Acumulado: ${totalAccumulatedPoints}`);

  const currentMusicId = musicSelect.value;

  if (currentMaxCombo >= 100) { unlockAchievement('reach_100_combo'); }
  if (currentMusicId === 'glimpse' && currentSongHits >= 100) { unlockAchievement('glimpse'); }
  if (currentMusicId === 'likeyoudo' && currentSongHits >= 100) { unlockAchievement('you'); }
  if (currentMusicId === 'fireandflames' && currentSongHits >= 300) { unlockAchievement('ttff_300_notes'); }
  if (rank === 'S') { unlockAchievement('first_s_rank'); }
  if(rankDisplayElement) {
      rankDisplayElement.textContent = `Rank: ${rank}`;
      rankDisplayElement.classList.add(`rank-${rank}`);
      rankDisplayElement.style.display = 'block';
  }
}

// ==================================
// Funcoes UI (Skin, Loja, Decorações, Conquistas)
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
    console.log("--- Iniciando displayOwnedDecorations ---");
    console.log("Itens comprados (inclui decorações):", purchasedItems);
    const spots = document.querySelectorAll('.deco-spot');
    console.log(`Encontrados ${spots.length} spots com a classe .deco-spot`);

    spots.forEach((spot) => {
        const intendedItemId = spot.dataset.intendedItem;
        const classesToRemove = Array.from(spot.classList).filter(cls => !cls.startsWith('deco-spot'));
        spot.classList.remove(...classesToRemove);

        if (!intendedItemId) return;

        if (purchasedItems.includes(intendedItemId)) {
            console.log(`Item ${intendedItemId} comprado. Aplicando classe.`);
            const className = intendedItemId.replace('deco_', '').replace(/_/g, '-');
            spot.classList.add(className);
        }
    });
    console.log("--- Finalizando displayOwnedDecorations ---");
}

function comprarItemLoja(itemId, itemCost) {
  let pontosAtuais = totalAccumulatedPoints;

  console.log(`Tentando comprar item: ${itemId}, Custo: ${itemCost}, Pontos atuais: ${pontosAtuais}`);

  if (pontosAtuais >= itemCost) {
    totalAccumulatedPoints = pontosAtuais - itemCost;
    localStorage.setItem('totalAccumulatedPoints', totalAccumulatedPoints);

    if(shopPointsDisplay) shopPointsDisplay.textContent = totalAccumulatedPoints;
    if(totalPointsDisplay) totalPointsDisplay.textContent = totalAccumulatedPoints;

    console.log(`Compra efetuada! Pontos restantes: ${totalAccumulatedPoints}`);
    alert(`Item '${itemId}' comprado com sucesso!`);

    if (!purchasedItems.includes(itemId)) {
        purchasedItems.push(itemId);
        localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems)); 
        console.log("Lista de itens comprados atualizada:", purchasedItems);

        if (itemId.startsWith('deco_')) {
            displayOwnedDecorations();
            if (itemId === 'deco_waluigi') { unlockAchievement('buy_waluigi'); }
            if (itemId === 'deco_nectar') { unlockAchievement('buy_nectar'); }
            if (itemId === 'deco_jojito') { unlockAchievement('buy_jojito'); }
            if (itemId === 'deco_goku') { unlockAchievement('buy_goku'); }
        }
        else if (itemId.startsWith('skin_')) {
             console.log(`Skin ${itemId} adicionada aos itens comprados.`);
        }

    } else {
        console.log(`Item ${itemId} já foi comprado anteriormente.`);
        alert("Você já comprou este item!");
        return;
    }

    return true;
  } else {
    console.log("Pontos insuficientes!");
    alert(`Pontos insuficientes! Você precisa de ${itemCost}, mas só tem ${totalAccumulatedPoints}.`);
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
        console.log("ARRAY DE CONQUISTAS ANTES DE SALVAR:", JSON.stringify(unlockedAchievements));
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
// Event Listeners da Interface (Restaurados/Verificados)
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
// Inicializacao ao Carregar a Pagina (Restaurada e Corrigida)
// ==================================
window.addEventListener("load", () => {
  console.log("Página carregada. Inicializando...");

  const savedSkin = localStorage.getItem("selectedSkin");
  if (savedSkin && skinSelect) { skinSelect.value = savedSkin; changeSkin(); }

  console.log("Pontos totais iniciais:", totalAccumulatedPoints);
  if (totalPointsDisplay) { totalPointsDisplay.textContent = totalAccumulatedPoints; }

   console.log("Itens comprados carregados:", purchasedItems);

  console.log("Carregando conquistas do localStorage...");
  try {
      unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
  } catch (e) {
      console.error("Erro ao carregar conquistas salvas:", e);
      unlockedAchievements = [];
  }
  console.log("IDs de conquistas carregados:", unlockedAchievements);
  for (const id of unlockedAchievements) {
      if (achievements[id]) {
          achievements[id].unlocked = true;
      }
  }

  displayOwnedDecorations();

  console.log("Inicialização completa.");
});