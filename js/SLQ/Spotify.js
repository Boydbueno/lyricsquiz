;(function($, SLQ) {
   "use strict";

   SLQ.Spotify = function() {
      this.sp = getSpotifyApi(1);
      this.models = this.sp.require('$api/models');
      this.player = this.sp.require('js/plugins/player-fix').player;

      this._track = this.player.track;
      this._position = null;

      this.bindSubsribers();
      this.bindListeners();
      this.startWatchingPosition();
   };

   SLQ.Spotify.prototype = {
      bindSubsribers: function() {
         SLQ.events.on("app:start", this.updateTrack, this);
         SLQ.events.on("quizMode:changed", function(isEnabled) {
            if (isEnabled) {
               this.setPosition(0);
            }
         }, this);
      },

      bindListeners: function() {
         var self = this;
         this.player.on('play', function() {

         }).on('pause', function() {

         }).on('playbackChange', function(isPlaying) {

         }).on('trackChange', function(track) {
            self.track = track;
         }).on('shuffleChange', function(shuffle) {

         }).on('repeatChange', function(repeat) {

         }).on('volumeChange', function(volume) {

         }).on('contextChange', function() {

         });
      },

      startWatchingPosition: function() {
         window.setInterval( $.proxy(function() {
            this.position = this.player.position;
         }, this), 100);
      },

      updateTrack: function() {
         this.track = this.player.track;
      },

      setPosition: function(position) {
         this.player.position = position;
      }
   };

   Object.defineProperties(SLQ.Spotify.prototype, {
      track: {
         get: function() {
            return this._track;
         },
         set: function(val) {
            this._track = val;
            SLQ.events.trigger("track:updated", val);
         }
      },
      position: {
         get: function() {
            return this._position;
         },
         set: function(val) {
            if (val === this.position) return;
            var prevPosition = this.position;
            this._position = val;
            SLQ.events.trigger("position:updated", val, prevPosition);
         }
      }
   });

})(jQuery, window.SLQ = window.SLQ || {});