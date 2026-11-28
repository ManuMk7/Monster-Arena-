window.onload = function() {

    // Recupero degli elementi HTML
    const nomeGiocatore = document.getElementById("NomeGiocatore");
    const submit = document.getElementById("submit");
    const recordAttuale = document.getElementById("record-attuale");


    // Recupero del record globale
    fetch("/record")
        .then(response => {
            
            // Controllo la sisposta
            if (!response.ok) {
                throw new Error("Errore HTTP: " + response.status);
            }

            return response.json();
        })
        .then(data => {

            if (data.name === "" && data.kills === 0) {
                // Nessun record disponibile
                recordAttuale.textContent = "Nessun record disponibile";

            }
            else {
                // Record disponibile
                recordAttuale.textContent = data.name + " - " + data.kills + " mostri sconfitti";
            }

        })
        .catch(error => {

            console.error(error);
            recordAttuale.textContent = "Impossibile recuperare il record";

        });

    
    // Controllo se esiste una partita in corso lasciata in sospeso
    fetch("/state")
        .then(response => {
            
            // Controllo la risposta
            if (response.status === 200) {
                // Riposta ok: esiste una partita avviata quindi reindirizzo su game.html
                window.location.href = "game.html";

            }
            else if (response.status === 404) {

                // Nessuna partita attiva: rimango in index.html

            }
            else {

                throw new Error("Errore HTTP: " + response.status);

            }
        })
        .catch(error => {

            console.error(error);

        })


    // Recupero i valori inseriti dall'utente
    submit.addEventListener("click", function(event) {

        event.preventDefault();

        const nome = nomeGiocatore.value.trim();    // trim() elimina gli spazzi iniziali e finali restituendo una nuova stringa

        
        if (nome === "") {
            
            // Nome vuoto non valido
            alert("Inserisci un nome valido!");
            return;
            
        }
        else {
            
            // Nome valido
            console.log(nome);

        }

    });

}