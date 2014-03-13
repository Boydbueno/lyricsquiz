function htmlEncode(string) {
   return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/, "&apos;");
}

;(function($, SLQ) {
   "use strict";

    SLQ.LyricsApi = function() {
      // this.uri = "http://api.musixmatch.com/ws/1.1/";
      this.uri = "http://bbueno.com/epicLyrix/public/";
      this.apikey = "d819cb395fadffcbaf1eff4c09b885b6";

      this.bindSubsribers();
   };

   SLQ.LyricsApi.prototype = {
      bindSubsribers: function() {
         SLQ.events.on("track:updated", this.getTrackId, this);
         SLQ.events.on("trackId:updated", this.fetchSubtitlesByTrackId, this);
      },

      getTrackId: function(track) {
         $.ajax({
            url: this.uri + "track.search",
            type: 'get',
            dataType: 'jsonp',
            data: {
               q: track.name.toLowerCase(),
               apikey: this.apikey,
               format: 'jsonp'
            }
         }).success(function(data) {
            if (!data.message) {
               SLQ.events.trigger("noLyricsFound");
            } else {
               SLQ.events.trigger("trackId:updated", data.message.track_id);
            }
         });

      },

      fetchSubtitlesByTrackId: function(trackId) {
         $.ajax({
            url: this.uri + "track.subtitle.get",
            type: 'get',
            dataType: 'jsonp',
            data: {
               track_id: trackId,
               apikey: this.apikey
            }
         }).success(function(data) {
            SLQ.events.trigger("subtitles:updated", data.message.body.subtitle.subtitle_body);
         });
      }
   };

})(jQuery, window.SLQ = window.SLQ || {});