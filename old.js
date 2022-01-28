import dotenv from 'dotenv'
dotenv.config()
import Discord from 'discord.js'
import axios from 'axios'
import cron from 'node-cron'

const client = new Discord.Client()

let baseUrl = `https://api.mozambiquehe.re/`
let mapEndpoint = 'maprotation?version=2'
let auth = `&auth=${process.env.APEX_API_KEY}`
let timeLeft = 0

let callApexApi = async _ => {
    let url = baseUrl+mapEndpoint+auth
    let response = await axios.get(url)
    return response.data.battle_royale.current
}

// Runs every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    clearInterval(downloadTimer)
    let response = await callApexApi()
    let currentMap = response.map
    timeLeft = response.remainingSecs

    let downloadTimer = setInterval( _ => {
    if(timeLeft <= 0){
        clearInterval(downloadTimer)
    }
    timeLeft -= 1;
    }, 1000)

    client.on("ready", () =>{
        client.user.setPresence({
            status: "online",  // You can show online, idle... Do not disturb is dnd
            game: {
                name: `${currentMap} - ${timeLeft}`,  // The message shown
                type: "PLAYING" // PLAYING, WATCHING, LISTENING, STREAMING,
            }
        })
     })

})

client.login(process.env.CLIENT_TOKEN)