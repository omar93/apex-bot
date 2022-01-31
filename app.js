import dotenv from 'dotenv'
dotenv.config()
import Discord from 'discord.js'
import cron from 'node-cron'
import axios from 'axios'
const client = new Discord.Client()

let baseUrl = `https://api.mozambiquehe.re/`
let mapEndpoint = 'maprotation?version=2'
let auth = `&auth=${process.env.APEX_API_KEY}`
let mainchat = '113408712395264000'
let interval = ''
let newRemainingTimeString = ''

let callApexApi = async _ => {
    let url = baseUrl+mapEndpoint+auth
    try {
        let response = await axios.get(url)
        return response.data.battle_royale.current
    } catch (e) {
        console.log('error on apex api call')
        console.log(e)
    }
}

client.on('message', async msg => {
    if (msg.content.toLowerCase() === 'apexmap' || msg.content.toLowerCase() === 'apex map') {
        let currentMapData = await callApexApi()
        let map = currentMapData
        const channel = client.channels.get(mainchat)
        channel.send(`\nCurrentmap:  ${map.map}\nTimeleft: ${map.remainingTimer}`);
    }
})

getTimeAndMap(false)

// Runs every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    getTimeAndMap(true)
})

async function getTimeAndMap(isApicall) {

    if(interval != '' || isApicall) {
        clearInterval(interval)
    }

    let response = await callApexApi()
    let currentMap = response.map
    let timeLeft = response.remainingSecs
    let clock = 60

    newRemainingTimeString = updateRemainingTime(timeLeft)
    updateDiscordStatus(currentMap, newRemainingTimeString)

    interval = setInterval( _ => {
        timeLeft -= 1
        clock -= 1
        if(clock === 0) {
            newRemainingTimeString = updateRemainingTime(timeLeft)
            clock = 60
            updateDiscordStatus(currentMap, newRemainingTimeString)
        }
    }, 1000)

}

function updateDiscordStatus(currentMap, remainingTime) {
    console.log(`${currentMap} ${remainingTime}`);
    client.on('ready', client => {
        console.log('client data:');
        console.log(client);
    })
    client.user.setPresence({
        status: "online",  // You can show online, idle... Do not disturb is dnd
        game: {
            name: `${currentMap} ${remainingTime}`,  // The message shown
            type: "PLAYING" // PLAYING, WATCHING, LISTENING, STREAMING,
        }
    })
}

function updateRemainingTime(timeLeft) {
    let hours = Math.floor(timeLeft / 3600)
    let hoursString = Math.floor(timeLeft / 3600) < 1 ? '' : `${Math.floor(timeLeft / 3600)}h`
    let minutes = Math.floor((timeLeft - (hours * 3600)) / 60)+'m'
    return `${hoursString} ${minutes}`
}



client.login(process.env.CLIENT_TOKEN)
