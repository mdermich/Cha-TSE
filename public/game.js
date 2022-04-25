
const keyboard = {};
let players = [];
let playersWithSocket = {};
const socket = io();
const spriteWidth = 32;
const spriteHeight = 48;
let frameX = 0;

// sprite animation
let gameFrame = 0;
// to staggerate sprite movement
const staggeredFrames = 5;

// play audio when player starts game
var audio = document.createElement("AUDIO")
document.body.appendChild(audio);
audio.src = "/audio/avengers.mp3"
document.getElementById("Start").addEventListener("click", function () {
  audio.play()
})

// disconnecting user upon clicking disconnect button 
document.getElementById("disconnectbtn").addEventListener("click", function () {
  // disconected event can not be triggered, so we create a custom event for the button click
  audio.pause();
  document.location.reload(true);
})
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
// map image that has colliders as green boxes 
/*const collider = new Image()
collider.src = '/sprites/mapCollider.png'
collider.onload = function () {
  ctx.drawImage(collider, 0, 0, 800, 600);
}*/
const map = new Image()
map.src = '/sprites/map.png'
const mapCollider = new Image()
mapCollider.src = '/sprites/mapCollider.png'
const ctxC = canvas.getContext('2d');
/*mapCollider.onload = function () {
  ctxC.drawImage(mapCollider, 0, 0, 800, 600);
}*/



function drawPlayers(frameX) {
  players.forEach(function ({ username, character, x, y, size, frameY }) {
    let playerImage = new Image();
    playerImage.src = '/sprites/' + character + '.png'
    ctx.beginPath();
    ctx.fillText(username, x, y - 5);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.strokeStyle = 'green';
    ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, x, y, spriteWidth, spriteHeight);
  });
}
// first call
//We don't draw the characters until the user enters his username
socket.on('connected', (user_info) => {
  requestAnimationFrame(update);
  notifyPlayersOfNewPlayer(user_info);
});

function notifyPlayersOfNewPlayer(user_info){
  console.log(socket.id);
  console.log(user_info.socket);
  if(socket.id !== user_info.socket){
    console.log("new player");
    displayNotification(user_info);
  }
}
function displayNotification(user_info){
  $(".notify").height(50);
  $(".notify").css('padding-top', 15);
  $(".notify").text(user_info.username + " is here !");
  
  setTimeout(function(){
    $(".notify").css('padding-top', 0);
    $(".notify").height(0);
  }, 2000);
}

window.onkeydown = function (e) {
  keyboard[e.key] = true;
};

window.onkeyup = function (e) {
  delete keyboard[e.key];
};

function movePlayer() {
  ctxC.drawImage(mapCollider, 0, 0, 800, 600);
  /*if (ctxC.getImageData(playersId[socket.id].x+12, playersId[socket.id].y+24, 32, 48).data[1] === 255) {
    console.log("collision with object");
    console.log(ctxC.getImageData(playersId[socket.id].x+12, playersId[socket.id].y+24, 32, 48).data[1]);
  }
  else {*/
  if (keyboard['ArrowLeft']) socket.emit('move left');
  if (keyboard['ArrowUp']) socket.emit('move up');
  if (keyboard['ArrowRight']) socket.emit('move right');
  if (keyboard['ArrowDown']) socket.emit('move down');

}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let position = Math.floor(gameFrame / staggeredFrames) % 3;
  frameX = spriteWidth * position;
  movePlayer(); // *
  ctx.drawImage(map, 0, 0, 800, 600);
  drawPlayers(frameX);
  if(gameFrame>200){
    gameFrame=0;
  }
  gameFrame++;
  console.log(gameFrame);
  requestAnimationFrame(update);
}
socket.on('players list', function (list) {
  players = list.players_object;
  playersWithSocket = list.players;
});

