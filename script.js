let score = 0;
let currentPlayer = null;
let nextPlayer = null;

let recentIds = [];
const MAX_HISTORY_LIMIT = 10;


const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_URL = IS_LOCAL ? "http://127.0.0.1:8000/api/players/random" : "/api/players/random";

function createCardHTML(player, isRevealed=False) {
    const symbol = getSymbol(player.currency);
    const formattedFee = `${symbol}${player.fee.toLocaleString()}`;

    if (isRevealed) {
        return `
        <div class="card-year">${player.year}</div>
            <div class="player-info">
                <h2 class="player-name">${player.name}</h2>
                <p class="player-teams">${player.from} to ${player.to}</p>
            </div>
            <div class="price-section">
                <span class="price-label">Market Fee</span>
                <div class="price-value p1-color">${formattedFee}</div>
            </div>
        `;
    } else {
        return `
        <div class="card-year">${player.year}</div>
            <div class="player-info">
                <h2 class="player-name">${player.name}</h2>
                <p class="player-teams">${player.from} to ${player.to}</p>
            </div>
            <div class="price-section">
                <div class="interactive-container">
                    <div class="btn-group" id="uiControls">
                        <button onclick="guess('higher')" class="btn btn-higher">Higher</button>
                        <button onclick="guess('lower')" class="btn btn-lower">Lower</button>
                    </div>
                    <div id="p2Fee" class="reveal-value p1-color hidden"></div>
                </div>
            </div>  
        `;
    }
}

