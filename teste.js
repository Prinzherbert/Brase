const socket = new WebSocket('ws://localhost:8080');
var text = document.getElementById("text");

socket.onopen = ({e}) => {
    console.log("Conectado");
}

socket.onmessage = ({data}) => {
    console.log('Mensagem do servidor! ' + data);
}

document.querySelector('button').onclick = () => {
    socket.send('Oi');
}

function updateText(){
    text = document.getElementById("text");
    socket.send(text.value);
}