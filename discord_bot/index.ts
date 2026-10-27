import { ActivityType, ChannelType, Client, GatewayIntentBits } from 'discord.js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ],
});

client.once('ready', () => {
    console.log('Bot is ready!');
    client.user?.setActivity("DCTerra Livestream 24H", { type: ActivityType.Playing })
})

async function getVerifiedName(token: string): Promise<string | null> {
    // Implement your token validation logic here
    // For example, you can check if the token exists in a database or matches a predefined value
    const query = 'SELECT name FROM users WHERE discord_code = ?';
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
        console.log("Database connection")
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        const [rows] = await connection.execute(query, [token]);
        const name = (rows as { name: string }[])[0]?.name;
        return name ?? null;
    }
    console.log("Returning false")
    return null;
}

client.on('guildMemberAdd', (member) => {
    console.log(`New member joined: ${member.user.tag}`);
    // Send a message to the user and ask for there unique token that they received in there email.
    // Give them some time to respond and then check if the token is valid. If it is valid, give them the role of "leerling" and send them a message saying that they have been verified. If it is not valid, send them a message saying that the token is invalid and ask them to try again.
    member.send('Welkom bij de Discord server van de DCTerra Livestream! Om toegang te krijgen tot de server, hebben we een unieke token nodig die je per e-mail hebt ontvangen. Stuur ons deze token alsjeblieft terug zodat we je kunnen verifiëren.').then(() => {
        const filter = (response: any) => response.author.id === member.id && response.content.trim() !== '';
        const collector = member.dmChannel?.createMessageCollector({ filter, time: 60000 });

        collector?.on('collect', (message) => {
            const token = message.content.trim();
            // Check if the token is valid
            getVerifiedName(token).then((name) => {
                if (name) {
                    collector?.stop();
                    // Give the user the "Verified" role
                    const role = member.guild.roles.cache.find((r) => r.name === 'leerling');
                    if (role) {
                        member.roles.add(role).then(() => {
                            member.setNickname(name).catch((error) => {
                                console.error('Failed to set nickname:', error);
                            });
                            member.guild.channels.create({
                                name,
                                type: ChannelType.GuildVoice,
                                permissionOverwrites: [
                                    {
                                        id: member.guild.roles.everyone.id,
                                        deny: ['Connect'],
                                    },
                                    {
                                        id: member.id,
                                        allow: ['Connect', 'Speak', 'Stream', 'UseVAD'],
                                    }
                                ],
                            }).then(channel => {
                                channel.setParent("1548991553719246949", { lockPermissions: false })
                            })
                            message.reply('Je bent succesvol geverifieerd en hebt nu toegang tot de server!');
                        }).catch((error) => {
                            console.error('Failed to add role:', error);
                            message.reply('Er is een fout opgetreden bij het verifiëren. Probeer het later opnieuw.');
                        });
                    } else {
                        message.reply('De rol "leerling" bestaat niet op deze server. Neem contact op met een beheerder.');
                    }
                } else {
                    message.reply('De token die je hebt opgegeven is ongeldig. Probeer het opnieuw.');
                }
            });
        });
    });
});


client.login("").catch((error) => {
    console.error('Failed to login:', error);
});