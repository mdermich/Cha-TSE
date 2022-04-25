var menu_form = document.getElementById('form');
var username = document.getElementById('username');
var selectedCharacter;

menu_form.addEventListener('submit', function(e) {
    selectedCharacter = $('div.active').attr('id');
    e.preventDefault();
    if (username.value) {
        socket.emit('user_info', {socket: socket.id, username: username.value, character_sprite: selectedCharacter });
    }
    menu_form.style.display = "none";
});