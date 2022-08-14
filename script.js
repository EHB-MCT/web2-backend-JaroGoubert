//import Team from "./team.js";


//let list = [];
let boardgame = [];
let loading = true;
//let team1 = new Team();
/*let message = {
    value: '',
    type: ''
};*/

async function getData() {
    loading = true;
    const reponse = await fetch('https://api.boardgameatlas.com/api/search?order_by=rank&ascending=false&pretty=true&client_id=JLBr5npPhV')
    const data = await reponse.json();
    boardgame = data.games;
}

getData()
    .then(() => {
        buildList();
    })
    .finally(() => {
        loading = false;
    });
//refreshTeam();
setTimeout(log, 3000);

function log() {
    console.log(boardgame);
}
function buildList() {
    let html = '';
    for (let b of boardgame) {
        html += `<div class="card" style="width: 10rem; margin:3px;">
        <img class="card-img-top" src="${b.image_url}" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">${b.name}</h5>
            <p class="card-text">Types TBD</p>
            <a href="#" id="${b.id}"class="btn btn-primary">Add to team</a>
        </div>
    </div>`
    }
    document.getElementById('list').innerHTML = html;

    //add event listeners
    /* document.querySelectorAll('.btn').forEach(button => {
         button.addEventListener('click', event => {
             console.log(event.target.id);
             let p = boardgame.find(element => element.id == event.target.id);
             message = team1.addPokemon(p);
             refreshTeam();
         });
     })*/

    // console.log(boardgame.image_url);
}
/*
function refreshTeam() {
    document.getElementById('team').innerHTML = team1.describe();

    if (message.type) {
        let alertbox = document.createElement('div');
        alertbox.classList.add('alert');
        alertbox.setAttribute('role', 'alert');

        if (message.type == 'SUCCES') {
            alertbox.classList.add('alert-success');
        } else {
            alertbox.classList.add('alert-danger');
        }
        //add the message text
        alertbox.innerText = message.value;

        //Add to DOM
        document.getElementById('messages').innerHTML = '';
        document.getElementById('messages').appendChild(alertbox);
    }
}*/