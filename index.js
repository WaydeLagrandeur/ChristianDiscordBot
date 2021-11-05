const Sequelize = require('sequelize');
const sqlite3 = require('sqlite3').verbose();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const prefix = '!';

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const badWords = ['fuck', 'shit', 'cunt', 'cock', 'dick', 'bitch', 'bastard', 'damn', 'dammit', 'ass', 'hell', 'pussy', 'whore', 'slut', 'piss', 'tit', 'cum', 'fag', 'linux'];
const goodWords = ['frick', 'crap', 'good fellow', 'penis', 'penis', 'female dog', 'child of unwed parents', 'darn', 'darn it', 'bum', 'heck', 'vagina', 'promiscuous woman', 'promiscuous woman', 'pee', 'breast', 'semen', 'bundle of twigs', 'windows'];

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const User = sequelize.define('User', {
    name: {
        type: Sequelize.STRING,
    },
    serverID: {
        type: Sequelize.INTEGER,
    },
    sinCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    praiseCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    // thoughtsAndPrayersCount: {
    //     type: Sequelize.INTEGER,
    //     default: 0
    // },
    versesRead: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});

client.once('ready', () => {
    console.log('ChristianServerBot is online!');
    User.sync();
    //{ force: true }
});

client.on('message', message => {   
    let bBadWords = false;
    const messageContent = message.content.toLowerCase();
    const words = messageContent.split(' ');
    let count = 0;
    words.forEach((v, i) => {
        const idx = badWords.indexOf(v);
        if(idx > -1) {
            words[i] = goodWords[idx];
            bBadWords = true;
            count++;
        }
    }); 

    let newMessage = words.join(' ');

    if(bBadWords) {
        message.channel.send('That is a bad word ' + message.author.username + "! \nInstead, try saying \"" + newMessage + "\"");
        UpdateCountDB(message.author.username, message.channel.id, 'sin', count);
    }
});

async function createUser(username, channel) {

    try {
        const user = await User.create({
            name: username,
            serverID: channel,
            versesRead: 0              
        });

    }
    catch (error) {
        console.log(error);
    }

}
async function UpdateCountDB(username, channel, type, count) {

    const user = await User.findOne({ where: { name: username, serverID: channel }});

    if(user) {
        if(type === 'sin') {
            user.increment('sinCount', {by: count});
        }
        if(type === 'praise') {
            user.increment('praiseCount');
        }
        if(type === 'verse') {
            user.increment('versesRead');
        }
    } else {
        createUser(username, channel);
        const newUser = await User.findOne({ where: { name: username, serverID: channel }});
        UpdateCountDB(username, channel, type, count);
    }
}

client.on('message', async message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();



    if(command === 'stats') {
        const user = await User.findOne({ where: { name: message.author.username, serverID: message.channel.id }});

        if(user) {

            let description = "Curse Count: " + user.sinCount +
                "\nPraise Count: " + user.praiseCount +
                "\nVerses Read: " + user.versesRead; 

            const embed = new Discord.MessageEmbed().setTitle("Stats for " + user.name).setDescription(description); 

            message.channel.send({embeds: [embed]});            

        } else {
            createUser(message.author.username, message.channel.id);
            const createdUser = await User.findOne({ where: { name: message.author.username, serverID: message.channel.id }});

            let newDescription = "Curse Count: " + createdUser.sinCount +
                "\nPraise Count: " + createdUser.praiseCount +
                "\nVerses Read: " + createdUser.versesRead; 

            const newEmbed = new Discord.MessageEmbed().setTitle("Stats for " + createdUser.name).setDescription(newDescription);
            message.channel.send({embeds: [newEmbed]});
        }      
    }

    if(command === 'leaderboard') {

        // const sinLeaders = await User.findAll({ where: { serverID: message.channel.id } });
        // message.channel.send('Here is a list of the biggest sinners:' + 
        //                     '\n' + record here + ": " + record sin count + " sins");
    }

    if(command === 'praise') {
        message.channel.send("Praise the Lord!");
        UpdateCountDB(message.author.username, message.channel.id, 'praise');
    }

    // if(command === 'pray') {

    //     UpdateCountDB(message.author.username, message.channel.id, 'thoughtsAndPrayers');
    // }

    if(command === 'verse') {

        try {
            const bibleVerse = await fetch('http://labs.bible.org/api/?passage=random&type=json').then(response => response.json());
            const obj = JSON.stringify(bibleVerse, null, 2).toString().split('"');  

            let passageLocation = obj[3] + " " + obj[7] + ":" + obj[11]; 
            let passage = obj[15]; 
            let sendOff = "This is the Word of the Lord. Praise be to God.";

            const embed = new Discord.MessageEmbed().setTitle(passageLocation).setDescription(passage).setFooter(sendOff);
            message.channel.send({embeds: [embed]});

        } catch {
            console.log(error);
        }
        UpdateCountDB(message.author.username, message.channel.id, 'verse'); 
    }
});

fs.readFile('./token', 'utf8', function(err, data) {
    if(err) throw err;
    client.login(data);
});

