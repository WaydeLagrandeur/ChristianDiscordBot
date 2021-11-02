const Discord = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const prefix = '!';

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
//Maybe add a way to track user statistics
client.once('ready', () => {
    console.log('ChristianServerBot is online!');
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

client.on('message', async message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'verse') {
        const bibleVerse = await fetch('http://labs.bible.org/api/?passage=random&type=json').then(response => response.json());

        const obj = JSON.stringify(bibleVerse, null, 2).toString().split('"');  

        let passageLocation = obj[3] + " " + obj[7] + ":" + obj[11]; 
        let passage = obj[15]; 
        let sendOff = "This is the Word of the Lord. Praise be to God.";

        const embed = new Discord.MessageEmbed().setTitle(passageLocation).setDescription(passage).setFooter(sendOff); 
        
        message.channel.send({embeds: [embed]}); 
    }
});

client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'praise') {
        message.channel.send("Praise the Lord!");
    }
});

fs.readFile('./token', 'utf8', function(err, data) {
    if(err) throw err;
    client.login(data);
});
