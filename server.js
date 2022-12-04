'use strict';

const mysql = require('mysql');
const express = require('express');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const INDEX = '/index.html';

const server = express()
  .use(express.static(__dirname))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new WebSocketServer({ server: server, autoAcceptConnections: true });

var database = mysql.createConnection({
  host     : 'spigo.net',
  user     : 'spigo594_grupo02',
  password : process.env.PASSWORD,
  database : 'spigo594_grupo02'
});

database.connect();

database.query("SELECT * FROM postit", function (error, results, fields){ 
  if (error) throw error;  
  initialize(results);
});

var postItArray = [];

function initialize(results){
  results.forEach(function(result){
    postItArray[result.id] = {};
    postItArray[result.id].x = result.x;
    postItArray[result.id].y = result.y;
    postItArray[result.id].text = result.text;
    postItArray[result.id].hue = Math.random() * 360;
    postItArray[result.id].size = 200;
    postItArray[result.id].isSelected = false;
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  wss.broadcast(JSON.stringify["array", postItArray], server);

  ws.on('close', () => {
    console.log('Client disconnected')
    
    postItArray.forEach(function(postIt, i){
      let query = `UPDATE postit SET x = ${postIt.x}, y = ${postIt.y}, text = "${postIt.text}" WHERE id = ${i}`;
      database.query(query, function(error, results, fields){
        if (error) throw error;
      });
    });
  });

  ws.on('message', message => {
    let mensagem = JSON.parse(message);
    if(mensagem[0] == "array"){
        if(mensagem[1].length > postItArray.length){
          let postIt = mensagem[1][mensagem[1].length-1];
          let query = `INSERT INTO postit VALUES (${mensagem[1].length-1}, ${postIt.x}, ${postIt.y}, "${postIt.text}")`;
          database.query(query, function(error, results, fields){
            if (error) throw error;
          });
        }

        if(mensagem[1].length < postItArray.length){
          let postIt = postItArray[postItArray.length-1];
          let query = `DELETE FROM postit WHERE id = ${postItArray.length-1}`;
          database.query(query, function(error, results, fields){
            if (error) throw error;
          });
        }

        postItArray = mensagem[1];
        postItArray.forEach(function(postIt, i){
          let query = `UPDATE postit SET x = ${postIt.x}, y = ${postIt.y}, text = "${postIt.text}" WHERE id = ${i}`;
          database.query(query, function(error, results, fields){
            if (error) throw error;
          });
        });
        wss.broadcast(JSON.stringify(["array", postItArray]), server);
    } else if(mensagem[0] == "connect"){
        wss.broadcast(JSON.stringify(["array", postItArray]), server);
    } else {
        wss.broadcast(JSON.stringify(mensagem), server);
    }
  });
});

wss.broadcast = function(data, sender){
  wss.clients.forEach(function(client){
      if (client !== sender) {
          client.send(data)
      }
  });
}