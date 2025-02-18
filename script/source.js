const sceneReset = document.getElementById('reset');
const playerCountButton = document.getElementById('playerCount');
const lifeCountButton = document.getElementById('lifePreset');
const diceButton = document.getElementById("diceThrow");

const playerCountPopup = document.getElementById('playerCountPopup');
const lifeCountPopup = document.getElementById('lifeCountPopup');
const colorCountPopup = document.getElementById('colorPopup');

const closePlayerCountPopup = document.getElementById('closePlayerCountPopup');
const closeLifeCountPopup = document.getElementById('closeLifeCountPopup');
const closeColorCountPopup = document.getElementById('closeColorPopup');

let playerCount = 2;
let lifeCount = 20;
let selectedPlayerNumber;
const playerColors = ['#F9F4CB', 'grey', '#F8A37A', 'lightblue', '#9FC79A'];
const colorPopup = document.getElementById('colorPopup');
const closeColorPopup = document.getElementById('closeColorPopup');
let selectedPlayerCounter = null;
let lifeChangeTimeouts = {};
const lastUpdateTimes = {};


document.addEventListener('DOMContentLoaded', () => {
  // Assign colors to players on startup
  assignColorsToPlayers();
  // Initialize life counters on startup
  initializeLifeCounters();
  // Add event listeners for life change buttons
  addLifeChangeListeners();
});

playerCountButton.addEventListener('click', () => {
    playerCountPopup.style.display = 'block';
  });
  
lifeCountButton.addEventListener('click', () => {
    lifeCountPopup.style.display = 'block';
  });
  
closePlayerCountPopup.addEventListener('click', () => {
    playerCountPopup.style.display = 'none';
  });
  
closeLifeCountPopup.addEventListener('click', () => {
    lifeCountPopup.style.display = 'none';
  });
  
closeColorCountPopup.addEventListener('click', () => {
    colorCountPopup.style.display = 'none';
  });
  
  sceneReset.addEventListener('click', () => {
    resetGame();
});

function initializeLifeCounters() {
  const lifeCounters = document.querySelectorAll('.currentLife');
  lifeCounters.forEach(lifeCounter => {
      lifeCounter.textContent = lifeCount;
  });
}

function assignColorsToPlayers() {
    const playerCounters = document.querySelectorAll(`#P${playerCount} .playerCounter`);
    playerCounters.forEach((playerCounter, index) => {
        const color = playerColors[index % playerColors.length];
        playerCounter.style.backgroundColor = color;
    });
}

function addLifeChangeListeners() {
  document.querySelectorAll('.plus').forEach(plusButton => {
      plusButton.addEventListener('click', (event) => {
          const playerCounter = event.currentTarget.closest('.playerCounter');
          const currentLife = playerCounter.querySelector('.currentLife');
          const lifeChange = playerCounter.querySelector('.lifeChange');
          const newLife = parseInt(currentLife.textContent) + 1;
          currentLife.textContent = newLife;
          showLifeChange(lifeChange, 1);
          checkLifeStatus(playerCounter, newLife);
      });
  });

  document.querySelectorAll('.minus').forEach(minusButton => {
    minusButton.addEventListener('click', (event) => {
        const playerCounter = event.currentTarget.closest('.playerCounter');
        const currentLife = playerCounter.querySelector('.currentLife');
        const lifeChange = playerCounter.querySelector('.lifeChange');
        const newLife = parseInt(currentLife.textContent) - 1;
        currentLife.textContent = newLife;
        showLifeChange(lifeChange, -1);
        checkLifeStatus(playerCounter, newLife);
    });
  });
}

function checkLifeStatus(playerCounter, life) {
  if (life <= 0) {
      playerCounter.style.opacity = '0.3';
      playerCounter.querySelector('.currentLife').style.color = 'red';
  } else {
      playerCounter.style.opacity = '1';
      playerCounter.querySelector('.currentLife').style.color = 'black';
  }
}


function showLifeChange(lifeChangeElement, change, isDiceThrow = false) {
  const currentTime = Date.now();
  const lastUpdateTime = lastUpdateTimes[lifeChangeElement.id] || 0;

  // Check if 5000ms has passed since the last update
  if (currentTime - lastUpdateTime > 5000) {
      lifeChangeElement.setAttribute('data-change', '0');
      lifeChangeElement.textContent = '';
  }

  // Update the last update time
  lastUpdateTimes[lifeChangeElement.id] = currentTime;

  // Reset the life change display to 0 before showing the new change
  let currentChange = isDiceThrow ? change : parseInt(lifeChangeElement.getAttribute('data-change') || '0') + change;
  lifeChangeElement.setAttribute('data-change', currentChange);
  lifeChangeElement.textContent = isDiceThrow ? change : (currentChange > 0 ? '+' : '') + currentChange;
  lifeChangeElement.style.opacity = '1';

  // Clear any existing timeout for this element
  if (lifeChangeTimeouts[lifeChangeElement.id]) {
      clearTimeout(lifeChangeTimeouts[lifeChangeElement.id]);
  }

  // Set a new timeout to change the opacity after 500ms
  lifeChangeTimeouts[lifeChangeElement.id] = setTimeout(() => {
      lifeChangeElement.style.opacity = '0.2';
  }, 500);
}


