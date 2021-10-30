const Discord = require('discord.js');

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});

const prefix = '!';

const token = require("./token");

client.once('ready', () => {
    console.log('CultBot is online!');
});

client.on('message', message => {
    let badWords = ['fuck', 'shit', 'cunt', 'cock', 'dick', 'bitch', 'bastard', 'damn', 'dammit', 'ass', 'hell', 'pussy', 'whore', 'slut', 'piss', 'tit'];
    let goodWords = ['frick', 'crap', 'good fellow', 'penis', 'penis', 'female dog', 'child of unwed parents', 'darn', 'darn it', 'bum', 'heck', 'vagina', 'promiscuous woman', 'promiscuous woman', 'pee', 'breast'];
    let bBadWords = false;
    

    for(let i = 0; i < badWords.length; i++) {        
        if(message.content.toLowerCase().includes(badWords[i]) && !message.author.bot) {
            message.content = message.content.toLowerCase().replaceAll(badWords[i], goodWords[i]);
            bBadWords = true;           
        }       
    }
    let newMessage = message.content;

    if(bBadWords) {
        message.channel.send('That is a bad word ' + message.author.username + "! \nInstead, try saying \"" + newMessage + "\"");
    }
});

client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'praise') {
        message.channel.send("Praise Jesus!");
    }
});
        
client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'rick') {
        message.channel.send('We\'re no strangers to love. ' + 
        'You know the rules and so do I. ' + 
        'A full commitment\'s what I\'m thinking of. ' +
        'You wouldn\'t get this from any other guy. ' +
        'I just wanna tell you how I\'m feeling. ' +
        'Gotta make you understand. ' +
        'Never gonna give you up. ' +
        'Never gonna let you down. ' +
        'Never gonna run around and desert you. ' +
        'Never gonna make you cry. ' +
        'Never gonna say goodbye. ' +
        'Never gonna tell a lie and hurt you. ' +
        'We\'ve known each other for so long. ' +
        'Your heart\'s been aching but you\'re too shy to say it. ' +
        'Inside we both know what\'s been going on. ' +
        'We know the game and we\'re gonna play it. ' +
        'And if you ask me how I\'m feeling. ' +
        'Don\'t tell me you\'re too blind to see. ' +
        'Never gonna give you up. ' +
        'Never gonna let you down. ' +
        'Never gonna run around and desert you. ' +
        'Never gonna make you cry. ' +
        'Never gonna say goodbye. ' +
        'Never gonna tell a lie and hurt you. ' +
        'Never gonna give you up. ' +
        'Never gonna let you down. ' +
        'Never gonna run around and desert you. ' +
        'Never gonna make you cry. ' +
        'Never gonna say goodbye. ' +
        'Never gonna tell a lie and hurt you. ' +
        'Never gonna give, never gonna give. ' +
        '(Give you up). ' +
        'We\'ve known each other for so long. ' +
        'Your heart\'s been aching but you\'re too shy to say it. ' +
        'Inside we both know what\'s been going on. ' +
        'We know the game and we\'re gonna play it. ' +
        'I just wanna tell you how I\'m feeling. ' +
        'Gotta make you understand. ' +
        'Never gonna give you up. ' +
        'Never gonna let you down. ' +
        'Never gonna run around and desert you. ' +
        'Never gonna make you cry. ' +
        'Never gonna say goodbye. ' +
        'Never gonna tell a lie and hurt you. ' +
        'Never gonna give you up. ' +
        'Never gonna let you down. ' +
        'Never gonna run around and desert you. ' +
        'Never gonna make you cry. ' +
        'Never gonna say goodbye. ' +
        'Never gonna tell a lie and hurt you. ' +
        'Never gonna give you up. ' +
        'Never gonna let you down. ' +
        'Never gonna run around and desert you. ' +
        'Never gonna make you cry. ' +
        'Never gonna say goodbye.')
    }
})

client.login(token);