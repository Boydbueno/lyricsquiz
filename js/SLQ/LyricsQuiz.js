;(function($, SLQ) {
   "use strict";

   SLQ.LyricsQuiz = function() {
      this.difficulties = {
         easy: {
            quizLinePercentage: 25,
            minMissingWords: 1,
            maxMissingWords: 1
         },
         normal: {
            quizLinePercentage: 35,
            minMissingWords: 1,
            maxMissingWords: 3
         },
         hard: {
            quizLinePercentage: 50,
            minMissingWords: 2,
            maxMissingWords: 4
         },
         insane: {
            quizLinePercentage: 90,
            minMissingWords: 4,
            maxMissingWords: 10
         }
      },
      this.options = {
         quizLinePercentage: 35,
         minMissingWords: 1,
         maxMissingWords: 3
      },
      this._subtitles = null;
      this._lyrics = [];
      this._currentLyricLine = null;
      this._scores = {
         correct: 0,
         wrong: 0
      };
      this.quizMode = false;

      this.init();
   };

   SLQ.LyricsQuiz.prototype = {
      init: function() {
         this.bindSubsribers();
      },

      bindSubsribers: function() {
         SLQ.events.on("quizMode:changed", function(isEnabled) {
            if (isEnabled) {
               this.startQuiz();
            } else {
               this.stopQuiz();
            }
         }, this);

         SLQ.events.on("subtitles:updated", function(subtitles) {
            this.convertSubtitlesIntoLyrics(subtitles);
         }, this);

         SLQ.events.on("lyrics:updated", function() {
            if (this.quizMode) {
               this.startQuiz();
            }
         }, this);

         SLQ.events.on("position:updated", function(position, prevPosition) {
            if (this.lyrics.length === 0) return;
            this.updateCurrentLyricLine(prevPosition, position);
         }, this);

         SLQ.events.on("quizAnswer:entered", function(input, answer, line) {
            if (this.normalize(input) === this.normalize(answer)) {
               SLQ.events.trigger("quizAnswer:correct", line);
            }
         }, this);

         SLQ.events.on("quizAnswer:correct", function() {
            this.correctScore += 1;
         }, this);

         SLQ.events.on("quizAnswer:wrong", function() {
            this.wrongScore += 1;
         }, this);

         SLQ.events.on("difficulty:changed", function(difficulty) {
            this.options = this.difficulties[difficulty];
         }, this);

      },

      startQuiz: function() {
         var linesCount = this.lyrics.length;
         var quizLinesCount = Math.round(linesCount / 100 * this.options.quizLinePercentage);

         var quizLines = this.getQuizLines(quizLinesCount);
         quizLines.forEach(function(line) {
            this.quizifyLine(line);
         }, this);

         this.resetScores();

         this.quizMode = true;
      },

      stopQuiz: function() {
         this.lyrics.forEach(function(lyricLine) {
            if(lyricLine.quizLine) {
               lyricLine.turnIntoNormalLine();
            }
         });

         this.quizMode = false;
      },

      quizifyLine: function(line) {
         var words = line.text.split(" ");
         var wordsCount = words.length;

         var min = this.options.minMissingWords;
         var max = this.options.maxMissingWords;

         // Set a random amount of to be removed words
         var toRemove = Math.floor(Math.random() * max) + min;

         // If toRemove amount is more than the wordsCount, we have to remove all words
         if (toRemove > wordsCount) {
            toRemove = wordsCount;
         }

         // We decide on a random starting position
         var randomStart = Math.floor(Math.random() * (wordsCount - toRemove+1));

         var start = words.slice(0, randomStart);
         var missingWords = words.slice(randomStart, randomStart + toRemove);
         // We should check if missing words has some impossible words
         var end = words.slice(randomStart + toRemove);

         var text = "<span class='before'>" + start.join(" ") + " </span><input class='input size" + toRemove + "' data-answer=\"" + missingWords.join(" ") + "\" type='text'><span class='after'> " + end.join(" ") + "</span>";

         line.turnIntoQuizLine(text);
      },

      getQuizLines: function(count) {
         var copyOfLyrics = this.lyrics.slice(0);
         // Remove the first dummy value
         copyOfLyrics.splice(0, 1);
         // Shuffle the copy
         copyOfLyrics.sort(function() {return 0.5 - Math.random();});

         var quizLines = copyOfLyrics.slice(0, count);

         // Now filter out the 'impossible' lines

         return quizLines;
      },

      getLyricLine: function(from, till) {
         var reversedLyrics = this.lyrics.slice(0);
         reversedLyrics.reverse();

         // We should return the first line if no lines are found

         if (from < till) {
            return _.find(reversedLyrics, function(lyricLine) {
               return (lyricLine.time >= from && lyricLine.time <= till);
            });
         }

         if (from > till) {
            return _.find(reversedLyrics, function(lyricLine) {
               return (lyricLine.time < till);
            });
         }

      },

      convertSubtitlesIntoLyrics: function(subtitles) {
         var lyrics = [];
         // This should do for splitting the lines
         var lines = subtitles.split("\n");

         // Filter out the empty values
         lines = lines.filter( function(val) {
            return (val !== "");
         });

         lines.forEach( function(line) {
            var splitLine = line.replace(/\s{2,}/, " ");
            // Now I need to split the line into [] fragments
            splitLine = splitLine.split(/(\[\d{2}:\d{2}(?:\.\d{2})?\])/);
            splitLine = splitLine.filter( function(v) {
               return (v !== "");
            });

            var lyric = $.trim(splitLine.pop());
            // We don't need it if it's a line without lyrics
            if (lyric === "") return;

            splitLine.forEach( function(time) {
               time = time.replace("[", "");
               time = time.replace("]", "");
               lyrics.push( new SLQ.LyricLine(lyric, this.convertTimeToMs(time)) );
            }, this);

         }, this);

         lyrics.sort(this.sortLyrics);
         lyrics.unshift( new SLQ.LyricLine("...", "0") );
         this.lyrics = lyrics;
      },

      updateCurrentLyricLine: function(prevPosition, position) {
         if (position === 0) {
            this.currentLyricLine = this.lyrics[0];
            return;
         }

         var lyricLine = this.getLyricLine(prevPosition, position);

         if (!lyricLine) return;
         if (this.currentLyricLine === lyricLine) return;

         this.currentLyricLine = lyricLine;
      },

      normalize: function(text) {
         var normalizedText = text.toLowerCase();
         // This isn't very neatly done, but does the trick, for now
         normalizedText = normalizedText.replace(" had", "'d").replace(" is", "'s");
         normalizedText = normalizedText.replace(".", "").replace(",", "").replace("!", "")
                        .replace("i'm", "i am").replace("'ll", " will").replace("'ve", " have").replace("'re", " are")
                        .replace(" would", "'d").replace("'d", " had")
                        .replace(" has", "'s").replace("'s", " is")
                        .replace("n't", " not").replace("cannot", "can not").replace("'em", "them")
                        .replace("yo'", "your").replace("o'", "of").replace("o'clock", "of the clock").replace("ma'am", "madam")
                        .replace("'twas", "it was").replace("'cause", "because").replace("gotta", "got to").replace("gonna", "going to")
                        .replace("n'", "ng");

         return normalizedText;
      },

      resetScores: function() {
         this.correctScore = 0;
         this.wrongScore = 0;
      },

      convertTimeToMs: function(time) {
         var tt = time.split(":");
         var min = tt[0];
         var sec = tt[1];

         return Math.round((min*60+sec*1)*1000);
      },

      sortLyrics: function(a, b) {
         if (a.time < b.time) {
            return -1;
         }

         if (a.time > b.time) {
            return 1;
         }

         return 0;
      }
   };

   Object.defineProperties(SLQ.LyricsQuiz.prototype, {
      lyrics: {
         get: function() {
            return this._lyrics;
         },
         set: function(val) {
            this._lyrics = val;
            SLQ.events.trigger("lyrics:updated", val);
         }
      },
      currentLyricLine: {
         get: function() {
            return this._currentLyricLine;
         },
         set: function(val) {
            this._currentLyricLine = val;
            SLQ.events.trigger("currentLyricLine:updated", val);
         }
      },
      correctScore: {
         get: function() {
            return this._scores.correct;
         },
         set: function(val) {
            this._scores.correct = val;
            SLQ.events.trigger("correctScore:updated", val);
         }
      },
      wrongScore: {
         get: function() {
            return this._scores.wrong;
         },
         set: function(val) {
            this._scores.wrong = val;
            SLQ.events.trigger("wrongScore:updated", val);
         }
      }
   });

})(jQuery, window.SLQ = window.SLQ || {});