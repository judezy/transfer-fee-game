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
const MAX_HISTORY_LIMIT = 20;

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

    console.clear();
    console.log("⚽ WELCOME TO THE TRANSFER HIGHER OR LOWER GAME ⚽");
    console.log("--------------------------------------------------");
    displayMatchup();
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

function displayMatchup() {
    const p1 = baseTransfers[currentIdx];
    const p2 = baseTransfers[nextIdx];

    console.log(`PLAYER 1: ${p1.name} (${p1.year})`);
    console.log(`Transfer: ${p1.from} -> ${p1.to}`);
    console.log(`Fee: ${getSymbol(p1.currency)}${p1.fee.toLocaleString()}`);
    console.log("--------------------------------------------------");
    console.log(`PLAYER 2: ${p2.name} (${p2.year})`);
    console.log(`Transfer: ${p2.from} -> ${p2.to}`);
    console.log("--------------------------------------------------");
    console.log("👉 Type: guess('higher') or guess('lower')");
}

function guess(choice) {
    const p1 = baseTransfers[currentIdx];
    const p2 = baseTransfers[nextIdx];

    const p1ValueInEUR = getFeeInEUR(p1);
    const p2ValueInEUR = getFeeInEUR(p2);

    const isHigher = p2ValueInEUR >= p1ValueInEUR;
    const userWon = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);

    console.log(`\nReveal: ${p2.name}'s actual fee was ${getSymbol(p2.currency)}${p2.fee.toLocaleString()}`);
    console.log(`(Math check: €${p1ValueInEUR.toLocaleString()} vs €${p2ValueInEUR.toLocaleString()})`);

    if (userWon) {
        score++;
        console.log(`✅ CORRECT! Current Streak: ${score}`);
        console.log("--------------------------------------------------");
        
        currentIdx = nextIdx;
        setNextPlayer();
        
        displayMatchup();
    } else {
        console.log(`❌ WRONG! Game Over.`);
        console.log(`Final Score: ${score}`);
        console.log("👉 Type initGame() to play again.");
    }
}

initGame();