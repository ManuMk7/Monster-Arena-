window.onload = function() {

    // Recupero degli elementi HTML
    const nomeGiocatore = document.getElementById("NomeGiocatore");
    const submit = document.getElementById("submit");
    const recordAttuale = document.getElementById("record-attuale");


    // Recupero del record globale
    fetch("/record")
        .then(response => {

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


    // Recupero i valori inseriti dall'utente
    submit.addEventListener("click", function(event) {

        event.preventDefault();

        const nome = nomeGiocatore.value;

        console.log(nome);

    });

}