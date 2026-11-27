const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../client')));

const games = new Map(); //associa ogni gameId (stringa) allo stato della partita

//oggetto record utilizzato per memorizzare il miglior record stabilito nel gioco
const bestRecord = {
    name: "",
    kills: 0
}

const MONSTERS = [
    { name: "Slime", maxHp: 30, minDamage: 5, maxDamage: 9 },
    { name: "Goblin", maxHp: 50, minDamage: 8, maxDamage: 13 },
    { name: "Orc", maxHp: 70, minDamage: 11, maxDamage: 17 }
];

function randomNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*funzione che crea una copia di un oggetto monster, dato che non sarebbe buona pratica agire
direttamente sugli oggetti modello*/
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

//funzione che formatta la risposta json con la struttura richiesta, in base al parametro game specificato
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

//funzione che controlla post azione del giocatore lo stato del mostro e in caso contrattacca
function turn(game, action){
    let log = action;
    if(game.monster.hp <= 0){
        game.kills++;
        game.mana = Math.min(game.maxMana, game.mana + 10);

        const newMonster = createMonster();
        game.monster = newMonster;
        log += ` You defeated the monster! A new ${newMonster.name} has appeared.`;
    }
    else {
        const monsterDamage = randomNumber(game.monster.minDamage, game.monster.maxDamage);
        game.hp = Math.max(0, game.hp - monsterDamage);
        log += ` The ${game.monster.name} attacks you for ${monsterDamage} damage.`;

        if(game.hp <= 0){
            game.status = "lost";
            if(game.kills > bestRecord.kills){
                bestRecord.name = game.name;
                bestRecord.kills = game.kills;
            }
        }
    }

    game.message = log;
}

app.post("/start", (req, res) => {
    const playerName = req.body.name.trim();
    if(playerName == "")
        return res.status(400).json({ error: "Name of the player is not valid" });

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
            message: `A ${firstMonster.name} has appeared!.`
    }

    const gameId = crypto.randomUUID();

    games.set(gameId, newGame);

    //imposta il cookie per il gameId
    res.cookie('gameId', gameId, { httpOnly: true });
    res.status(201).json(getGameState(newGame));
})

app.get("/state", (req, res) => {
    const gameId = req.cookies.gameId;
    const game = games.get(gameId);

    if (!game){
        return res.status(404).json({ error: "No Game found" });
    }

    res.json(getGameState(game));
});

app.get("/record", (req, res) => {
    res.json(bestRecord);
})

app.post("/attack", (req, res) => {
    const gameId = req.cookies.gameId;
    const game = games.get(gameId);

    if (!game){
        return res.status(404).json({ error: "No Game found" });
    }

    const damage = randomNumber(10, 18);
    game.monster.hp = Math.max(0, game.monster.hp - damage);
    game.mana = Math.min(game.maxMana, game.mana + 5);

    const action = `Attack the ${game.monster.name} for ${damage} damage.`;
    turn(game, action);

    res.json(getGameState(game));
});

app.post("/magic", (req, res) => {
    const gameId = req.cookies.gameId;
    const game = games.get(gameId);

    if (!game){
        return res.status(404).json({ error: "No Game found" });
    }

    if(game.mana < 15){
        return res.status(400).json({ error: "You don't have enough mana to use this spell" });//error 400 consigliato da code se hai idee migliori cambialo
    }

    const damage = randomNUmber(25, 35);
    game.monster.hp = Math.max(0, game.monster.hp - damage);
    game.mana -= 15;

    const action = `Cast a spell on the ${game.monster.name} for ${damage} damage.`;//code mi ha fatto cambiare quasi obbligatoriamente le liniette per le string...
    turn(game, action);

    res.json(getGameState(game));
})

app.post("/heal", (req, res) => {
    const gameId = req.cookies.gameId;
    const game = games.get(gameId);

    if (!game){
        return res.status(404).json({ error: "No Game found" });
    }

    if(game.mana < 20){
        return res.status(400).json({ error: "You don't have enough mana to use this spell" });
    }

    const healAmount = randomNumber(15, 25);
    game.hp = Math.min(game.maxHp, game.hp + healAmount);
    game.mana -= 20;

    const action = `Heal yourself for ${healAmount} HP.`;
    turn(game, action);

    res.json(getGameState(game));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//le chiamate le ho implementate tutte, cambia quello che credi giusto
//il record l'ho solo gestito su turn cambiando quello vecchio con quello nuovo,
//ma se vogliamo far vedere anche il record della partita in gioco va implementato