async function fetchRandomPlayer(count=2) {
    try {
        const response = await fetch(`${API_URL}?count=${count}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching random player:", error);
        return null;
    }
}

function getFeeInEUR(player) {
    // converts from GBP to EURO so that we can compare 2 fees fairly
    if (player.currency === "EUR") {
        return player.fee;
    }
    if (player.currency === "GBP") {
        return player.fee * 1.17; // using fixed conversion of £1 = €1.17
    }
    return player.fee;
}

function getSymbol(currencyTag) {
    return currencyTag === "GBP" ? "£" : "€";
}

async function initGame() {
    score = 0;
    recentIds = [];
    
    console.log("Game Starting...");

    const players = await fetchRandomPlayer(2);

    if (players && players.length === 2) {
        currentPlayer = players[0];
        nextPlayer = players[1];

        recentIds.push(currentPlayer.id);
        recentIds.push(nextPlayer.id);

        const belt = document.getElementById("arenaBelt");
        belt.style.transition = "none";
        belt.style.transform = "translateX(0)";

        belt.innerHTML = `
        <div class="player-card" id="card1">${createCardHTML(currentPlayer, true)}</div>
        <div class="player-card" id="card2">${createCardHTML(nextPlayer, false)}</div>
        `;

        document.getElementById('uiScore').innerText = score;

        document.getElementById('loading-overlay').style.opacity = "0";
        setTimeout(() => {
            document.getElementById('loading-overlay').style.display = "none";
            document.getElementById('game-view').classList.add("loaded");
        }, 300);
        
    } else {
        alert("Failed to fetch players. Please try again later.");
    }
}

async function setNextPlayer() {
    let validPick = false;
    let pick;

    while (!validPick) {
        pick = await fetchRandomPlayer(1);
        if (pick && pick.length == 1) {
            const playerPicked = pick[0];

            if (playerPicked.id !== currentPlayer.id && !recentIds.includes(playerPicked.id)) {
                nextPlayer = playerPicked;
                recentIds.push(nextPlayer.id);
                validPick = true;
            }
        }
    }

    if (recentIds.length > MAX_HISTORY_LIMIT) {
        recentIds.shift(); // remove the oldest entry to maintain the size limit
    }
}

function updateUI() {
    if (!currentPlayer || !nextPlayer) return;

    const p1 = currentPlayer;
    const p2 = nextPlayer;

    // replace player 1 details
    document.getElementById('p1Name').innerText = p1.name;
    document.getElementById('p1Year').innerText = p1.year;
    document.getElementById('p1Teams').innerText = `${p1.from} to ${p1.to}`;
    document.getElementById('p1Price').innerText = `${getSymbol(p1.currency)}${p1.fee.toLocaleString()}`;

    // replace player 2 details
    document.getElementById('p2Name').innerText = p2.name;
    document.getElementById('p2Year').innerText = p2.year;
    document.getElementById('p2Teams').innerText = `${p2.from} to ${p2.to}`;

    // refresh
    document.getElementById('uiScore').innerText = score;
    document.getElementById('uiControls').classList.remove('hidden');
    document.getElementById('p2Fee').classList.add('hidden');
}

async function syncHighScoreToCloud(newScore) {
    if (!currentUser) return;

    if (newScore == 0) return;

    const userDocRef = window.firestoreDoc(window.db, 'scores', currentUser.uid);

    try {
        const userDoc = await window.firestoreGetDoc(userDocRef);
        let currentCloudHighScore = 0;

        if (userDoc.exists()) {
            currentCloudHighScore = userDoc.data().highScore || 0;
        }

        if (newScore > currentCloudHighScore) {
            await window.firestoreSetDoc(userDocRef, {
                uid: currentUser.uid,
                username: currentUser.displayName,
                photoURL: currentUser.photoURL,
                highScore: newScore,
                updatedAt: new Date()
            }, {merge: true});

            console.log("New high score synced:", newScore);
        }
    } catch (error) {
        console.error("Error syncing high score:", error);
    }
}

function guess(choice) {
    if (!currentPlayer || !nextPlayer) return;

    const p1ValueInEUR = getFeeInEUR(currentPlayer);
    const p2ValueInEUR = getFeeInEUR(nextPlayer);

    const isHigher = p2ValueInEUR >= p1ValueInEUR;
    const userWon = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);

    const card2 = document.getElementById('card2');
    if (!card2) return;

    const uiControls = card2.querySelector('.btn-group');
    const feeElement = card2.querySelector('.reveal-value');

    if (uiControls) uiControls.classList.add('hidden');
    if (feeElement) {
        feeElement.innerText = `${getSymbol(nextPlayer.currency)}${nextPlayer.fee.toLocaleString()}`;
        feeElement.classList.remove('hidden');
    }

    setTimeout(async () => {
        if (userWon) {
            score++;
            document.getElementById('uiScore').innerText = score;

            currentPlayer = nextPlayer;
            await setNextPlayer();

            const belt = document.getElementById("arenaBelt");

            const nextCard = document.createElement('div');
            nextCard.className = "player-card";
            nextCard.innerHTML = createCardHTML(nextPlayer, false);
            belt.appendChild(nextCard);

            const shiftAmount = nextCard.offsetWidth + 24;
            belt.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
            belt.style.transform = `translateX(-${shiftAmount}px)`;

            setTimeout(() => {
                belt.style.transition = "none";
                belt.removeChild(belt.firstElementChild);
                belt.style.transform = "translateX(0)";

                const cards = belt.querySelectorAll('.player-card');
                if (cards[0]) cards[0].id = "card1";
                if (cards[1]) cards[1].id = "card2";
            }, 600);

        } else {
            if (currentUser) {
                await syncHighScoreToCloud(score);
            }

            alert(`Game Over! Final Score: ${score}`);
            await initGame();
        }
    }, 350);
}

let currentUser = null;

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    try {
      const result = await window.signInWithPopup(window.auth, window.provider);
      console.log("Successfully logged in:", result.user.displayName);
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Sign-in failed.");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await window.signOut(window.auth);
      console.log("Successfully signed out.");
    } catch (error) {
      console.error("Sign-out Error:", error);
    }
  });
}

if (window.onAuthStateChanged) {
  window.onAuthStateChanged(window.auth, (user) => {
    if (user) {
      currentUser = user;
      if (userName) userName.textContent = user.displayName;
      if (userAvatar) userAvatar.src = user.photoURL || 'https://via.placeholder.com/150';
      if (loginBtn) loginBtn.style.display = 'none';
      if (userInfo) userInfo.style.display = 'flex';
    } else {
      currentUser = null;
      if (loginBtn) loginBtn.style.display = 'flex';
      if (userInfo) userInfo.style.display = 'none';
    }
  });
}

initGame();