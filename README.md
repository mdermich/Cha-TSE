# Cha'Tse
![landing-page]
A 2D game representing the school Télécom Saint-Etienne with interactions between players via a chat.
## Installation
1. Clone this repo
```bash
git clone https://github.com/mdermich/Cha-TSE.git
```
2. Install npm packages
```bash
npm install
```
3. Run the app
```bash
npm run devstart
```

## Functionalities
* When openning the game, a characters menu is displayed over the Game Map.
* The user can choose one character from a carousel and enter a username (the username is mandatory to start the game).
* Connected users are stored on servers side in the players table.
* When a user is connected a pop up message is displayed for other users.
* When the player starts the game a theme song audio is played.
* When two users approach each other, they have the choice to start a private conversation (if both users accept).
* Users can leave the conversation with a close button.
* If the users move away, the conversation is automatically closed.
* Each time a message is sent, the time the message was sent and the sender are indicated.
* A history of the last messages is kept, this history reappear if users meet again and accept to chat.

[landing-page]: images/landing.png
