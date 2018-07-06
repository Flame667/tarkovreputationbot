"use strict"
const Discord = require("discord.js")
const client = new Discord.Client({
  disableEveryone: true,
  messageCacheMaxSize: 500,
  messageCacheLifetime: 120,
  messageSweepInterval: 60
})
const config = require("./config.json")
// const reputation = require("./reputation.json")
const fs = require("fs")

var transferring = false;
var raffle = false;
var rafflenum = 0;
var continueTimed = true;
var raffleentries = [];

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setActivity('t/help for commands')
});

client.on("error", (e) => {
  console.log(e)
});

function timedRoles(message) {
  var time = 0;
  var hobo = message.guild.roles.find("name", "Hobo");
  var newbie = message.guild.roles.find("name", "Newbie");
  var scav = message.guild.roles.find("name", "Scav");
  var privat = message.guild.roles.find("name", "Private");
  var captain = message.guild.roles.find("name", "Captain");
  let veteran = message.guild.roles.find("name", "VETERAN");
  if (continueTimed ) {
    message.channel.send("Timedroles Started, please wait around 5 minutes to insure completion")
    message.guild.members.forEach(function(guildMember, guildMemberId) {
      setTimeout(function(){
        let timeDay = timeMin() -  Math.floor(guildMember.joinedTimestamp / 60000)
        timeDay = Math.round(timeDay / 1440)
        console.log(guildMember.joinedAt)
        if (timeDay < 7) {
          if (guildMember.roles.has(hobo.id)) {
            return
          } else {
            guildMember.addRole(hobo.id).catch(console.error);
          }
        }
        else if (timeDay >= 7 && timeDay < 30) {
          if (guildMember.roles.has(newbie.id)) {
            return
          } else {
            guildMember.addRole(newbie.id).catch(console.error);
            guildMember.removeRole(hobo.id).catch(console.error);
          }
        }
        else if (timeDay >= 30 && timeDay < 60) {
          if (guildMember.roles.has(scav.id)) {
            return
          } else {
            guildMember.addRole(scav.id).catch(console.error);
            guildMember.removeRole(hobo.id).catch(console.error);
            guildMember.removeRole(newbie.id).catch(console.error);
          }
        }
        else if (timeDay >= 60 && timeDay < 120) {
          if (guildMember.roles.has(privat.id)) {
            return
          } else {
            guildMember.addRole(privat.id).catch(console.error);
            guildMember.removeRole(hobo.id).catch(console.error);
            guildMember.removeRole(newbie.id).catch(console.error);
            guildMember.removeRole(scav.id).catch(console.error);
          }
        }
        else if (timeDay >= 120 && timeDay < 180) {
          if (guildMember.roles.has(captain.id)) {
            return
          } else {
            guildMember.addRole(captain.id).catch(console.error);
            guildMember.removeRole(hobo.id).catch(console.error);
            guildMember.removeRole(newbie.id).catch(console.error);
            guildMember.removeRole(scav.id).catch(console.error);
            guildMember.removeRole(privat.id).catch(console.error);
          }
        }
        else if (timeDay >= 180) {
          if (guildMember.roles.has(veteran.id)) {
            return
          } else {
            guildMember.addRole(veteran.id).catch(console.error);
            guildMember.removeRole(hobo.id).catch(console.error);
            guildMember.removeRole(newbie.id).catch(console.error);
            guildMember.removeRole(scav.id).catch(console.error);
            guildMember.removeRole(privat.id).catch(console.error);
            guildMember.removeRole(captain.id).catch(console.error);
          }
        }
      }, time)
      time += 500;
    })
  }
  else {
    return
  }
}

function timeMin() {
  return Math.floor(Date.now()/60000)
}

function setData(arg, key, value, message) {
  if(!fs.existsSync("reputation.json")) {
    let obj = {}
    obj[arg] = CreatePerson(arg)
    obj[arg][key] = value
    fs.writeFileSync("reputation.json", JSON.stringify(obj))
    return
  } else {
    let obj = JSON.parse(fs.readFileSync("reputation.json"))
    if(!obj.hasOwnProperty(arg)) {
      obj[arg] = CreatePerson(arg)
      obj[arg][key] = value
      fs.writeFileSync("reputation.json", JSON.stringify(obj))
      return
    } else {
      // Weird bug/glitch runs this twice
      obj[arg][key] = value
      fs.writeFileSync("reputation.json", JSON.stringify(obj))
      return
    }
  }
}

