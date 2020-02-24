const winAudio = require('win-audio').speaker;
const exec = require('child_process').exec;


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
    off: () => new Promise((resolve,reject) => exec('%systemroot%\\system32\\scrnsave.scr /s', err => err ? reject(err) : resolve())) ,
}

const audio = {
    isMuted: () => winAudio.isMuted(),
    toggleMute: () => winAudio.toggle(),
    getVolume: () => winAudio.get(),
    setVolume: (...args) => winAudio.set(...args)
}

const PC = {
    shutdown: () => new Promise((resolve,reject) => exec('shutdown /s /f', err => err ? reject(err) : resolve())) ,
    restart: () => new Promise((resolve,reject) => exec('shutdown /r /f', err => err ? reject(err) : resolve())) ,
}

module.exports = {
    monitor,
    audio,
    PC
}