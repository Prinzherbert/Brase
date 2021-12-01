import {WebSocketServer} from 'ws';
const server = new WebSocketServer({port:'8080'});

server.on('connection', socket => {
    socket.on('message', message => {
        server.broadcast("Funcionando! " + message)
    });
});

server.broadcast = function(data){
    server.clients.forEach(client => client.send(data));
}