function getData(arg, message) {
  if(!fs.existsSync("reputation.json")) {
    let obj = {}
    obj[arg] = CreatePerson(arg)
    fs.writeFileSync("reputation.json", JSON.stringify(obj))
    return obj[arg]
  } else {
    let obj = JSON.parse(fs.readFileSync("reputation.json"))
    if(obj.hasOwnProperty(arg)) {
      return obj[arg]
    } else {
      obj[arg] = CreatePerson(arg)
      fs.writeFileSync("reputation.json", JSON.stringify(obj))
      return obj[arg]
    }
  }
}

function isStaff(message) {
  let role = message.guild.roles.find("name","Staff")
  if (message.member.roles.has(role.id)) {
    return true;
  }
  else {
    return false;
  }
}

function isTrusted(message) {
  let role = message.guild.roles.find("name","Traders")
  if (message.member.roles.has(role.id)) {
    return true;
  }
  else {
    return false;
  }
}

function Person(personID) {
  this.PersonID = personID;
  this.PositiveRep = 0;
  this.NegativeRep = 0;
  this.LastRep = timeMin() - 30;
  this.Note = "";
  this.Shop = "";
}

function CreatePerson(personID){
   var newUser = new Person(personID);
   return newUser;
}

client.on("guildMemberAdd", member => {
  let role1 = member.guild.roles.find("name", "notify");
  // let role2 = member.guild.roles.find("name", "Hobo");
  member.addRole(role1).catch(console.error);
  // member.addRole(role2).catch(console.error);
  console.log("Someone Joined and was given notify!")
});

