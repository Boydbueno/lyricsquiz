var sp = getSpotifyApi();
var models = sp.require('$api/models');
var Emitter = sp.require('js/plugins/emitter').Emitter;
var player = models.player;

// making player an event emitter
Emitter(player);

// initial state
var isPlaying = player.playing;
var currentTrack = player.track && player.track.uri;
var isShuffle = player.shuffle;
var isRepeat = player.repeat;
var volume = player.volume;
var context = player.context;

// observer
player.observe(models.EVENT.CHANGE, function (e) {
  if (isPlaying !== player.playing) {
    isPlaying = player.playing;
    player.emit(isPlaying ? 'play' : 'pause');
    player.emit('playbackChange', isPlaying);
  }

  if (currentTrack !== player.track.uri) {
    currentTrack = player.track.uri;
    player.emit('trackChange', player.track);
  }

  if (isShuffle !== player.shuffle) {
    isShuffle = player.shuffle;
    player.emit('shuffleChange', isShuffle);
  }

  if (isRepeat !== player.repeat) {
    isRepeat = player.repeat;
    player.emit('repeatChange', isRepeat);
  }

  if (volume !== player.volume) {
    volume = player.volume;
    player.emit('volumeChange', volume);
  }

  if (e.data.curcontext) {
    player.emit('contextChange');
  }
});

exports.player = player;