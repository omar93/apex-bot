import dotenv from 'dotenv'
dotenv.config()
import Discord from 'discord.js'
import axios from 'axios'
import cron from 'node-cron'

const client = new Discord.Client()

let baseUrl = `https://api.mozambiquehe.re/`
let mapEndpoint = 'maprotation?version=2'
let auth = `&auth=${process.env.APEX_API_KEY}`
let mainchat = '113408712395264000'
let worldsEdge = 'worlds_edge_rotation'
let roleID = '934469543936528534'
let announce = false

let callApexApi = async _ => {
    let url = baseUrl+mapEndpoint+auth
    let response = await axios.get(url)
    return response.data.battle_royale
}

// Runs every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    let currentMapData = await callApexApi()
    let map = currentMapData.current.code

    if(map != worldsEdge) {
        announce = true
    }

    if(map === worldsEdge && announce) {
        const channel = client.channels.get(mainchat)
        channel.send(`We live boys! <@&934469543936528534>`)
        channel.mention(roleID)
        announce = false
    }
})

client.login(process.env.CLIENT_TOKEN)