client.on("message", async message => {
  if (transferring == true) {
    return
  }

  //if (message.channel.id == '403190416914251777') {

  if ((message.content).includes("discord.gg") || (message.content).includes("discordapp.com/invite")) {
    if (!isStaff(message)) {
      message.author.send("Please do not post invite links to other discords! Thank you")
      message.delete()
        .then(msg => console.log(`Deleted discord invite link from ${message.author.username}`))
        .catch(console.error);
    }
  }
  //}

  if(message.author.bot) return;

  if(message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // MISC AND ROLE COMMANDS
  if (command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is **${m.createdTimestamp - message.createdTimestamp}ms**. API Latency is **${Math.round(client.ping)}ms**`);
  }

  if (command === "checkmate") {
    if (isStaff(message)) {
       message.reply("**Fuck off you Commie Fuck.**")
     }
     else {
       message.reply("**Fair Play**")
     }
  }

  if (command === "dice") {
    message.reply("You rolled a " + Math.ceil(Math.random() * 6))
  }

  if (command === "coinflip") {
    let roll = Math.ceil(Math.random() * 2)
    if (roll == 1) {
      message.reply("Heads")
    }
    else {
      message.reply("Tails")
    }
  }

  if (command === "member") {
    let role = message.guild.roles.find("name","Member")
    if (message.member.roles.has(role.id)) {
      let embed = {
      "description": `${message.author} You already have **Member** role.`,
      "color": 15158332
      };
      message.channel.send({ embed });
    }
    else {
      let role = message.guild.roles.find("name", "Member");
      let member = message.member
      member.addRole(role).catch(console.error);
      let embed = {
      "description": `${message.author} You now have **Member** role.`,
      "color": 3066993
      };
      message.channel.send({ embed });
    }
  }

  if (command === "notify") {
    let role = message.guild.roles.find("name","notify")
    message.member.roles.has(role.id)
    if (message.member.roles.has(role.id)) {
      let role = message.guild.roles.find("name", "notify");
      let member = message.member
      member.removeRole(role).catch(console.error);
      let embed = {
      "description": `${message.author} You no longer have **notify** role.`,
      "color": 15158332
      };
      message.channel.send({ embed });
    }
    else {
      let role = message.guild.roles.find("name", "notify");
      let member = message.member
      member.addRole(role).catch(console.error);
      let embed = {
      "description": `${message.author} You now have **notify** role.`,
      "color": 3066993
      };
      message.channel.send({ embed });
    }
  }

  if (command === "bear") {
    let role = message.guild.roles.find("name","BEAR")
    if (message.member.roles.has(role.id)) {
      let role = message.guild.roles.find("name", "BEAR");
      let member = message.member
      member.removeRole(role).catch(console.error);
      let embed = {
      "description": `${message.author} You no longer have **BEAR** role.`,
      "color": 15158332
      };
      message.channel.send({ embed });
    }
    else {
      let role = message.guild.roles.find("name", "BEAR");
      let member = message.member
      member.addRole(role).catch(console.error);
      let embed = {
      "description": `${message.author} You now have **BEAR** role.`,
      "color": 3066993
      };
      message.channel.send({ embed });
    }
  }

  if (command === "usec") {
    let role = message.guild.roles.find("name","USEC")
    if (message.member.roles.has(role.id)) {
      let member = message.member
      member.removeRole(role).catch(console.error);
      let embed = {
      "description": `${message.author} You no longer have **USEC** role.`,
      "color": 15158332
      };
      message.channel.send({ embed });
    }
    else {
      let role = message.guild.roles.find("name", "USEC");
      let member = message.member
      member.addRole(role).catch(console.error);
      let embed = {
      "description": `${message.author} You now have **USEC** role.`,
      "color": 3066993
      };
      message.channel.send({ embed });
    }
  }

  if (command === "tarkov") {
    let embed = {
      "description": `***List of Helpful Escape From Tarkov links***`,
      "color": 3447003,
      "fields": [
        {
          "name": "Tarkov Website",
          "value": "https://www.escapefromtarkov.com/"
        },
        {
          "name": "Tarkov Forums",
          "value": "http://forum.escapefromtarkov.com/"
        },
        {
          "name": "Main Subreddit",
          "value": "https://www.reddit.com/r/EscapefromTarkov/"
        },
        {
          "name": "Trading Subreddit",
          "value": "https://www.reddit.com/r/TarkovTrading/"
        },
        {
          "name": "Tarkov Support",
          "value": "http://wiki.escapefromtarkov.com/support"
        },
        {
          "name": "Tarkov Wiki",
          "value": "http://wiki.escapefromtarkov.com/Tarkov"
        },
        {
          "name": "Tarkov Ballistics, Turn off Adblock",
          "value": "http://tarkovballistics.blogspot.com/"
        }
      ]
    }
    return message.author.send({ embed })
  }

  if (command === "stoptimed") {
    if (message.author.id == "237391552698122242" || isStaff(message)) {
      clearInterval()
      if (continuedTimed == false) {
        continueTimed = true;
        return message.reply("Continuing Timed Roles next time you type t/timedroles")
      } else {
        continueTimed = false;
        return message.reply("Stopping further automated timed roles")
      }
    }
  }

  if (command === "timedroles") {
    if (message.author.id == "237391552698122242" || isStaff(message)) {
      if (message.guild.availabe) {
        console.log('Guild Found')
      }
      var hobo = message.guild.roles.find("name", "Hobo");
      var newbie = message.guild.roles.find("name", "Newbie");
      var scav = message.guild.roles.find("name", "Scav");
      var privat = message.guild.roles.find("name", "Private");
      var captain = message.guild.roles.find("name", "Captain");
      let veteran = message.guild.roles.find("name", "VETERAN");
      if (hobo == undefined || newbie == undefined || scav == undefined || privat == undefined || captain == undefined || veteran == undefined ) {
        return message.reply("This discord server doesn't have the corrent roles to use this command")
      }
      clearInterval()
      timedRoles(message)
      if (continueTimed == true) {
        setInterval(function() {timedRoles(message)}, 86400000)
      } else {
        return
      }
    }
  }

  if (command === 'givenotify') {
    if (isStaff(message) || message.author.id == "237391552698122242") {
      let notify = message.guild.roles.find('name', 'notify');
	  var time = 0;
      message.guild.members.forEach(function(guildMember, guildMemberId) {
        setTimeout(function(){
          console.log(guildMember.user.username)
          guildMember.addRole(notify)
        }, time)
        time += 200;
      })
    }
  }

  if (command === 'tarvu') {
    return message.channel.send(':octopus:')
  }

  if (command === 'jointime') {
    let arg = ''
    if (args.slice(0).join(' ') == "") {
      arg = message.author
    }
    if (args.slice(0).join(' ') != "") {
      if (arg = message.mentions.users.first() == undefined) {
        return message.reply("Please provide the name of an actual user")
      }
      arg = message.mentions.users.first()
    }
    message.guild.members.forEach(function(guildMember, guildMemberId) {
      if (guildMember.user.id == arg.id) {
        let embed = {
          "color": 3447003,
          "fields": [
            {
              "name": `${arg.username} joined this discord on:`,
              "value": "*" + guildMember.joinedAt + "*"
            },
            {
              "name": `${arg.username}'s account was created on:`,
              "value": "*" + arg.createdAt + "*"
            }
          ]
        }
        message.author.send({ embed })
        return message.delete()
          .then(msg => console.log(`Updated the content of a message from ${msg.author}`))
        .catch(console.error);
      }
      return
    })
  }


  if (command === "enter") {
    if (raffleentries.includes(message.author.id)) {
      return message.reply("You have already entered into the raffle!")
    }

    if (raffle == true && raffleentries.length < rafflenum) {
      raffleentries.push(message.author.id);
      if (raffleentries.length >= rafflenum) {
        console.log(message.author.username + " has joined as the last member of the raffle")
        message.reply(" has joined as the last member of the raffle with")
      }
      else {
        console.log(message.author.username + " has joined the raffle with " + raffleentries.length + "/" + rafflenum + " participants")
        message.reply(" has joined the raffle with " + raffleentries.length + "/" + rafflenum + " participants")
      }
    }
    else {
      return message.reply("There is no ongoing raffle to join")
    }
    if (raffleentries.length >= rafflenum) {
      let winner = Math.floor(Math.random() * raffleentries.length)
      console.log("Winner is " + raffleentries[winner])
      message.channel.send("<@" + raffleentries[winner] + "> has won the raffle")
      raffle = false
      raffleentries = [""]
      rafflenum = 0
      return
    }
  }

  if (command === "raffle") {
    //if (isStaff(message)) {
    rafflenum = ~~args.slice(0).join(' ')
    console.log("Raffle Started with max of " + rafflenum)
    if (rafflenum == "" || rafflenum == undefined) {
      rafflenum = 0
      return message.reply("You need to include a maximum number of people who can join the raffle")
    }
    if (rafflenum < 1) {
      rafflenum = 0
      return message.reply("The maximum amount of raffle participants must be greater than 2")
    }
    raffle = true;
    return message.channel.send("" + message.author + " has started a raffle with a maximum # of participants of **" + rafflenum + "**")
  }

  if (command === "participants" || command === "part") {
    if (raffle == true) {
      if (raffleentries.length <= 0) {
        return message.reply("Nobody has entered into the current raffle")
      }
      let participants = ""
      for (i = 0; i < raffleentries.length; i++) {
        participants += "<@" + raffleentries[i] + "> \n"
      }
      let embed = {
        "color": 3447003,
        "fields": [
          {
            "name": "***Participants:***",
            "value": participants
          }
        ]
      }
      return message.channel.send({ embed })
    }
    else {
      return message.reply("There is no ongoing raffle to join")
    }
  }

  if (command === "stopraffle") {
    if (isStaff(message)) {
      rafflenum = 0
      raffle = false
      raffleentries = []
      return message.channel.send("" + message.author + " has stopped the raffle, therefore no winner will be selected")
    }
    else {
      return message.reply("You don't have the correct role to use that command")
    }
  }

  if (command === "help") {
    let embed = {
      "description": `***Use the prefix ${config.prefix} for all commands*** \n **Reputation Commands** ***THIS ALL IS OLD***`,
      "color": 3447003,
      "fields": [
        {
          "name": "+rep or -rep [username]",
          "value": "Gives or Removes, depending on +/-, another player's reputation"
        },
        {
          "name": "profile [username](optional)",
          "value": "Shows your current reputation or someone else's"
        },
        {
          "name": "addshop [url]",
          "value": " **TRUSTED TRADER ONLY**"
        },
        {
          "name": "shop [username]",
          "value": "Show's a Trusted Trader's Shop"
        },
        {
          "name": "leaderboard",
          "value": "Displays the top 3 users with the highest reputation"
        },
        {
          "name": "Misc Commands",
          "value": "---------------------"
        },
        {
          "name": "dice",
          "value": "Rolls a dice"
        },
        {
          "name": "coinflip",
          "value": "Flips a coin"
        },
        {
          "name": "member",
          "value": "Gives you the member role"
        },
        {
          "name": "bear",
          "value": "Gives you the BEAR role"
        },
        {
          "name": "usec",
          "value": "Gives you the USEC role"
        },
        {
          "name": "notify",
          "value": "Gives you the notify role"
        },
        {
          "name": "ping",
          "value": "Pings the bot and returns latency"
        },
        {
          "name": "tarvu",
          "value": ":octopus:"
        },
        {
          "name": "Raffle Commands",
          "value": "-----------------------"
        },
        {
          "name": "raffle [max # of participants]",
          "value": "Starts a raffle that ends when specificed number of people enter"
        },
        {
          "name": "enter",
          "value": "Enters ongoing raffle"
        },
        {
          "name": "participants",
          "value": "Lists all participants of current raffle"
        },
        {
          "name": "Admin Commands",
          "value": "-----------------------"
        },
        {
          "name": "setrep +/- [username] num",
          "value": "Gives or Removes, depending on +/-, another player's reputation"
        },
        {
          "name": "stopraffle",
          "value": "Stops current raffle"
        },
        {
          "name": "timedroles",
          "value": "Gives out Timed Roles"
        }
      ]
    }
    return message.author.send({ embed })
  }

})

client.login(config.token)
