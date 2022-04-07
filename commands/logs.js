const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Interaction } = require('discord.js');


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


// async function find(query) {

//     let messages = [];

//     database.query(query, (err, result) => {
//         if(err) {
//             console.error(err);
//         }
//         messages.push = (result);
//     });
//     return(messages);
// }

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
                .setDescription('Number of messages to return (max 20)')),

	async execute(interaction) {
        const targetUser = interaction.options.getUser('user').id;
        const sort = interaction.options.getString('sort');
        const amount = interaction.options.getInteger('amount') || 5; 
        
        // If they enter 0 do nothing
        if(amount == 0) return;

        let query = `SELECT * FROM \`933778686023450694\` WHERE ${targetUser} = userid AND msgeditedtime = 0 ORDER BY msgtime ${sort} LIMIT ${amount}`;
        console.log(query);
        // For some reason I cannot access anything inside of this function that is not declared inside of it...
        // So for now we do everything in here :)
        database.query(query, (err, result) => {
            let embReply = new MessageEmbed()
            .setTitle(`Logs for ${targetUser}`)
            .setDescription(`Recent ${amount} messages in ${sort} order.`);
            if(err) console.error(err);
            result.forEach(element => {
                
                // embReply.addField(`${date.format(element.msgtime, 'hh:mm:ss - ddd, MMM DD YYYY')}`, element.msgcontent, false);
                embReply.addField(`${element.msgtime}`, element.msgcontent.substring(0, 200), false);
            });
            interaction.reply({embeds: [embReply]});
        });


    }
},


module.exports.help = {
	name: "logs",
	aliases: ["log"]
}