////Chat Prompt////
let chat_players;
var chat_prompt = document.getElementById('hover_bkgr_fricc');
var chat_prompt_content = document.getElementById('content_popup_prompt');
var chat_form = document.getElementById('chatbox');
var prompt = document.createElement('p');
var buttons = document.createElement('div');
socket.on('chatPrompt', (players) => {
  if (socket.id == players.player1_socket) {
    chat_players = { sender: players.player1_socket, sender_username: players.player1_username, receiver: players.player2_socket, receiver_username: players.player2_username };
  }
  else if (socket.id == players.player2_socket) {
    chat_players = { sender: players.player2_socket, sender_username: players.player2_username, receiver: players.player1_socket, receiver_username: players.player1_username };
  }


  console.log(chat_players.receiver_username);
  prompt.textContent = "Would you like to chat with " + chat_players.receiver_username + "?";
  chat_prompt_content.appendChild(prompt);
  buttons.innerHTML = "<button id='acceptChatButton'>Yes</button><button id='refuseChatButton'>No</button>";
  chat_prompt_content.appendChild(buttons);
  chat_prompt.style.display = "block";
  chatPrompt(players);
});

function chatPrompt(players) {
  var acceptButton = document.getElementById('acceptChatButton');
  var refuseButton = document.getElementById('refuseChatButton');
  var closeButton = document.getElementById('popupCloseButton');
  acceptButton.addEventListener('click', function () {
    acceptChat(players);
  });
  refuseButton.addEventListener('click', function () {
    refuseChat(players);
  });
  closeButton.addEventListener('click', function () {
    refuseChat(players);
  });
}

var chatAcceptedOtherPlayer = false;
var chatAcceptedCurrentPlayer = false;
function acceptChat(players) {
  console.log('accepted');
  chatAcceptedCurrentPlayer = true;
  socket.emit('acceptChat', players);
  if (chatAcceptedOtherPlayer) {
    closeChatPrompt();
    openChatBox();
  }
}

function refuseChat(players) {
  chatAcceptedCurrentPlayer = false;
  socket.emit('refuseChat', players);
  closeChatPrompt();
}

socket.on('chatBox', (players) => {
  chatAcceptedOtherPlayer = true;
  if (chatAcceptedCurrentPlayer) {
    closeChatPrompt();
    openChatBox();
  }
});

socket.on('chatRefused', (players) => {
  prompt.textContent = players.player_refused_username + " refused to chat :( .";
  buttons.innerHTML = "";
});

function closeChatPrompt() {
  chat_prompt.style.display = "none";
}

let myOlderMsgs = [];
let otherPlayerOlderMsgs = [];
function openChatBox(){
  console.log('chat started');
  chat_form.style.display = "flex"; //display the chat box

  //look through my history to see if i have msgs with the other player
  for(const other_socket in playersWithSocket[chat_players.sender].messages){
    if(other_socket == chat_players.receiver){
      otherPlayerOlderMsgs = playersWithSocket[chat_players.sender].messages[other_socket];
      break;
    }
  }
  //look through the other player's history to see if they have msgs with me
  for(const other_socket in playersWithSocket[chat_players.receiver].messages){
    if(other_socket == socket.id){
      myOlderMsgs = playersWithSocket[chat_players.receiver].messages[other_socket];
      break;
    }
  }
  fillChatBoxWithHistory();
}

