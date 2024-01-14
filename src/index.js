require('dotenv').config();
const OpenAI = require("openai");

//Chat GPT !!!
const openai = new OpenAI({
    key: process.env.OPENAI_API_KEY, // https://platform.openai.com/account/usage
});

//Actual Discord bot
const { Client, IntentsBitField} = require('discord.js'); // https://discord.com/developers/applications

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) => {
    console.log(`${c.user.username} is online.`)
})

client.on('messageCreate', (message) => {
    const inputString = message.content;
    const startIndex = 0;
    const endIndex = 4;
    const godComplex = inputString.slice(startIndex, endIndex);

    const messageIndex = 5;
    const messageToGod = inputString.slice(messageIndex);

    if (message.author.bot){
        return;
    }
    if (godComplex === 'God?' | godComplex === 'God.' | godComplex === 'God ' | godComplex === 'God!'){
        async function runConversation() {
            //const messages = [{"role": "user", "content" : messageToGod + ". Only Give a response that is less than 2000 characters and in a short format."}];
            const prompt_pre = "Provide a response to the following discord message in 2000 characters or less. Only return the response and nothing else.\n###\n"
            const messages = [{"role": "user", "content" : prompt_pre + messageToGod + "\n###"}];
        
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", //gpt-3.5-turbo //gpt-4
                messages: messages,
            });
            
            const responseMessage = response.choices[0].message;

            console.log("Tokens used in API call: ", response['usage']['total_tokens']);

            return responseMessage.content;
        }
        runConversation().then((responseContent) => {message.reply(responseContent);}).catch(console.error);
    }
    if (godComplex === 'god ') {
        message.reply('YOU WILL REFER TO ME AS "God" !!');
    }
    if (message.content === 'nerd') {
        message.reply('bozo');
    }

    console.log(message.content);
})

client.login(process.env.DISCORD_KEY)