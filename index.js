require('dotenv').config();
const { Client, Collection, Intents} = require('discord.js');
const fs = require('fs');
const chalk = require('chalk');
const mysql = require('mysql');
const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: 'DBMS_bot',
    password: "mysql"
});

database.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

const token = process.env.TOKEN;
const client = new Client({ intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.DIRECT_MESSAGES
] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {

	console.log(`Logged in as: ${client.user.tag} with ${commandFiles.length} commands.`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		console.log(`${interaction.commandName} - Executing the interaction (${interaction.user.username})`);
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageCreate', async message => {
    console.log(chalk.yellow("Message created"));

    let userID = message.author.id;
    let userName = message.author.username;
	let userDiscriminator = message.author.discriminator;

    let msgID = message.id;
    let msgContent = message.content;
    let msgTime = message.createdTimestamp;
    let msgGuildName = message.guild.name;
    let msgGuildID = message.guild.id;
    let msgChannelName = message.channel.name;
    let msgChannelID = message.channel.id;
    
    query(
        `INSERT INTO \`933778686023450694\` (\`userid\`, \`username\`, \`userdiscriminator\`, \`msgid\`, \`msgcontent\`, \`msgtime\`, \`msgguildname\`, \`msgguildid\`, \`msgchannelname\`, \`msgchannelid\`, \`msgeditedtime\`, \`msgdeletedtime\`, \`key\`)` +
        `VALUES ('${userID}', '${userName}', '${userDiscriminator}', '${msgID}', '${msgContent}', '${msgTime}', '${msgGuildName}', '${msgGuildID}', '${msgChannelName}', '${msgChannelID}', '${0}', '${0}', NULL)`
    );
});

// Whenever someone edits a message.
client.on('messageUpdate', async (oldMessage, newMessage) => {
    console.log(chalk.yellow("Message updated"));
    let userID = newMessage.author.id;
    let userName = newMessage.author.username;
	let userDiscriminator = newMessage.author.discriminator;

    let msgID = newMessage.id;
    let msgContent = newMessage.content;
    let msgTime = newMessage.createdTimestamp;
    let msgGuildName = newMessage.guild.name;
    let msgGuildID = newMessage.guild.id;
    let msgChannelName = newMessage.channel.name;
    let msgChannelID = newMessage.channel.id;
    let msgEditedTime = Date.now();
    
    query(
        `INSERT INTO \`933778686023450694\` (\`userid\`, \`username\`, \`userdiscriminator\`, \`msgid\`, \`msgcontent\`, \`msgtime\`, \`msgguildname\`, \`msgguildid\`, \`msgchannelname\`, \`msgchannelid\`, \`msgeditedtime\`, \`msgdeletedtime\`, \`key\`)` +
        `VALUES ('${userID}', '${userName}', '${userDiscriminator}', '${msgID}', '${msgContent}', '${msgTime}', '${msgGuildName}', '${msgGuildID}', '${msgChannelName}', '${msgChannelID}', '${msgEditedTime}', '${0}', NULL)`
    );
});

// Whenever someone deleted a message.
client.on('messageDelete', async message => {
    console.log(chalk.yellow("Message deleted"));
    let msgDeletedTime = Date.now(); // There is no message.deletedTimestamp. We make our own B).

    let userID = message.author.id;
    let userName = message.author.username;
	let userDiscriminator = message.author.discriminator;
    let msgID = message.id;
    let msgContent = message.content;
    let msgTime = message.createdTimestamp;
    let msgGuildName = message.guild.name;
    let msgGuildID = message.guild.id;
    let msgChannelName = message.channel.name;
    let msgChannelID = message.channel.id;
    
    query(
        `INSERT INTO \`933778686023450694\` (\`userid\`, \`username\`, \`userdiscriminator\`, \`msgid\`, \`msgcontent\`, \`msgtime\`, \`msgguildname\`, \`msgguildid\`, \`msgchannelname\`, \`msgchannelid\`, \`msgeditedtime\`, \`msgdeletedtime\`, \`key\`)` +
        `VALUES ('${userID}', '${userName}', '${userDiscriminator}', '${msgID}', '${msgContent}', '${msgTime}', '${msgGuildName}', '${msgGuildID}', '${msgChannelName}', '${msgChannelID}', '${0}', '${msgDeletedTime}', NULL)`
    );
});

client.login(token);

function query(query) {
    database.query(query,(err, response) => {
        if(err) {
            console.error(err);
            return;
        }
    });
}