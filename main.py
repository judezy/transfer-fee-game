from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "game.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            from_club TEXT NOT NULL,
            to_club TEXT NOT NULL,
            year INTEGER NOT NULL,
            fee INTEGER NOT NULL,
            currency TEXT NOT NULL,
            theme TEXT NOT NULL
        )
    """)
    
    cursor.execute("SELECT COUNT(*) FROM players")
    if cursor.fetchone()[0] == 0:
        print("Empty database detected! Adding initial players...")
        initial_players = [
            ("Neymar Jr", "Barcelona", "PSG", 2017, 222000000, "EUR", "psg"),
            ("Kylian Mbappé", "Monaco", "PSG", 2018, 180000000, "EUR", "psg"),
            ("Jack Grealish", "Aston Villa", "Manchester City", 2021, 100000000, "GBP", "mancity"),
            ("Declan Rice", "West Ham", "Arsenal", 2023, 105000000, "GBP", "arsenal"),
            ("Erling Haaland", "Dortmund", "Manchester City", 2022, 60000000, "EUR", "mancity"),
            ("Philippe Coutinho", "Liverpool", "Barcelona", 2018, 135000000, "EUR", "barcelona"),
            ("Ousmane Dembélé", "Dortmund", "Barcelona", 2017, 135000000, "EUR", "barcelona"),
            ("Paul Pogba", "Juventus", "Manchester United", 2016, 89000000, "GBP", "manunited"),
            ("Gareth Bale", "Tottenham", "Real Madrid", 2013, 85300000, "GBP", "realmadrid"),
            ("Cristiano Ronaldo", "Real Madrid", "Juventus", 2018, 117000000, "EUR", "juventus"),
            ("Jude Bellingham", "Dortmund", "Real Madrid", 2023, 103000000, "EUR", "realmadrid"),
            ("Moisés Caicedo", "Brighton", "Chelsea", 2023, 115000000, "GBP", "chelsea"),
            ("Enzo Fernández", "Benfica", "Chelsea", 2023, 106800000, "GBP", "chelsea"),
            ("Harry Maguire", "Leicester City", "Manchester United", 2019, 80000000, "GBP", "manunited"),
            ("Virgil van Dijk", "Southampton", "Liverpool", 2018, 75000000, "GBP", "liverpool"),
            ("Romelu Lukaku", "Inter Milan", "Chelsea", 2021, 97500000, "GBP", "chelsea"),
            ("Zinedine Zidane", "Juventus", "Real Madrid", 2001, 77500000, "EUR", "realmadrid"),
            ("Luis Suárez", "Liverpool", "Barcelona", 2014, 82000000, "EUR", "barcelona"),
            ("Kai Havertz", "Bayer Leverkusen", "Chelsea", 2020, 80000000, "EUR", "chelsea"),
            ("Jadon Sancho", "Dortmund", "Manchester United", 2021, 73000000, "GBP", "manunited"),
            ("Harry Kane", "Tottenham", "Bayern Munich", 2023, 95000000, "EUR", "bayern"),
            ("Kevin De Bruyne", "Wolfsburg", "Manchester City", 2015, 55000000, "GBP", "mancity")
        ]
        
        cursor.executemany("""
            INSERT INTO players (name, from_club, to_club, year, fee, currency, theme)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, initial_players)
        conn.commit()
        
    conn.close()

init_db()

@app.get("/api/players/random") # to get a random player
def get_random_players(count: int = Query(default=2, ge=1)):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            id, 
            name, 
            from_club as [from], 
            to_club as [to], 
            year, 
            fee, 
            currency, 
            theme 
        FROM players 
        ORDER BY RANDOM() 
        LIMIT ?
    """, (count,))
    
    players = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return players