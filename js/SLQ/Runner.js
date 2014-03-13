;(function($, SLQ) {
   "use strict";

   Number.prototype.roundTo = function(to) {
      return Math.round(this / to) * to;
   };

   SLQ.events = _.clone(Backbone.Events);

   var interfaceApi = new SLQ.Spotify();
   var lyricsApi = new SLQ.LyricsApi();
   var appView = new SLQ.View();
   var quiz = new SLQ.LyricsQuiz();


   SLQ.events.trigger("app:start");

})(jQuery, window.SLQ = window.SLQ || {});