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
let interval

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
client.login(process.env.CLIENT_TOKEN)

client.on('message', async msg => {
    if (msg.content.toLowerCase() === 'apexmap' || msg.content.toLowerCase() === 'apex map') {
        let currentMapData = await callApexApi()
        let map = currentMapData
        const channel = client.channels.get(mainchat)
        channel.send(`\nCurrentmap:  ${map.map}\nTimeleft: ${map.remainingTimer}`);
    }
})

getTimeAndMap()

// Runs every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    getTimeAndMap()
})

async function getTimeAndMap() {
    clearInterval(interval)
    let response = await callApexApi()
    let currentMap = response.map
    let timeLeft = response.remainingSecs
    let hours   = Math.floor(timeLeft / 3600)
    let minutes = Math.floor((timeLeft - (hours * 3600)) / 60)
    let apa = minutes < 10 ? minutes : 33

    interval = setInterval( _ => {
        timeLeft -= 1
        client.user.setPresence({
            status: "online",  // You can show online, idle... Do not disturb is dnd
            game: {
                name: `${currentMap} - ${hours}h ${minutes}m`,  // The message shown
                type: "PLAYING" // PLAYING, WATCHING, LISTENING, STREAMING,
            }
        })

    }, 1000)

}