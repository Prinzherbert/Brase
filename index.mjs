import WebSocket, {WebSocketServer} from 'ws';
const server = new WebSocketServer({port: (process.env.PORT || '8080')});

server.on('connection', socket => {
    socket.on('message', message => {
        let mensagem = JSON.parse(message);
        server.broadcast(JSON.stringify(mensagem));
    });
});


server.broadcast = function(data){
    server.clients.forEach(client => client.send(data));
}