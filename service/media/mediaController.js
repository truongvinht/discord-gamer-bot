// mediaController.js
// Controller for media playback
// ================

const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const c = require("../../helper/envHandler");

const mediaPlay = async (message) => {
    try {
        const args = message.content.split(" ");
        const queue = message.client.queue;
        const serverQueue = message.client.queue.get(message.guild.id);
  
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.channel.send(
            "You need to be in a voice channel to play music!"
            );
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
            );
        }

        const textpermissions = message.channel.permissionsFor(message.client.user);
        if (textpermissions.has("MANAGE_CHANNELS")) {
          message.delete();
        }
  
        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
          title: songInfo.title,
          url: songInfo.video_url
        };
  
        if (!serverQueue) {
          const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
          };
  
          queue.set(message.guild.id, queueContruct);
  
          queueContruct.songs.push(song);
  
          try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message, queueContruct.songs[0]);
            return message.channel.send(
              `Playing ${song.title}`
            );
          } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
          }
        } else {
          serverQueue.songs.push(song);
          return message.channel.send(
            `${song.title} has been added to the queue!`
          );
        }
      } catch (error) {
        console.log(error);
        message.channel.send(error.message);
      }
}

function play(message, song) {
    const queue = message.client.queue;
    const guild = message.guild;
    const serverQueue = queue.get(message.guild.id);

    if (!song) {
      serverQueue.voice.channel.leave();
      queue.delete(guild.id);
      return;
    }

    const voiceConnection = serverQueue.connection;

    const dispatcher = voiceConnection
      .play(ytdl(song.url, { fliter: "audioonly" }))
      .on("end", () => {
        console.log("Music ended!");
        serverQueue.songs.shift();
        this.play(message, serverQueue.songs[0]);
      })
      .on("error", error => {
        console.error(error);
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

const summon = (message) => {
    try {
        const voiceChannel = message.member.voice.channel;//voiceChannel;
      if (!voiceChannel)
        return message.channel.send(
          "You need to be in a voice channel to play music!"
        );
      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
          "I need the permissions to join and speak in your voice channel!"
        );
      }

      try {
        voiceChannel.join();
      } catch (err) {
        console.log(err);
        return message.channel.send(err);
      }

    }catch (error) {
        console.log(error);
        message.channel.send(error.message);
    }
}

const disconnect = (message) => {

    try {
      const voiceChannel = message.member.voice.channel;
      try {
        const serverQueue = message.client.queue.get(message.guild.id);
        const voiceConnection = serverQueue.connection;
        voiceConnection.disconnect();
        message.client.queue = new Map();
      } catch (err) {
        console.log(err);
        return message.channel.send(err);
      }

      voiceChannel.leave();
    }catch (error) {
        console.log(error);
        message.channel.send(error.message);
    }
}

const queue = (message) => {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to add music!');
    if (!serverQueue) return message.channel.send('Playing queue is empty!');
    
    var playingSongs = "Current playing: \n";
    
    var count = 1;
    for (let index in serverQueue.songs) {
      let song = serverQueue.songs[index]
      playingSongs = `${playingSongs}${count}. ${song.title}\n`;
      count++; 
    }
    return message.channel.send(playingSongs);
}

const skip = (message) => {
  const serverQueue = message.client.queue.get(message.guild.id);
  if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
  if (!serverQueue) return message.channel.send('There is no song that I could skip!');
  serverQueue.connection.dispatcher.end();
}

//export
module.exports = {
    play: mediaPlay,
    summon:summon,
    disconnect:disconnect,
    queue: queue,
    skip:skip
};