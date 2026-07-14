const baseTransfers = [
  { name: "Neymar Jr", from: "Barcelona", to: "PSG", year: 2017, fee: 222000000, currency: "EUR", theme: "psg" },
  { name: "Kylian Mbappé", from: "Monaco", to: "PSG", year: 2018, fee: 180000000, currency: "EUR", theme: "psg" },
  { name: "Jack Grealish", from: "Aston Villa", to: "Manchester City", year: 2021, fee: 100000000, currency: "GBP", theme: "mancity" },
  { name: "Declan Rice", from: "West Ham", to: "Arsenal", year: 2023, fee: 105000000, currency: "GBP", theme: "arsenal" },
  { name: "Erling Haaland", from: "Dortmund", to: "Manchester City", year: 2022, fee: 60000000, currency: "EUR", theme: "mancity" },
  { name: "Philippe Coutinho", from: "Liverpool", to: "Barcelona", year: 2018, fee: 135000000, currency: "EUR", theme: "barcelona" },
  { name: "Ousmane Dembélé", from: "Dortmund", to: "Barcelona", year: 2017, fee: 135000000, currency: "EUR", theme: "barcelona" },
  { name: "Paul Pogba", from: "Juventus", to: "Manchester United", year: 2016, fee: 89000000, currency: "GBP", theme: "manunited" },
  { name: "Gareth Bale", from: "Tottenham", to: "Real Madrid", year: 2013, fee: 85300000, currency: "GBP", theme: "realmadrid" },
  { name: "Cristiano Ronaldo", from: "Real Madrid", to: "Juventus", year: 2018, fee: 117000000, currency: "EUR", theme: "juventus" },
  { name: "Jude Bellingham", from: "Dortmund", to: "Real Madrid", year: 2023, fee: 103000000, currency: "EUR", theme: "realmadrid" },
  { name: "Moisés Caicedo", from: "Brighton", to: "Chelsea", year: 2023, fee: 115000000, currency: "GBP", theme: "chelsea" },
  { name: "Enzo Fernández", from: "Benfica", to: "Chelsea", year: 2023, fee: 106800000, currency: "GBP", theme: "chelsea" },
  { name: "Harry Maguire", from: "Leicester City", to: "Manchester United", year: 2019, fee: 80000000, currency: "GBP", theme: "manunited" },
  { name: "Virgil van Dijk", from: "Southampton", to: "Liverpool", year: 2018, fee: 75000000, currency: "GBP", theme: "liverpool" },
  { name: "Romelu Lukaku", from: "Inter Milan", to: "Chelsea", year: 2021, fee: 97500000, currency: "GBP", theme: "chelsea" },
  { name: "Zinedine Zidane", from: "Juventus", to: "Real Madrid", year: 2001, fee: 77500000, currency: "EUR", theme: "realmadrid" },
  { name: "Luis Suárez", from: "Liverpool", to: "Barcelona", year: 2014, fee: 82000000, currency: "EUR", theme: "barcelona" },
  { name: "Kai Havertz", from: "Bayer Leverkusen", to: "Chelsea", year: 2020, fee: 80000000, currency: "EUR", theme: "chelsea" },
  { name: "Jadon Sancho", from: "Dortmund", to: "Manchester United", year: 2021, fee: 73000000, currency: "GBP", theme: "manunited" },
  { name: "Harry Kane", from: "Tottenham", to: "Bayern Munich", year: 2023, fee: 95000000, currency: "EUR", theme: "bayern" },
  { name: "Kevin De Bruyne", from: "Wolfsburg", to: "Manchester City", year: 2015, fee: 55000000, currency: "GBP", theme: "mancity" }
];

let score = 0;
let currentIdx = 0;
let nextIdx = 1;

let recentIndices = [];
const MAX_HISTORY_LIMIT = Math.min(20, Math.floor(baseTransfers.length / 2)); // the maximum number of recent indices to track, to avoid repeats, is the lowest of either 20, or half the size of the list

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

function initGame() {
    score = 0;
    recentIndices = [];

    currentIdx = getRandomPlayerIndex();
    recentIndices.push(currentIdx);

    setNextPlayer();
    console.log("Game Starting...");

    updateUI();
}

function getRandomPlayerIndex() {
    return Math.floor(Math.random() * baseTransfers.length);
}

function setNextPlayer() {
    let validPick = false;
    let pick;

    while (!validPick) {
        pick = getRandomPlayerIndex();
        
        if (pick !== currentIdx && !recentIndices.includes(pick)) {
            validPick = true;
        }
    }

    // got a valid pick now, so update variables
    nextIdx = pick;
    recentIndices.push(nextIdx);

    if (recentIndices.length > MAX_HISTORY_LIMIT) {
        recentIndices.shift(); // remove the oldest entry (index 0)
    }
}

function updateUI() {
    const p1 = baseTransfers[currentIdx];
    const p2 = baseTransfers[nextIdx];

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
    const p1 = baseTransfers[currentIdx];
    const p2 = baseTransfers[nextIdx];

    const p1ValueInEUR = getFeeInEUR(p1);
    const p2ValueInEUR = getFeeInEUR(p2);

    const isHigher = p2ValueInEUR >= p1ValueInEUR;
    const userWon = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);

    document.getElementById('uiControls').classList.add('hidden');

    const feeElement = document.getElementById('p2Fee');
    feeElement.innerText = `${getSymbol(p2.currency)}${p2.fee.toLocaleString()}`;
    feeElement.classList.remove('hidden');

    setTimeout(async () => {
        if (userWon) {
            score++;
            currentIdx = nextIdx;
            setNextPlayer();
            updateUI();
        } else {
            if (currentUser) {
                await syncHighScoreToCloud(score);
            }

            alert(`Game Over! Final Score: ${score}`);
            initGame();
        }
    }, 2000);
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