function fillChatBoxWithHistory(){
  for(const otherMsg in otherPlayerOlderMsgs){
    for(const myMsg in myOlderMsgs){
      if(otherPlayerOlderMsgs[otherMsg][0] < myOlderMsgs[myMsg][0]){
        messages.innerHTML += "<article class='msg-container msg-remote' id='msg-0'><div class='msg-box'><img class='user-img' id='user-0' src='//gravatar.com/avatar/00034587632094500000000000000000?d=retro' /><div class='flr'><div class='messages'><p class='msg' id='msg-0'>"+otherPlayerOlderMsgs[otherMsg][1]+"</p></div><span class='timestamp'><span class='username'>"+ chat_players.receiver_username +"</span>&bull;<span class='posttime'>"+otherPlayerOlderMsgs[otherMsg][0]+"</span></span></div></div></article>";
        break;
      }
      else{
        if(myOlderMsgs[myMsg][1] !== ""){
          messages.innerHTML += "<article class='msg-container msg-self' id='msg-0'><div class='msg-box'><div class='flr'><div class='messages'><p class='msg' id='msg-1'>"+myOlderMsgs[myMsg][1]+"</p></div><span class='timestamp'><span class='username'>"+chat_players.sender_username+"</span>&bull;<span class='posttime'>"+myOlderMsgs[myMsg][0]+"</span></span></div><img class='user-img' id='user-0' src='//gravatar.com/avatar/56234674574535734573000000000001?d=retro' /></div></article>";
        }
        myOlderMsgs[myMsg][1] = "";
      }
    }
  }
  if(otherPlayerOlderMsgs[otherPlayerOlderMsgs.length - 1][0] < myOlderMsgs[myOlderMsgs.length - 1][0]){
    messages.innerHTML += "<article class='msg-container msg-self' id='msg-0'><div class='msg-box'><div class='flr'><div class='messages'><p class='msg' id='msg-1'>"+myOlderMsgs[myOlderMsgs.length - 1][1]+"</p></div><span class='timestamp'><span class='username'>"+chat_players.sender_username+"</span>&bull;<span class='posttime'>"+myOlderMsgs[myOlderMsgs.length - 1][0]+"</span></span></div><img class='user-img' id='user-0' src='//gravatar.com/avatar/56234674574535734573000000000001?d=retro' /></div></article>";
  }
  else{
    messages.innerHTML += "<article class='msg-container msg-remote' id='msg-0'><div class='msg-box'><img class='user-img' id='user-0' src='//gravatar.com/avatar/00034587632094500000000000000000?d=retro' /><div class='flr'><div class='messages'><p class='msg' id='msg-0'>"+otherPlayerOlderMsgs[otherPlayerOlderMsgs.length - 1][1]+"</p></div><span class='timestamp'><span class='username'>"+ chat_players.receiver_username +"</span>&bull;<span class='posttime'>"+otherPlayerOlderMsgs[otherPlayerOlderMsgs.length - 1][0]+"</span></span></div></div></article>";
  }

}

function closeChatBox(){
  messages.innerHTML = "";
  chat_form.style.display = "none";
  chatAcceptedOtherPlayer = false;
  chatAcceptedCurrentPlayer = false;
  myOlderMsgs = [];
  otherPlayerOlderMsgs = [];
}

var messages = document.getElementById('messages');
var input = document.getElementById('chat-input');
var chatForm = document.getElementById('chat');
var chatboxCloseButton = document.getElementById('chatboxCloseButton');
chatForm.addEventListener('submit', function (e) {
  e.preventDefault();
  console.log("button clicked");
  if (input.value) {
      socket.emit('chat message', {msg: input.value, time: new Date().toLocaleTimeString(), sender: chat_players.sender, receiver: chat_players.receiver});
      messages.innerHTML += "<article class='msg-container msg-self' id='msg-0'><div class='msg-box'><div class='flr'><div class='messages'><p class='msg' id='msg-1'>"+input.value+"</p></div><span class='timestamp'><span class='username'>"+chat_players.sender_username+"</span>&bull;<span class='posttime'>"+new Date().toLocaleTimeString();+"</span></span></div><img class='user-img' id='user-0' src='//gravatar.com/avatar/56234674574535734573000000000001?d=retro' /></div></article>";
      input.value = '';
  }
});
chatboxCloseButton.addEventListener('click', function () {
  closeChatBox();
});
socket.on('chat message', function (msg) {
  console.log("message received");
  messages.innerHTML += "<article class='msg-container msg-remote' id='msg-0'><div class='msg-box'><img class='user-img' id='user-0' src='//gravatar.com/avatar/00034587632094500000000000000000?d=retro' /><div class='flr'><div class='messages'><p class='msg' id='msg-0'>" + msg.msg + "</p></div><span class='timestamp'><span class='username'>" + msg.username + "</span>&bull;<span class='posttime'>" + new Date().toLocaleTimeString(); +"</span></span></div></div></article>";

});
socket.on('hideChatPrompt', function () {
  chat_prompt.style.display = "none";
});
socket.on('hideChatBox', function () {
  closeChatBox();
});




