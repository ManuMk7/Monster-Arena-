window.onload = function() {



    // ==========================================
    // RECUPERO DEGLI ELEMENTI HTML
    // ==========================================

    // Informazioni partita
    const nomeGiocatore = document.getElementById("NomeGiocatore");
    const numMostri = document.getElementById("num-mostri");
    const recordGlobale = document.getElementById("record-globale");

    // Barre HP e MP del giocatore
    const hpGiocatore = document.getElementById("hp-giocatore");
    const mpGiocatore = document.getElementById("mp-giocatore");
    const testoHpGiocatore = document.getElementById("testoHpGiocatore");
    const testoMp = document.getElementById("testoMp");

    // Informazioni mostro
    const nomeMostro = document.getElementById("NomeMostro");
    const hpMostro = document.getElementById("hp-mostro");
    const testoHpMostro = document.getElementById("testoHpMostro");

    // Pulsanti azioni
    const btnAttacco = document.getElementById("attacco");
    const btnMagia = document.getElementById("magia");
    const btnCura = document.getElementById("cura");

    // Game Over
    const gameOver = document.getElementById("game-over");
    const punteggioFinale = document.getElementById("punteggio-finale");
    const btnRestart = document.getElementById("restart");

    // Messaggio ultima azione
    const messaggioAzione = document.getElementById("messaggio-azione");


    // ==========================================
    // RECUPERO DEL RECORD GLOBALE
    // ==========================================
    function aggiornaRecord() {

        fetch("/record")
        .then(response => {

            if (!response.ok) {
                throw new Error("Errore HTTP: " + response.status);
            }

            return response.json();
        })
        .then(data => {

            if (data.name === "" && data.kills === 0) {
                recordGlobale.textContent = "Nessun record disponibile";
            } else {
                recordGlobale.textContent =
                    "Record: " + data.name + " - " +
                    data.kills + " mostri sconfitti";
            }

        })
        .catch(error => {
            console.error("Errore nel recupero del record:", error);
            recordGlobale.textContent = "Record non disponibile";
        });
    }


    // ==========================================
    // AGGIORNAMENTO DELL'INTERFACCIA
    // ==========================================
    function aggiornaInterfaccia(data) {

        // Informazioni giocatore
        nomeGiocatore.textContent = data.name;
        numMostri.textContent = data.kills;

        // HP e MP giocatore
        hpGiocatore.max = data.maxHp;
        hpGiocatore.value = data.hp;

        mpGiocatore.max = data.maxMana;
        mpGiocatore.value = data.mana;

        testoHpGiocatore.textContent =
            data.hp + "/" + data.maxHp;

        testoMp.textContent =
            data.mana + "/" + data.maxMana;

        // Informazioni mostro
        nomeMostro.textContent = data.monster.name;

        hpMostro.max = data.monster.maxHp;
        hpMostro.value = data.monster.hp;

        testoHpMostro.textContent =
            data.monster.hp + "/" + data.monster.maxHp;

        // Messaggio ultima azione
        messaggioAzione.textContent = data.message;

        // Controllo Game Over
        if (data.status === "lost") {

            gameOver.hidden = false;

            punteggioFinale.textContent =
                "Partita terminata! Mostri sconfitti: " + data.kills;

            // Disabilito i pulsanti delle azioni
            btnAttacco.disabled = true;
            btnMagia.disabled = true;
            btnCura.disabled = true;

            // Aggiorno il record dopo la fine della partita
            aggiornaRecord();

        } else {

            gameOver.hidden = true;

            // Gestione disponibilità delle azioni
            btnAttacco.disabled = false;
            btnMagia.disabled = data.mana < 15;
            btnCura.disabled = data.mana < 20;
        }
    }
};