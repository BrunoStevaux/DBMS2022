const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Interaction } = require('discord.js');
const date = require('date-and-time');

const mysql = require('mysql');

const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: 'DBMS_bot',
    password: "mysql"
});

database.connect(function(err) {
    if (err) throw err;
    console.log("LOG.JS Connected!");
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('logs')
		.setDescription('View the messaging history of other users.')
        .addUserOption(option => 
            option.setName('user')
            .setRequired(true)
            .setDescription('The user'))
        .addStringOption(option =>
            option.setName('sort')
                .setDescription('How to sort the data')
                .setRequired(true)
                .addChoice('DESC', 'DESC')
                .addChoice('ASC', 'ASC'))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to return (max 10)')),

	async execute(interaction) {
        const targetUser = interaction.options.getUser('user').id;
        const sort = interaction.options.getString('sort');
        const amount = interaction.options.getInteger('amount') || 5; 
        
        // If they enter 0 do nothing
        if(amount == 0) return;

        let query = `SELECT * FROM \`933778686023450694\` WHERE ${targetUser} = userid ORDER BY msgtime ${sort}, msgeditedtime ${sort} LIMIT ${amount}`;
        console.log(query);

        let embReply = new MessageEmbed()
            .setTitle(`Logs for ${interaction.options.getUser('user').username}`)
            .setDescription(`Recent ${amount} messages in ${sort} order.`)
            .setThumbnail(interaction.options.getUser('user').displayAvatarURL());
        
        let result = await this.querytest(query);
        result.forEach(element => {
            console.log(element);
            let content;

            // If message is deleted
            if (parseInt(element.msgdeletedtime) > 0) {
                content = `[DELETED] ${element.msgcontent.substring(0, 200) || "..."}`;
            } else {
                content = element.msgcontent.substring(0, 200) || "...";
            }

            // If message is edited
            if (parseInt(element.msgeditedtime) > 0) {
                content = `[EDITED] ${element.msgcontent.substring(0, 200) || "..."}`;
            } else {
                content = element.msgcontent.substring(0, 200) || "...";
            }
            
            embReply.addField(`${date.format(new Date(element.msgtime), 'hh:mm:ss - ddd, MMM DD YYYY')}`, content, false);
        });

        interaction.reply({embeds: [embReply]});
    },

    querytest(query) {
        return new Promise((resolve, reject) => {
            database.query(query, (err, result) => {
                if(err) return reject(err)
                resolve(result);
            });
        })
    }
},


module.exports.help = {
	name: "logs",
	aliases: ["log"]
}