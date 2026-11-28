window.onload = function() {

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

};