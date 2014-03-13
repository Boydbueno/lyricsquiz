;(function($, SLQ) {
   "use strict";

   SLQ.LyricLine = function(text, time) {
      this.text = text;
      this.time = time;
      this.$el = this.createEl(this.text, this.time);
      this.quizLine = false;

   };

   SLQ.LyricLine.prototype.turnIntoQuizLine = function(text) {
      this.text = text;
      this.$el = this.createEl(this.text, this.time);

      this.quizLine = true;
      SLQ.events.trigger("lyricLine:updated", this);
   };

   SLQ.LyricLine.prototype.turnIntoNormalLine = function() {
      var fullLine = "";

      var start = this.$el.find(".before").text();
      var answer = this.$el.find("input").data('answer');
      var end = this.$el.find(".after").text();

      fullLine += (start.length === 1) ? "" : start;
      fullLine += answer;
      fullLine += (end.length === 1) ? "" : end;

      this.text = fullLine;
      this.$el = this.createEl(this.text, this.time);

      this.quizLine = false;

      SLQ.events.trigger("lyricLine:updated", this);
   };

   SLQ.LyricLine.prototype.createEl = function(text, time) {
      return $("<li data-time='" + time + "'>" + text + "</li>");
   };

})(jQuery, window.SLQ = window.SLQ || {});