function setPlayerCount(count) {
    playerCount = count;

    // Hide all player counter containers
    const playerContainers = document.querySelectorAll(".counters .counter");
    playerContainers.forEach(container => {
        container.style.display = "none";
    });

    // Show the correct container based on selected player count
    const selectedContainer = document.getElementById(`P${count}`);
    if (selectedContainer) {
        selectedContainer.style.display = "grid";
    }

    // Assign colors to players
    assignColorsToPlayers();

    // Close the popup
    playerCountPopup.style.display = 'none';
}

// Reset life counters
function resetGame() {
  // Reset life counters to the chosen starting life
  initializeLifeCounters();

  // Clear life change displays
  const lifeChanges = document.querySelectorAll('.lifeChange');
  lifeChanges.forEach(lifeChange => {
      lifeChange.style.opacity = '0.2';
      lifeChange.setAttribute('data-change', '0');
      lifeChange.textContent = '';
  });

  // Restore original appearance of player counters
  const playerCounters = document.querySelectorAll('.playerCounter');
  playerCounters.forEach(playerCounter => {
      playerCounter.style.opacity = '1';
      const currentLife = playerCounter.querySelector('.currentLife');
      if (currentLife) {
          currentLife.style.color = 'black';
      }
  });

  // Reset last update times and timeouts
  for (let key in lastUpdateTimes) {
      delete lastUpdateTimes[key];
  }
  for (let key in lifeChangeTimeouts) {
      clearTimeout(lifeChangeTimeouts[key]);
      delete lifeChangeTimeouts[key];
  }
}

// Dice throw
document.querySelector('#diceThrow').addEventListener('click', () => {
  const players = Array.from(document.querySelectorAll('.playerCounter')).filter(player => player.closest('.counter').style.display !== 'none');
  let playerScores = Array(players.length).fill(0);

  function rollDice(round) {
    players.forEach((player, index) => {
      playerScores[index] = Math.floor(Math.random() * 20) + 1;
      const lifeChangeElement = player.querySelector('.lifeChange');
      showLifeChange(lifeChangeElement, playerScores[index], true);
    });

    if (round < 4) {
      setTimeout(() => rollDice(round + 1), 700); // Recursive delay
    } else {
      handleTiebreaker();
    }
  }

  function handleTiebreaker() {
    let maxScore = Math.max(...playerScores);
    let tiedPlayers = playerScores.map((score, index) => score === maxScore ? index : -1).filter(index => index !== -1);
    
    if (tiedPlayers.length > 1) {
      setTimeout(() => {
        tiedPlayers.forEach(index => {
          playerScores[index] = Math.floor(Math.random() * 20) + 1;
          const lifeChangeElement = players[index].querySelector('.lifeChange');
          showLifeChange(lifeChangeElement, playerScores[index], true);
        });
        handleTiebreaker(); // Recursively check for ties again
      }, 700);
    }
  }

  rollDice(0);
});

  // Restore original appearance of player counters
  const playerCounters = document.querySelectorAll('.playerCounter');
  playerCounters.forEach(playerCounter => {
      playerCounter.style.opacity = '1';
      const currentLife = playerCounter.querySelector('.currentLife');
      if (currentLife) {
          currentLife.style.color = 'black';
      }
  });

document.querySelectorAll('.changeColor').forEach(changeColorDiv => {
  changeColorDiv.addEventListener('click', (event) => {
    selectedPlayerCounter = event.currentTarget.closest('.playerCounter');
    colorPopup.style.display = 'block';
  });
});

closeColorPopup.addEventListener('click', () => {
  colorPopup.style.display = 'none';
});

function setColor(colorIndex) {
  const color = playerColors[colorIndex - 1];
  if (selectedPlayerCounter) {
    selectedPlayerCounter.style.backgroundColor = color;
  }
  colorPopup.style.display = 'none';
}

function updateLifeCounters() {
  const currentPlayers = document.querySelectorAll(`#P${playerCount} .playerCounter .currentLife`);
  currentPlayers.forEach((lifeCounter, index) => {
      lifeCounter.textContent = lifeCount; // Set life count
  });
}

function setLifeCount(count) {
    lifeCount = count;
    lifeCountPopup.style.display = 'none';
    updateLifeCounters();
  }

