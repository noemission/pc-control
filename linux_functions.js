const Pulsemixer = require('pulsemixer');
const pulsemixer = new Pulsemixer();
const exec = require('child_process').exec;

const fs = require('fs')
const sudoPass = fs.readFileSync('sudo_pass.local').toString().trim()

const monitor = {
    status: () => {
        return new Promise((resolve, reject) => {
            exec('xset q', (err, stdout) => {
                if (err) return reject(err)
                try {
                    let status = stdout.match(/Monitor is (.*)/)[1] === 'On';
                    return resolve(status)
                } catch (error) {
                    reject(error)
                }
            })
        })
    },
    on: () => exec('xset dpms force on'),
    off: () => exec('xset dpms force off')
}

const audio = {
    isMuted: () => pulsemixer.getMute(),
    toggleMute: () => pulsemixer.toggleMute(),
    getVolume: () => pulsemixer.getVolume(),
    setVolume: (...args) => pulsemixer.setVolume(...args)
}

const PC = {
    shutdown: () => new Promise((resolve,reject) => exec('echo ' + sudoPass + ' | sudo -S shutdown now', err => err ? reject(err) : resolve())) ,
    restart: () => new Promise((resolve,reject) => exec('echo ' + sudoPass + ' | sudo -S shutdown -r now', err => err ? reject(err) : resolve())) ,
}

module.exports = {
    monitor,
    audio,
    PC
}