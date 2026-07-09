const baseTransfers = [
  { name: "Neymar Jr", from: "Barcelona", to: "PSG", year: 2017, fee: 222000000, currency: "EUR", theme: "psg" },
  { name: "Kylian Mbappé", from: "Monaco", to: "PSG", year: 2018, fee: 180000000, currency: "EUR", theme: "psg" },
  { name: "Jack Grealish", from: "Aston Villa", to: "Manchester City", year: 2021, fee: 100000000, currency: "GBP", theme: "mancity" },
  { name: "Declan Rice", from: "West Ham", to: "Arsenal", year: 2023, fee: 105000000, currency: "GBP", theme: "arsenal" },
  { name: "Erling Haaland", from: "Dortmund", to: "Manchester City", year: 2022, fee: 60000000, currency: "EUR", theme: "mancity" }
];

let score = 0;
let currentIdx = 0;
let nextIdx = 1;

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
    currentIdx = 0;
    nextIdx = 1;
    console.clear();
    console.log("⚽ WELCOME TO THE TRANSFER HIGHER OR LOWER GAME ⚽");
    console.log("--------------------------------------------------");
    displayMatchup();
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
        nextIdx = (nextIdx + 1) % baseTransfers.length; 
        
        displayMatchup();
    } else {
        console.log(`❌ WRONG! Game Over.`);
        console.log(`Final Score: ${score}`);
        console.log("👉 Type initGame() to play again.");
    }
}

initGame();