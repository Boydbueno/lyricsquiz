if (typeof Object.create !== 'function') {
   Object.create = function(obj) {
      function F(){}
      F.prototype = obj;
      return new F();
   };
}

(function($, window, document, undefined) {

   var TextScroller = {

      init: function(config, el) {
         var self = this;
         // Check if el has class text-scroller, else wrap it inside div with this class
         this.el = el;
         this.$el = $(el);
         this.lines = $(el).find("li");

         this.options = $.extend($.fn.textScroller.defaults, config);

         this.currentRow = this.options.startRow || this.lines.first();
         this.setInitialView();

         // $(document).on("keydown", function(e) {
         //    if (e.which === 38) {
         //       self.prevRow();
         //    }

         //    if (e.which === 40) {
         //       self.nextRow();
         //    }
         // });
      },

      setInitialView: function() {
         this.$el.height(this.getScrollerHeight());
         this.focusRow(this.currentRow);
      },

      prevRow: function() {
         if (!this.currentRow.prev().length) return;

         var currentRow = this.currentRow.prev();
         this.focusRow(currentRow);
      },

      nextRow: function() {
         if (!this.currentRow.next().length) return;

         var currentRow = this.currentRow.next();
         this.focusRow(currentRow);
      },

      getScrollerHeight: function() {
         return this.lines.height() * this.options.rows;
      },

      focusRow: function($el) {
         this.currentRow = $el;
         this.lines.removeClass("active");
         this.currentRow.addClass("active");

         this.$el.find("ul").animate({
            top: this.getRowFocusPosition($el)
         }, {
            duration: 200,
            easing: "linear",
            queue: false
         });
      },

      getRowFocusPosition: function($el) {
         var index = this.getRowIndex($el);
         var height = this.$el.find("li:not(.active)").height() * this.options.rows;
         var centerModifier = this.lines.height();
         var activeRowHeight = this.currentRow.height();
         var center = (height / 2) - (activeRowHeight / 2);

         return center - ( centerModifier * index );
      },

      getRowIndex: function($el) {
         return this.lines.index($el);
      }
   };

   $.fn.textScroller = function(config) {

      return this.each(function() {
         var acx = $(this);
         var textScroller = Object.create(TextScroller);
         textScroller.init(config, this);

         acx.data('textScroller', textScroller);

      });

   };

   $.fn.textScroller.defaults = {
      rows: 5
   };

})(jQuery, window, document);