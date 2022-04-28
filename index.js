const Sequelize = require('sequelize');
const sqlite3 = require('sqlite3').verbose();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const schedule = require('node-schedule');

const prefix = '!';

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]});

//To any future employers faint of heart, please do NOT read the next line
const badWords = ['fuck', 'shit', 'cunt', 'cock', 'dick', 'bitch', 'bastard', 'damn', 'dammit', 'ass', 'hell', 'pussy', 'whore', 'slut', 'piss', 'tit', 'cum', 'fag'];
const goodWords = ['frick', 'crap', 'good fellow', 'penis', 'penis', 'female dog', 'child of unwed parents', 'darn', 'darn it', 'bum', 'heck', 'vagina', 'promiscuous woman', 'promiscuous woman', 'pee', 'breast', 'semen', 'bundle of twigs'];

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const User = sequelize.define('User', {
    userID : {
        type: Sequelize.INTEGER,
    },
    userName : {
        type: Sequelize.STRING,
    },
    guildID: {
        type: Sequelize.INTEGER,
    },
    prayersSent: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    totalSinCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    praiseCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    thoughtsAndPrayersCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    versesRead: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});

client.once('ready', async () => {
    console.log('ChristianServerBot is online!');

    client.user.setStatus("invisible");

     User.sync();
    //{ force: true } USE THIS INSIDE USER.SYNC() TO RESET DATABASE, PROCEED WITH CAUTION
});

client.on('message', message => {   
    let bBadWords = false;
    const messageContent = message.content.toLowerCase();
    const words = messageContent.split(' ');
    let count = 0;

    if(!message.author.bot) {

        let inARow = 0;

        for(let i = 0; i < words.length; i++) {
            for(let j = 0; j < badWords.length; j++) {
                if(words[i].includes(badWords[j])) {
                    words[i] = words[i].replaceAll(badWords[j], goodWords[j]);
                    bBadWords = true;
                    count++;
                    inARow++;

                    if(inARow >= 4) {
                        message.channel.send("Woah there " + message.author.username + "! That's a lot of profanity! Too much to count for God's internal databases!")
                        return;
                    }

                } else {
                    inARow = 0;
                }
            }
        }

        let newMessage = words.join(' ');

        if(bBadWords) {

            if(count > 30) {
                message.channel.send("Woah there " + message.author.username + "! That's a lot of profanity! Too much to count for God's internal databases!")
                return;
            }

            if(newMessage.length > 1920) {
                newMessage = newMessage.substr(0, 1920);
            } 

            message.channel.send('That is a bad word ' + message.author.username + "! \nInstead, try saying \"" + newMessage + "\"");
            UpdateCountDB(message.author.id, message.author.username, message.guild.id, 'sin', count);
        }

    }

}); 

async function createUser(userID, userName, guildID) {

    try {
        const user = await User.create({
            userID: userID,
            userName: userName,
            guildID: guildID              
        });

    }
    catch (error) {
        console.log(error);
    }

}
async function UpdateCountDB(userID, userName, guildID, type, count) {

    const user = await User.findOne({ where: { userID: userID, guildID: guildID }});

    if(user) {
        if(type === 'sin') {
            user.increment('totalSinCount', {by: count});
        }
        if(type === 'praise') {
            user.increment('praiseCount');
        }
        if(type === 'verse') {
            user.increment('versesRead');
        }
        if(type === 'thoughtsAndPrayers') {
            user.increment('thoughtsAndPrayersCount');
        }
        if(type === 'pray') {
            user.increment('prayersSent');
        }
    } else {
        createUser(userID, userName, guildID);
        const newUser = await User.findOne({ where: { userID: userID, guildID: guildID }});
        UpdateCountDB(userID, userName, guildID, type, count);
    }
}

client.on('message', async message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    const Member = client.guilds.cache.get(message.author.id);

    if(command === 'help') {
        const helpEmbed = new Discord.MessageEmbed().setTitle("List of Holy Commands").setDescription("\n!praise: Praises our Lord and Saviour!\n!verse: Get a random Bible passage!\n!pray @mention: Send a friend a Thought and Prayer!\n!stats: See your Level and Statistics!");
        message.channel.send({embeds: [helpEmbed]});
    }

    if(command === 'pray') {

        let targetMember = message.mentions.members.first();
        
        if(targetMember) {
            
            if(targetMember.id === message.author.id) {
                message.channel.send("You cannot pray for yourself! That would ruin the prayer economy!")
                return;
            }
            const user = client.users.cache.get(targetMember.id)

            if(user) {

                let tag = user.tag.toString().substr(0, user.tag.length - 5)

                UpdateCountDB(user.id, tag, message.guild.id, 'thoughtsAndPrayers')
                UpdateCountDB(message.author.id, message.author.username, message.guild.id, 'pray')
               
                    message.channel.send(message.author.username + " has sent " + tag + " a Thought and Prayer!")
                      

            } else {
                message.channel.send("error")
            }
    
        } else {
            message.channel.send("Could not find user mentioned. Did you make sure to @ them?");
        }
    }

    if(command === 'stats') {
        const user = await User.findOne({ where: { userID: message.author.id, guildID: message.guild.id }});

        if(user) {

            let level = (user.prayersSent + user.versesRead + user.praiseCount + user.thoughtsAndPrayersCount) - user.totalSinCount;

            level = Math.floor(level / 5);

            let description = "Curse Count: " + user.totalSinCount +
                "\nPraise Count: " + user.praiseCount +
                "\nVerses Read: " + user.versesRead +
                "\nThoughts and Prayers: " + user.thoughtsAndPrayersCount; 

            const embed = new Discord.MessageEmbed().setTitle("Stats for " + message.author.username + "\nLevel " + level + " Prayer Warrior").setDescription(description); 

            message.channel.send({embeds: [embed]});            

        } else {
            createUser(message.author.id, message.author.username, message.guild.id);
            const createdUser = await User.findOne({ where: { userID: message.author.id, guildID: message.guild.id }});

            let newDescription = "Curse Count: " + createdUser.totalSinCount +
                "\nPraise Count: " + createdUser.praiseCount +
                "\nVerses Read: " + createdUser.versesRead +
                "\nThoughts and Prayers: " + createdUser.thoughtsAndPrayersCount; 

            const newEmbed = new Discord.MessageEmbed().setTitle("Stats for " + message.author.username + "\nLevel 0 Prayer Warrior").setDescription(newDescription);
            message.channel.send({embeds: [newEmbed]});
        }      
    }

    if(command === 'praise') {
        message.channel.send("Praise the Lord!");
        UpdateCountDB(message.author.id, message.author.username, message.guild.id, 'praise');
    }

    if(command === 'verse') {

        try {
            const bibleVerse = await fetch('http://labs.bible.org/api/?passage=random&type=json').then(response => response.json());
            const obj = JSON.stringify(bibleVerse, null, 2).toString().split('"');  

            let passageLocation = obj[3] + " " + obj[7] + ":" + obj[11]; 
            let passage = obj[15]; 
            let sendOff = "This is the Word of the Lord. Praise be to God.";

            passage.replaceAll("<b>", "").replaceAll("</b>", "");

            const embed = new Discord.MessageEmbed().setTitle(passageLocation).setDescription(passage).setFooter(sendOff);
            message.channel.send({embeds: [embed]})

        } catch {
            console.log("Error");
        }
        
        UpdateCountDB(message.author.id, message.author.username, message.guild.id, 'verse');
    }
});

fs.readFile('./token', 'utf8', function(err, data) {
    if(err) throw err;
    client.login(data);
});

