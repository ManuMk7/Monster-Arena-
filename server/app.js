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
            message: `A ${monster.name} has appeared!.`
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

    if(!game)
        return res.status(404).json({ error: "No Game found" });

    res.json(getGameState(game));
});

app.get("/record", (req, res) => {
    res.json(bestRecord);
})

//funzione che controlla post azione del giocatore lo stato del mostro e in caso gestisce il contrattacco
function turn(game, action){
    if(game.monster.hp <= 0){
        //il giocatore ha sconfitto il mostro
        game.kills++;
        
        game.mana += 10;
        if(game.mana > game.maxMana)
            game.mana = game.maxMana;

        const newMonster = createMonster();
        game.monster = newMonster;
        action += ` You defeated the monster! A new ${newMonster.name} has appeared.`;
    }
    else{
        //contrattacco
        const monsterDamage = randomNumber(game.monster.minDamage, game.monster.maxDamage);

        game.hp -= monsterDamage;
        if(game.hp < 0)
            game.hp = 0;

        action += ` The ${game.monster.name} attacks you for ${monsterDamage} damage.`;

        if(game.hp == 0){
            //il giocatore è stato sconfitto
            game.status = "lost";
            action += " You are dead!";

            if(game.kills > bestRecord.kills){
                bestRecord.name = game.name;
                bestRecord.kills = game.kills;
            }
        }
    }

    game.message = action;
}

app.post("/attack", (req, res) => {
    const gameId = req.cookies.gameId;
    const game = games.get(gameId);

    if(!game)
        return res.status(404).json({ error: "No Game found" });

    const damage = randomNumber(10, 18);
    
    game.monster.hp -= damage;
    if(game.monster.hp < 0)
        game.monster.hp = 0; //se l'hp del mostro diventa negativo quando viene sconfitto, si imposta a 0 per preferenza grafica in HTML

    game.mana += 5;
    if(game.mana > game.maxMana)
        game.mana = game.maxMana; //se la mana sfora maxMana, viene impostata al valore massimo di mana possibile 

    const action = `Attack the ${game.monster.name} for ${damage} damage.`;
    turn(game, action);

    res.json(getGameState(game));
});

app.post("/magic", (req, res) => {
    const gameId = req.cookies.gameId;
    const game = games.get(gameId);

    if(!game)
        return res.status(404).json({ error: "No Game found" });

    if(game.mana < 15)
        return res.status(400).json({ error: "You don't have enough mana to use this spell" });

    const damage = randomNumber(25, 35);
    
    game.monster.hp -= damage;
    if(game.monster.hp < 0)
        game.monster.hp = 0;

    game.mana -= 15;

    const action = `Cast a spell on the ${game.monster.name} for ${damage} damage.`;
    turn(game, action);

    res.json(getGameState(game));
})

app.post("/heal", (req, res) => {
    const gameId = req.cookies.gameId;
    const game = games.get(gameId);

    if(!game)
        return res.status(404).json({ error: "No Game found" });

    if(game.mana < 20)
        return res.status(400).json({ error: "You don't have enough mana to use this spell" });

    const healAmount = randomNumber(15, 25);

    game.hp += healAmount;
    if(game.hp > game.maxHp)
        game.hp = game.maxHp;

    game.mana -= 20;

    const action = `Heal yourself for ${healAmount} HP.`;
    turn(game, action);

    res.json(getGameState(game));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});