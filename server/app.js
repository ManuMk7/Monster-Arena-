const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../client')));

const MONSTERS = [
    { name: "Slime", maxHp: 30, minDamage: 5, maxDamage: 9 },
    { name: "Goblin", maxHp: 50, minDamage: 8, maxDamage: 13 },
    { name: "Orc", maxHp: 70, minDamage: 11, maxDamage: 17 }
];

function randomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createMonster(){
    const monster = MONSTERS[randomNumber(0, 2)];
    
    return{
        name: monster.name,
        hp: monster.maxHp,
        maxHp: monster.maxHp,
        minDamage: monster.minDamage,
        maxDamage: monster.maxDamage
    }
}

function getGameState(game){
    return {
        name: game.name,
        hp: game.hp,
        maxHp: game.maxHp,
        mana: game.mana,
        maxMana: game.maxMana,
        kills: game.kills,
        status: game.status,
        monster: {
            name: game.monster.name,
            hp: game.monster.hp,
            maxHp: game.monster.maxHp
        },
        message: game.message
    };
}

app.post("/start", (req, res) => {
    const playerName = req.body.name.trim();
    if(playerName == "")
        return res.status(400).json({ error: "Il nome del giocatore non è valido" });

    const monster = createMonster();

    const newGame = {
            name: playerName,
            hp: 100,
            maxHp: 100,
            mana: 60,
            maxMana: 60,
            kills: 0,
            status: "playing",
            monster: monster,
            message: `È apparso un ${firstMonster.name}!.`
    }

    const gameId = crypto.randomUUID();

    games.set(gameId, newGame);

    res.cookie('gameId', gameId, { httpOnly: true });
    res.status(201).json(getGameState(newGame));
})