import dotenv from 'dotenv'
dotenv.config()
import Discord from 'discord.js'
import axios from 'axios'
const client = new Discord.Client()

let baseUrl = `https://api.mozambiquehe.re/`
let mapEndpoint = 'maprotation?version=2'
let auth = `&auth=${process.env.APEX_API_KEY}`
let mainchat = '113408712395264000'

let callApexApi = async _ => {
    let url = baseUrl+mapEndpoint+auth
    try {
        let response = await axios.get(url)
        return response.data.battle_royale
    } catch (e) {
        console.log('error on apex api call')
        console.log(e)
    }
}
client.login(process.env.CLIENT_TOKEN)
client.on('message', async msg => {
    if (msg.content.toLowerCase() === 'apexmap') {
        let currentMapData = await callApexApi()
        let map = currentMapData.current
        console.log(currentMapData);
        const channel = client.channels.get(mainchat)
        channel.send(`\nCurrentmap:  ${map.map}\nTimeleft: ${map.remainingTimer}`);
    }
})
