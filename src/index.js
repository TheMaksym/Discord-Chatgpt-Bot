require('dotenv').config();
const OpenAI = require("openai");
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const cron = require('node-cron');
//Chat GPT !!! //nodemon to start, on GitBash terminal
const openai = new OpenAI({
    key: process.env.OPENAI_API_KEY, // https://platform.openai.com/account/usage
});
const EXCLUDED_USER_IDS = [249325825076232192, 156869924621385728, 1015163673486049332, 322104281282904065]; // 'USER_ID_1', 'USER_ID_2', 'USER_ID_3'
//Actual Discord bot
const { Client, IntentsBitField, AttachmentBuilder} = require('discord.js'); // https://discord.com/developers/applications

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const userCallCounts = new Map();
const userVVVCallCounts = new Map();
let lastResetDate = new Date().toDateString();

function resetCallCountsIfNeeded() {
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
        userCallCounts.clear();
        userVVVCallCounts.clear();
        lastResetDate = today;
    }
}

client.on('ready', () => {
    console.log(`${client.user.username} is online.`);
    client.user.setPresence({ activities: [{ name: '"!helpmegod" for divine intervention' }] });

    //     // Immediately check if the file exists
    //     const filePath = 'goodMorning.jpg'; // Update the path to your file
    //     if (fs.existsSync(filePath)) {
    //         console.log('File exists:', filePath);
    //     } else {
    //         console.log('File does not exist:', filePath);
    //     }

    //     // Schedule a daily message with file
    //     cron.schedule('0 9 * * *', () => {
    //         const channel = client.channels.cache.get('935643914549985331'); // Replace with your channel ID
            
    //         // Since we already checked if the file exists, assume it's there (or handle differently if needed)
    //         if (fs.existsSync(filePath)) {
    //             const file = new AttachmentBuilder(filePath);
    //             channel.send({
    //                 content: "Good morning! Here's your daily message: Make each day, the best day of life. Trust not tomorrow! Whatever you are planning, today is the best day to act! Live as if the best day is today; plan as if the best day was yesterday.",
    //                 files: [file]
    //             }).then(() => {
    //                 console.log('File sent successfully.');
    //             }).catch(console.error);
    //         } else {
    //             console.log('File does not exist at scheduled time:', filePath);
    //             // Optionally, send a message to the channel indicating the file does not exist
    //             channel.send("Failed to send the daily file because it does not exist.");
    //         }
    //     }, {
    //         scheduled: true,
    //         timezone: "Europe/Warsaw" // Adjust timezone if needed
    //     });
});

const filePath = 'context.txt';

const rl = readline.createInterface({
  input: fs.createReadStream(filePath),
  output: process.stdout,
  terminal: false
});

let fileContents = '';

rl.on('line', (line) => {
  fileContents += line + '\n';
});

