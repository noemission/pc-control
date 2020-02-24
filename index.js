const mqtt = require('mqtt')
const Pulsemixer = require('pulsemixer');
const client = mqtt.connect('mqtt://192.168.1.200:1883')
const pulsemixer = new Pulsemixer();
const exec = require('child_process').exec;

const { PC, audio, monitor } = require('./linux_functions')

client.on('connect', function () {
    console.log('connected')

    setInterval(publishVolume, 2000)
    setInterval(publishPower, 10000)
    setInterval(publishMonitorStatus, 5000)

    client.subscribe('cmnd/computer/power')
    client.subscribe('cmnd/computer/volume')
    client.subscribe('cmnd/computer/monitor')


})
let monitorStatus = undefined;
const publishMonitorStatus = async () => {
    try {
        let status = await monitor.status()
        if (status != monitorStatus) {
            monitorStatus = status;
            client.publish('stat/computer/MONITOR', status ? 'ON' : 'OFF', {
                retain: true
            })
        }
    } catch (error) {
        console.error(error)
    }
}
const publishPower = async () => {
    client.publish('stat/computer/POWER', 'ON')
}
const publishVolume = async () => {
    if (await audio.isMuted()) {
        client.publish('stat/computer/VOLUME', 'mute')
    } else {
        client.publish('stat/computer/VOLUME', await audio.getVolume() + '%')
    }
}

const handleVolume = async (message) => {
    switch (message) {
        case 'plus':
            await audio.setVolume(+(await audio.getVolume()) + 5);
            break;
        case 'minus':
            await audio.setVolume(+(await audio.getVolume()) - 5);
            break;
        case 'mute':
            await audio.toggleMute();
            break;
        default:
            break;
    }
    publishVolume()
}
const handlePower = async (message) => {
    switch (message) {
        case 'shutdown':
            PC.shutdown()
            break;
        case 'restart':
            PC.restart()
            break;
        default:
            break;
    }
}
const handleMonitor = async (message) => {
    switch (message.toLowerCase()) {
        case 'on':
            monitor.on()
            break;
        case 'off':
            monitor.off()
            break;
        default:
            break;
    }
    setTimeout(publishMonitorStatus, 2000);
}


client.on('message', function (topic, message) {
    console.log(topic, message.toString())
    if (topic === 'cmnd/computer/volume') {
        handleVolume(message.toString())
    } else if (topic === 'cmnd/computer/power') {
        handlePower(message.toString())
    } else if (topic === 'cmnd/computer/monitor') {
        handleMonitor(message.toString())
    }
})
