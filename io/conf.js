const socketio = require('socket.io');

module.exports = function (server) {
  // io server
  const io = socketio(server);

  // game state (players list)
  const players = {};
  const messages = {};
  const collisions = {};
  var index = 0; //used to go throu the collisions obj
  var  collision = false;

  io.on('connection', function (socket) {

    socket.on('user_info', (user_info) => {
      // register new player
      players[socket.id] = {
        socket: socket.id,
        username: user_info.username,
        character: user_info.character_sprite,
        x: 0,
        y: 0,
        size: 20,
        speed: 5,
        frameY: 0,
        messages: {}
      };
      //console.log("collision");
      io.emit('connected', user_info);
    });

    // delete disconnected player; upon closing the window
    socket.on('disconnect', function () {
      delete players[socket.id];
    });
    socket.on('move left', function () {
      // current positin variables to be used to check collision 
      let x1 = players[socket.id].x;
      let y1 = players[socket.id].y;
      // Check if the player is colse to the edge of the map 
      // Same format of condition is used for all the directions 
      if ((players[socket.id].x) < 0) {
        // Change the player's direction to the opposite one
        players[socket.id].frameY = 2 * 48;
        players[socket.id].x = 0;
      }
      else {
        for (const [key, value] of Object.entries(players)) {
          if (
            players[key]['socket'] !== socket.id &&  Math.abs(players[key]['y']-y1)<30 &&  Math.abs(players[key]['x']-x1)<40 ) {
            // collision; show chat window
            //the next 2 lines to emit the msg only to the two players that are in a collision
            socket.broadcast.to(players[key]['socket']).emit('chatPrompt', {player1_socket: players[key]['socket'], player1_username: players[players[key]['socket']].username, player2_socket: socket.id, player2_username: players[socket.id].username});
            io.to(socket.id).emit('chatPrompt', {player1_socket: players[key]['socket'], player1_username: players[players[key]['socket']].username, player2_socket: socket.id, player2_username: players[socket.id].username});
            collision = true;
            collisions[index]={ //we add the collision info
              player1 : socket.id,
              player2 : players[key]['socket']
            };
            index++;
            console.log("collision");
            break;
          }
          else if (players[key]['socket'] !== socket.id) {
            //no colision
            if(index >= 1){
              if(socket.id == collisions[index-1].player1 || socket.id == collisions[index-1].player2){ //we need to check whether the person that just moved was in a collision before. If that was the case, we close the chat prompt or box that was opened before
                //We'll emit the "hiding" msg only to the two players that were in the last collision
                io.to(collisions[index-1].player1).emit('hideChatPrompt', ""); 
                io.to(collisions[index-1].player2).emit('hideChatPrompt', "");
                io.to(collisions[index-1].player1).emit('hideChatBox', "");
                io.to(collisions[index-1].player2).emit('hideChatBox', "");
              }
            }
            collision = false
            console.log("no collision");
          }
        }
        players[socket.id].x -= players[socket.id].speed;
        players[socket.id].frameY = 1 * 48;
      }

    });
    socket.on('move up', function () {
      let x1 = players[socket.id].x;
      let y1 = players[socket.id].y;
      if ((players[socket.id].y) < 0) {
        players[socket.id].frameY = 0 * 48;
        players[socket.id].y = 0;
      }
      else {
        for (const [key, value] of Object.entries(players)) {
          if (
            players[key]['socket'] !== socket.id &&  Math.abs(players[key]['x']-x1)<30 &&  Math.abs(players[key]['y']-y1)<40) {
            // collision; show chat window
            //the next 2 lines to emit the msg only to the two players that are in a collision
            socket.broadcast.to(players[key]['socket']).emit('chatPrompt', {player1_socket: players[key]['socket'], player1_username: players[players[key]['socket']].username, player2_socket: socket.id, player2_username: players[socket.id].username});
            io.to(socket.id).emit('chatPrompt', {player1_socket: players[key]['socket'], player1_username: players[players[key]['socket']].username, player2_socket: socket.id, player2_username: players[socket.id].username});
            collision = true;
            collisions[index]={ //we add the collision info
              player1 : socket.id,
              player2 : players[key]['socket']
            };
            index++;
            console.log("collision");
            break;
          }
          else if (players[key]['socket'] !== socket.id) {
            if(index >= 1){
              if(socket.id == collisions[index-1].player1 || socket.id == collisions[index-1].player2){
                //We'll emit the "hiding" msg only to the two players that were in the last collision
                io.to(collisions[index-1].player1).emit('hideChatPrompt', ""); 
                io.to(collisions[index-1].player2).emit('hideChatPrompt', "");
                io.to(collisions[index-1].player1).emit('hideChatBox', "");
                io.to(collisions[index-1].player2).emit('hideChatBox', "");
              }
            }
            collision = false
            console.log("no collision");
          }
        }
        players[socket.id].y -= players[socket.id].speed;
        players[socket.id].frameY = 3 * 48;
      }

    });
    socket.on('move right', function () {
      let x1 = players[socket.id].x;
      let y1 = players[socket.id].y;
      if ((players[socket.id].x) > 765) {
        players[socket.id].frameY = 1 * 48;
        players[socket.id].x = 765;
      }
      else {
        for (const [key, value] of Object.entries(players)) {
          if (
            players[key]['socket'] !== socket.id &&  Math.abs(players[key]['y']-y1)<30 &&  Math.abs(players[key]['x']-x1)<40  ) {
            // collision; show chat window
            //the next 2 lines to emit the msg only to the two players that are in a collision
            socket.broadcast.to(players[key]['socket']).emit('chatPrompt', {player1_socket: players[key]['socket'], player1_username: players[players[key]['socket']].username, player2_socket: socket.id, player2_username: players[socket.id].username});
            io.to(socket.id).emit('chatPrompt', {player1_socket: players[key]['socket'], player1_username: players[players[key]['socket']].username, player2_socket: socket.id, player2_username: players[socket.id].username});
            collision = true;
            collisions[index]={ //we add the collision info
              player1 : socket.id,
              player2 : players[key]['socket']
            };
            index++;
            console.log("collision");
            break;
          }
          else if (players[key]['socket'] !== socket.id) {
            if(index >= 1){
              if(socket.id == collisions[index-1].player1 || socket.id == collisions[index-1].player2){
                //We'll emit the "hiding" msg only to the two players that were in the last collision
                io.to(collisions[index-1].player1).emit('hideChatPrompt', ""); 
                io.to(collisions[index-1].player2).emit('hideChatPrompt', "");
                io.to(collisions[index-1].player1).emit('hideChatBox', "");
                io.to(collisions[index-1].player2).emit('hideChatBox', "");
              }
            }
            collision = false
            console.log("no collision");
          }
        }
        players[socket.id].x += players[socket.id].speed;
        players[socket.id].frameY = 2 * 48;
      }
    });
    socket.on('move down', function () {
      let x1 = players[socket.id].x;
      let y1 = players[socket.id].y;
      if ((players[socket.id].y) > 550) {
        players[socket.id].frameY = 3 * 48;
        players[socket.id].y = 550;
      }
      else {
        for (const [key, value] of Object.entries(players)) {
          if (
            players[key]['socket'] !== socket.id &&  Math.abs(players[key]['x']-x1)<30 &&  Math.abs(players[key]['y']-y1)<40 ) {
            // collision; show chat window
            //the next 2 lines to emit the msg only to the two players that are in a collision
            socket.broadcast.to(players[key]['socket']).emit('chatPrompt', {player1_socket: players[key]['socket'], player1_username: players[players[key]['socket']].username, player2_socket: socket.id, player2_username: players[socket.id].username});
            io.to(socket.id).emit('chatPrompt', {player1_socket: players[key]['socket'], player1_username: players[players[key]['socket']].username, player2_socket: socket.id, player2_username: players[socket.id].username});
            collision = true;
            collisions[index]={ //we add the collision info
              player1 : socket.id,
              player2 : players[key]['socket']
            };
            index++;
            console.log("collision");
            break;
          }
          else if (players[key]['socket'] !== socket.id) {
            if(index >= 1){
              if(socket.id == collisions[index-1].player1 || socket.id == collisions[index-1].player2){
                //We'll emit the "hiding" msg only to the two players that were in the last collision
                io.to(collisions[index-1].player1).emit('hideChatPrompt', ""); 
                io.to(collisions[index-1].player2).emit('hideChatPrompt', "");
                io.to(collisions[index-1].player1).emit('hideChatBox', "");
                io.to(collisions[index-1].player2).emit('hideChatBox', "");
              }
            }
            collision = false
            console.log("no collision");
          }
        }
        players[socket.id].y += players[socket.id].speed;
        players[socket.id].frameY = 0 * 48;
      }
    });

    socket.on('acceptChat', (playerss) => {
      if(socket.id == playerss.player1_socket){
        socket.broadcast.to(playerss.player2_socket).emit('chatBox', playerss);
        players[socket.id].messages[players.player2_socket] = [];
      }
      else if(socket.id == playerss.player2_socket){
        socket.broadcast.to(playerss.player1_socket).emit('chatBox', playerss);
        players[socket.id].messages[players.player1_socket] = [];
      }
      
    });

    socket.on('refuseChat', (players) => {
      if(socket.id == players.player1_socket){
        socket.broadcast.to(players.player2_socket).emit('chatRefused', {player_refused_socket: socket.id, player_refused_username: players.player1_username});
      }
      else if(socket.id == players.player2_socket){
        socket.broadcast.to(players.player1_socket).emit('chatRefused', {player_refused_socket: socket.id, player_refused_username: players.player2_username});
      }
      
    });

    socket.on('chat message', (message) => {
      socket.broadcast.to(message.receiver).emit('chat message', {username: players[message.sender].username, msg: message.msg});
      
      if(typeof players[message.receiver].messages[socket.id] == 'undefined'){
        players[message.receiver].messages[socket.id] = [];
      }
      
      players[message.receiver].messages[socket.id].push([message.time, message.msg]);
  });
    
  });
  function update() {
    io.volatile.emit('players list', {players_object: Object.values(players), players: players});
  }

  setInterval(update, 1000 / 60);
};