rl.on('close', () => {
    console.log('File read complete.');
    console.log('Contents:', fileContents);
    characterLimit = 2000;
    client.on('messageCreate', (message) => {
    resetCallCountsIfNeeded();

    const prompt_pre = " ";
    const context = fileContents;

    const inputString = message.content;
    const startIndex = 0;
    const endIndex = 4;
    const godComplex = inputString.slice(startIndex, endIndex);

    const messageIndex = 4;
    const messageToGod = inputString.slice(messageIndex);

    const messageVVVindex = 10;
    const messageToVVV = inputString.slice(messageVVVindex);
    // Dall-e 
    const conjureToGod = inputString.slice(12);

    if (message.author.bot){
        return;
    }
    if (message.content.toLowerCase() === '!helpmegod') {
        const helpMessage = `**How to use ${client.user.username}**\n` +
                            `• Type "God " followed by your question to get a response.\n` +
                            `• Example: "God {message to send the god}"\n` +
                            `**If it's inappropriate the image won't generate; PG13 or lower. (You only get two calls of this per day make it count {might change this bc money})**\n` + 
                            // ** change this for call count
                            `• Example: "God conjure {image to create}"\n` +
                            `• Use "!helpmegod" to display this message.`;
                            
        message.reply(helpMessage);
    }
    
    if (inputString.startsWith('God conjure ')) {
        console.log(conjureToGod);
        const userId = Number(message.author.id);
        console.log(message.author.username + " Created image");
        const today = new Date().toDateString();
        const userCallCount = userCallCounts.get(userId) || { date: today, count: 0 };
        
        if (EXCLUDED_USER_IDS.includes(userId) || (userCallCount.date === today && userCallCount.count < 2)) { // limites calls to 2** change this value for more
            if (!EXCLUDED_USER_IDS.includes(userId)) {
                userCallCount.count++;
                userCallCounts.set(userId, userCallCount);
            }
            message.reply("Please allow a moment for the image to generate. If it's inappropriate it won't generate.");
            async function runDalle() {
                const response = await axios.post('https://api.openai.com/v1/images/generations', {
                    model: "dall-e-3",
                    prompt: conjureToGod,
                    n: 1,
                    size: "1024x1024",
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                const imageUrl = response.data.data[0].url;
                const imageAttachment = new AttachmentBuilder(imageUrl, { name: 'image.png' });
                return imageAttachment;
            }
            runDalle().then((imageAttachment) => {
                message.reply({ files: [imageAttachment] });
            }).catch(console.error);
        } else if (userCallCount.date !== today) {
            userCallCounts.set(userId, { date: today, count: 1 });
            message.reply("Please allow a moment for the image to generate. If it's inappropriate it won't generate.");
            // Your code for handling the image generation
        } else {
            message.reply("You have reached the limit of 2 calls for today (OpenAI wants too much money for this)."); // ** change this for calls
        }
    }
    if (inputString.startsWith('God of VVV')) {
        console.log("God of VVV command detected");
        const userId = Number(message.author.id);
        const today = new Date().toDateString();
        const userCallCount = userVVVCallCounts.get(userId) || { date: today, count: 0 };
    
        if (EXCLUDED_USER_IDS.includes(userId) || (userCallCount.date === today && userCallCount.count < 2)) { 
            if (!EXCLUDED_USER_IDS.includes(userId)) {
                userCallCount.count++;
                userVVVCallCounts.set(userId, userCallCount);
            }
            async function runConversation(message) {
                console.log("Running conversation function");
                const messages = [
                    {"role": "system", "content": context},
                    {"role": "user", "content" : prompt_pre + message.author.id + " " + message.author.username +"\n###\n" + messageToVVV + "\n###"}
                ];
                console.log("Message to VVV:", messageToVVV);
                const response = await openai.chat.completions.create({
                    model: "gpt-4o", 
                    messages: messages,
                });
                console.log("Response from OpenAI:", response);
    
                const responseMessage = response.choices[0].message;
                console.log("Tokens used in API call: ", response['usage']['total_tokens']);
    
                let responseContent = responseMessage.content;
                let messagesToSend = [];
    
                while (responseContent.length > characterLimit) {
                    messagesToSend.push(responseContent.slice(0, characterLimit));
                    responseContent = responseContent.slice(characterLimit);
                }
    
                messagesToSend.push(responseContent);
    
                for (let messageToSend of messagesToSend) {
                    message.reply(messageToSend);
                }
            }
            runConversation(message).catch(console.error);
        } else {
            message.reply("You have reached the limit of 2 calls for today.");
        }
    }
    
    else if (godComplex === 'God?' | godComplex === 'God.' | godComplex === 'God '| godComplex === 'God!'){
        async function runConversation(message) {
            const messages = [{"role": "user", "content" : prompt_pre + messageToGod + "\n###"}];
    
            const response = await openai.chat.completions.create({
                model: "gpt-4o", //gpt-3.5-turbo //gpt-4 //gpt-4o
                messages: messages,
            });
    
            console.log("Tokens used in API call: ", response['usage']['total_tokens']);
            console.log(messageToGod + "test1");
    
            let responseMessage = response.choices[0].message;
            let responseContent = responseMessage.content;
            let messagesToSend = [];

            while (responseContent.length > characterLimit) {
                messagesToSend.push(responseContent.slice(0, characterLimit));
                responseContent = responseContent.slice(characterLimit);
            }

            messagesToSend.push(responseContent);

            for (let messageToSend of messagesToSend) {
                message.reply(messageToSend);
            }
        }
    
        runConversation(message).catch(console.error);
    }
    
    if (godComplex === 'god?' | godComplex === 'god.' | godComplex === 'god ' | godComplex === 'god!') {
        const helpMessage = `**How to use ${client.user.username}**\n` +
                            `• Type "God " where 'g' is capital 'G' followed by your question to get a response.\n` +
                            `• Example: "God {message to send the god}"\n` +
                            `**If it's inappropriate the image won't generate; PG13 or lower. (You only get two call of this per day make it count)**\n` +
                            `• Example: "God conjure {image to create}"\n` +
                            `• Use "!helpmegod" to display this message.`;
                            
        message.reply(helpMessage);
    }
    if (message.content === 'god') {
        console.log(message.author.id + " " + message.author.username);
        if (EXCLUDED_USER_IDS.includes(Number(message.author.id))) {
            message.reply('You are an amazing human being.');
        } else {
            message.reply('I gochu fam.');
        }
    }
    });
    // if (message.content === 'fundme') {
    //     console.log(message.author.id + " " + message.author.username);
    //     if(message.author.id == 249325825076232192){
    //         message.reply('You are an amazing human being.');
    //     }
    //     else{
    //         message.reply('paypal.me/maksymmarek1');
    //     }
    // }
    // });
});

client.login(process.env.DISCORD_KEY)