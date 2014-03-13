;(function($, SLQ) {
   "use strict";

   SLQ.View = function() {
      this.lyricList = $("#lyricList");
      this.quizModeBtn = $("#quiz-mode");
      this.difficultySelect = $("#difficulty");
      this.bindSubsribers();
      this.bindListeners();
   };

   SLQ.View.prototype = {
      bindSubsribers: function() {
         SLQ.events.on("lyrics:updated", function(lyrics) {
            this.clearLyrics();
            this.appendLyrics(lyrics);
         }, this);

         SLQ.events.on("lyricLine:updated", function(lyricLine) {
            this.updatelyricLine(lyricLine);
         }, this);

         SLQ.events.on("currentLyricLine:updated", function(currentLyricLine) {
            this.highlightLyricLine(currentLyricLine);
         }, this);

         SLQ.events.on("position:updated", function(position, prevPosition) {
            this.markPreviousOpenQuizLinesAsWrong(position);
         }, this);

         SLQ.events.on("quizAnswer:correct", function(line) {
            var fullLine = line.find(".before").text() + line.find("input").data('answer') + line.find(".after").text();
            line.text(fullLine);
            line.addClass("correct");
         });

         SLQ.events.on("quizAnswer:wrong", function(line) {
            var fullLine = line.find(".before").text() + line.find("input").data('answer') + line.find(".after").text();
            line.text(fullLine);
            line.addClass("wrong");
         });

         SLQ.events.on("quizMode:changed", function(isEnabled) {
            if (!isEnabled) {
               this.resetView();
            } else {
               $(".scores").show();
               $(".settings").hide();
            }
         }, this);

         SLQ.events.on("correctScore:updated", function(score) {
            this.setCorrectScore(score);
            this.setScorePercentage(score);
         }, this);

         SLQ.events.on("wrongScore:updated", function(score) {
            this.setWrongScore(score);
            this.setScorePercentage(score);
         }, this);

         SLQ.events.on("noLyricsFound", function() {
            console.log("No lyrics can be found, should be displayed on screen");
         });
      },

      bindListeners: function() {
         this.lyricList.on("keydown", "input", function(e) {
            if (e.which === 9) {
               e.preventDefault();
            }
         });

         this.quizModeBtn.on("change", function(e) {
            SLQ.events.trigger("quizMode:changed", $(this).is(":checked"));
         });

         this.difficultySelect.on("change", function(e) {
            SLQ.events.trigger("difficulty:changed", $(e.target).val());
         });

         this.lyricList.on("keyup", "input", function(e) {
            SLQ.events.trigger("quizAnswer:entered", this.value, this.dataset['answer'], $(this).parent());
         });
      },

      clearLyrics: function() {
         this.lyricList.html("");
      },

      appendLyrics: function(lyrics) {
         lyrics.forEach( function(lyricLine) {
            this.lyricList.append(lyricLine.$el);
         }, this);

         $(".text-scroller").textScroller({
            rows: 21
         });
      },

      updatelyricLine: function(lyricLine) {
         this.getLyricLine(lyricLine.time).html(lyricLine.text);
      },

      highlightLyricLine: function(lyricLine) {
         $(".text-scroller").eq(0).data("textScroller").focusRow( this.getLyricLine(lyricLine.time) );
      },

      getLyricLine: function(time) {
         return this.lyricList.find("[data-time='" + time + "']");
      },

      setCorrectScore: function(score) {
         $("#correct-score").text(score);
      },

      setWrongScore: function(score) {
         $("#wrong-score").text(score);
      },

      setScorePercentage: function() {
         var $score = $(".score");

         var correct = parseInt($("#correct-score").text(), 10);
         var wrong = parseInt($("#wrong-score").text(), 10);
         var newPercentage = Math.round(correct / (correct + wrong) * 100);
         if (!newPercentage) {
            newPercentage = 0;
         }
         var currentPercentage = $score.text();

         var tempClass = null;

         if (newPercentage > currentPercentage) {
            tempClass = "correct";
         } else if (newPercentage < currentPercentage){
            tempClass = "wrong";
         }

         $score.addClass(tempClass);

         $({val: currentPercentage}).animate({val: newPercentage}, {
            duration: 500,
            easing: 'swing',
            step: function() {
               $score.text(Math.round(this.val));
            },
            complete: function() {
               $score.removeClass(tempClass);
            }
         });

      },

      markPreviousOpenQuizLinesAsWrong: function(position) {
         var lines = this.lyricList.find("li");
         var openLines = [];
         [].forEach.call(lines, function(el) {
            var $el = $(el);
            if (el.dataset['time'] <= position && $el.first().find("input").length !== 0) {
               openLines.push($el);
            }
         });

         openLines.forEach( function(line) {
            SLQ.events.trigger("quizAnswer:wrong", line);
         }, this);
      },

      resetView: function() {
         this.removeCorrectAnswers();
         this.removeWrongAnswers();
         $(".settings").show();
         $(".scores").hide();
      },

      removeCorrectAnswers: function() {
         this.lyricList.find(".correct").removeClass("correct");
      },

      removeWrongAnswers: function() {
         this.lyricList.find(".wrong").removeClass("wrong");
      }
   };

})(jQuery, window.SLQ = window.SLQ || {});