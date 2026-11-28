window.onload = function() {

    // Recupero degli elementi HTML
    const nomeGiocatore = document.getElementById("NomeGiocatore");
    const submit = document.getElementById("submit");
    const recordAttuale = document.getElementById("record-attuale");


    // Recupero i valori inseriti dall'utente
    submit.addEventListener("click", function(event) {

        event.preventDefault();

        const nome = nomeGiocatore.value;

        console.log(nome);

    });

}