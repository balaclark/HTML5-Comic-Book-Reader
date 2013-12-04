/* exported ComicBook */

var ComicBook = (function ($) {

  'use strict';

  /**
   * Merge two arrays. Any properties in b will replace the same properties in
   * a. New properties from b will be added to a.
   *
   * @param a {Object}
   * @param b {Object}
   */
  function merge(a, b) {

    var prop;

    if (typeof b === 'undefined') { b = {}; }

    for (prop in a) {
      if (a.hasOwnProperty(prop)) {
        if (prop in b) { continue; }
        b[prop] = a[prop];
      }
    }

    return b;
  }

  /**
   * Exception class. Always throw an instance of this when throwing exceptions.
   *
   * @param {String} type
   * @param {Object} object
   * @returns {ComicBookException}
   */
  var ComicBookException = {
    INVALID_ACTION: 'invalid action',
    INVALID_PAGE: 'invalid page',
    INVALID_PAGE_TYPE: 'invalid page type',
    UNDEFINED_CONTROL: 'undefined control',
    INVALID_ZOOM_MODE: 'invalid zoom mode',
    INVALID_NAVIGATION_EVENT: 'invalid navigation event'
  };

  function ComicBook(id, srcs, opts) {

    var self = this;
    var canvas_id = id;   // canvas element id
    this.srcs = srcs; // array of image srcs for pages

    var defaults = {
      displayMode: 'double',  // single / double
      zoomMode: 'fitWindow', // manual / fitWidth / fitWindow
      manga: false,     // true / false
      enhance: {},
      keyboard: {
        next: 78,
        previous: 80,
        toolbar: 84,
        toggleLayout: 76
      },
      libPath: '/lib/',
      forward_buffer: 3
    };

    this.isMobile = false;

    // mobile enhancements
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)) {
      this.isMobile = true;
      document.body.classList.add('mobile');
      defaults.displayMode = 'single';

      window.addEventListener('load', function () {
        setTimeout(function () {
          window.scrollTo(0, 1);
        }, 0);
      });
    }

    var options = merge(defaults, opts); // options array for internal use

    var no_pages = srcs.length;
    var pages = [];   // array of preloaded Image objects
    var canvas;     // the HTML5 canvas object
    var context;    // the 2d drawing context
    var loaded = [];  // the images that have been loaded so far
    var scale = 1;    // page zoom scale, 1 = 100%
    var is_double_page_spread = false;
    var controlsRendered = false; // have the user controls been inserted into the dom yet?
    var page_requested = false; // used to request non preloaded pages
    var shiv = false;

    /**
     * Gets the window.innerWidth - scrollbars
     */
    function windowWidth() {

      var height = window.innerHeight + 1;

      if (shiv === false) {
        shiv = $(document.createElement('div'))
          .attr('id', 'cb-width-shiv')
          .css({
            width: '100%',
            position: 'absolute',
            top: 0,
            zIndex: '-1000'
          });

        $('body').append(shiv);
      }

      shiv.height(height);

      return shiv.innerWidth();
    }

    /**
     * enables the back button
     */
    function checkHash() {

      var hash = getHash();

      if (hash !== pointer && loaded.indexOf(hash) > -1) {
        pointer = hash;
        self.draw();
      }
    }

    function getHash() {
      var hash = parseInt(location.hash.substring(1),10) - 1 || 0;
      if (hash < 0) {
        setHash(0);
        hash = 0;
      }
      return hash;
    }

    function setHash(pageNo) {
      location.hash = pageNo;
    }

    // page hash on first load
    var hash = getHash();

    // the current page, can pass a default as a url hash
    var pointer = (hash < srcs.length) ? hash : 0;

    /**
     * Setup the canvas element for use throughout the class.
     *
     * @see #ComicBook.prototype.draw
     * @see #ComicBook.prototype.enhance
     */
    function init() {

      // setup canvas
      canvas = document.getElementById(canvas_id);
      context = canvas.getContext('2d');

      // render user controls
      if (controlsRendered === false) {
        self.renderControls();
        controlsRendered = true;
      }

      // add page controls
      window.addEventListener('keydown', self.navigation, false);
      window.addEventListener('hashchange', checkHash, false);
    }

    window.addEventListener('touchstart', function (e) {
      var $el = $(e.target);
      if ($el.attr('id') === 'comic') {
        self.toggleToolbar();
      }
      if ($el.data('toggle') === 'dropdown' ) {
        $el.siblings('.dropdown').toggle();
      }
    }, false);

    /**
     * Render Handlebars templates. Templates with data-trigger & data-action will
     * have the specified events bound.
     */
    ComicBook.prototype.renderControls = function () {

      var controls = {}, $toolbar;

      $.each(Handlebars.templates, function (name, template) {

        var $template = $(template().trim());
        controls[name] = $template;

        // add event listeners to controls that specify callbacks
        $template.find('*').andSelf().filter('[data-action][data-trigger]').each(function () {

          var $this = $(this);
          var trigger = $this.data('trigger');
          var action = $this.data('action');

          // trigger a direct method if exists
          if (typeof self[$this.data('action')] === 'function') {
            $this.on(trigger, self[action]);
          }

          // throw an event to be caught outside if the app code
          $this.on(trigger, function (e) {
            $(self).trigger(trigger, e);
          });
        });

        $(canvas).before($template);
      });

      this.controls = controls;

      $toolbar = this.getControl('toolbar');
      $toolbar
        .find('.manga-' + options.manga).show().end()
        .find('.manga-' + !options.manga).hide().end()
        .find('.layout').hide().end().find('.layout-' + options.displayMode).show();

    };

    ComicBook.prototype.getControl = function (control) {
      if (typeof this.controls[control] !== 'object') {
        throw ComicBookException.UNDEFINED_CONTROL + ' ' + control;
      }
      return this.controls[control];
    };

    ComicBook.prototype.showControl = function (control) {
      this.getControl(control).show().addClass('open');
    };

    ComicBook.prototype.hideControl = function (control) {
      this.getControl(control).removeClass('open').hide();
    };

    ComicBook.prototype.toggleControl = function (control) {
      this.getControl(control).toggle().toggleClass('open');
    };

    ComicBook.prototype.toggleLayout = function() {

      var $toolbar = self.getControl('toolbar');
      var displayMode = (options.displayMode === 'single') ? 'double' : 'single';

      options.displayMode = displayMode;

      $toolbar.find('.layout').hide().end().find('.layout-' + options.displayMode).show();

      self.drawPage();
    };

    /**
     * Get the image for a given page.
     *
     * @return Image
     */
    ComicBook.prototype.getPage = function (i) {

      if (i < 0 || i > srcs.length-1) {
        throw ComicBookException.INVALID_PAGE + ' ' + i;
      }

      if (typeof pages[i] === 'object') {
        return pages[i];
      } else {
        page_requested = i;
        this.showControl('loadingOverlay');
      }
    };

    /**
     * @see #preload
     */
    ComicBook.prototype.draw = function () {

      init();

      // resize navigation controls
      $('.navigate').outerHeight(window.innerHeight);
      $('#cb-loading-overlay').outerWidth(windowWidth()).height(window.innerHeight);

      // preload images if needed
      if (pages.length !== no_pages) {
        this.preload();
      } else {
        this.drawPage();
      }
    };

    /**
     * Zoom the canvas
     *
     * @param new_scale {Number} Scale the canvas to this ratio
     */
    ComicBook.prototype.zoom = function (new_scale) {
      options.zoomMode = 'manual';
      scale = new_scale;
      if (typeof this.getPage(pointer) === 'object') { this.drawPage(); }
    };

    ComicBook.prototype.zoomIn = function () {
      self.zoom(scale + 0.1);
    };

    ComicBook.prototype.zoomOut = function () {
      self.zoom(scale - 0.1);
    };

    ComicBook.prototype.fitWidth = function () {
      options.zoomMode = 'fitWidth';
      self.drawPage();
    };

    ComicBook.prototype.fitWindow = function () {
      options.zoomMode = 'fitWindow';
      self.drawPage();
    };

    /**
     * Preload all images, draw the page only after a given number have been loaded.
     *
     * @see #drawPage
     */
    ComicBook.prototype.preload = function () {

      var i = pointer; // the current page counter for this method
      var rendered = false;
      var queue = [];

      this.showControl('loadingOverlay');

      function loadImage(i) {

        var page = new Image();
        page.src = srcs[i];

        page.onload = function () {

          pages[i] = this;
          loaded.push(i);

          $('#cb-progress-bar .progressbar-value').css('width', Math.floor((loaded.length / no_pages) * 100) + '%');

          // double page mode needs an extra page added
          var buffer = (options.displayMode === 'double' && pointer < srcs.length-1) ? 1 : 0;

          // start rendering the comic when the requested page is ready
          if ((rendered === false && ($.inArray(pointer + buffer, loaded) !== -1) ||
              (typeof page_requested === 'number' && $.inArray(page_requested, loaded) !== -1))
          ) {
            // if the user is waiting for a page to be loaded, render that one instead of the default pointer
            if (typeof page_requested === 'number') {
              pointer = page_requested-1;
              page_requested = false;
            }

            self.drawPage();
            self.hideControl('loadingOverlay');
            rendered = true;
          }

          if (queue.length) {
            loadImage(queue[0]);
            queue.splice(0,1);
          } else {
            $('#cb-status').delay(500).fadeOut();
          }
        };
      }

      // loads pages in both directions so you don't have to wait for all pages
      // to be loaded before you can scroll backwards
      function preload(start, stop) {

        var j = 0;
        var count = 1;
        var forward = start;
        var backward = start-1;

        while (forward <= stop) {

          if (count > options.forward_buffer && backward > -1) {
            queue.push(backward);
            backward--;
            count = 0;
          } else {
            queue.push(forward);
            forward++;
          }
          count++;
        }

        while (backward > -1) {
          queue.push(backward);
          backward--;
        }

        loadImage(queue[j]);
      }

      preload(i, srcs.length-1);
    };

    ComicBook.prototype.pageLoaded = function (page_no) {
      return (typeof loaded[page_no-1] !== 'undefined');
    };

    /**
     * Draw the current page in the canvas
     */
    ComicBook.prototype.drawPage = function(page_no, reset_scroll) {

      var scrollY;

      reset_scroll = (typeof reset_scroll !== 'undefined') ? reset_scroll : true;
      scrollY = reset_scroll ? 0 : window.scrollY;

      // if a specific page is given try to render it, if not bail and wait for preload() to render it
      if (typeof page_no === 'number' && page_no < srcs.length && page_no > 0) {
        pointer = page_no-1;
        if (!this.pageLoaded(page_no)) {
          this.showControl('loadingOverlay');
          return;
        }
      }

      if (pointer < 0) { pointer = 0; }

      var zoom_scale;
      var offsetW = 0, offsetH = 0;

      var page = self.getPage(pointer);
      var page2 = false;

      if (options.displayMode === 'double' && pointer < srcs.length-1) {
        page2 = self.getPage(pointer + 1);
      }

      if (typeof page !== 'object') {
        throw ComicBookException.INVALID_PAGE_TYPE + ' ' + typeof page;
      }

      var width = page.width, height = page.height;

      // reset the canvas to stop duplicate pages showing
      canvas.width = 0;
      canvas.height = 0;

      // show double page spreads on a single page
      is_double_page_spread = (
        typeof page2 === 'object' &&
        (page.width > page.height || page2.width > page2.height) &&
        options.displayMode === 'double'
      );
      if (is_double_page_spread) { options.displayMode = 'single'; }

      if (options.displayMode === 'double') {

        // for double page spreads, factor in the width of both pages
        if (typeof page2 === 'object') { width += page2.width; }

        // if this is the last page and there is no page2, still keep the canvas wide
        else { width += width; }
      }

      // update the page scale if a non manual mode has been chosen
      switch (options.zoomMode) {

      case 'manual':
        document.body.style.overflowX = 'auto';
        zoom_scale = (options.displayMode === 'double') ? scale * 2 : scale;
        break;

      case 'fitWidth':
        document.body.style.overflowX = 'hidden';

        // scale up if the window is wider than the page, scale down if the window
        // is narrower than the page
        zoom_scale = (windowWidth() > width) ? ((windowWidth() - width) / windowWidth()) + 1 : windowWidth() / width;

        // update the interal scale var so switching zoomModes while zooming will be smooth
        scale = zoom_scale;
        break;

      case 'fitWindow':
        document.body.style.overflowX = 'hidden';

        var width_scale = (windowWidth() > width) ?
          ((windowWidth() - width) / windowWidth()) + 1 // scale up if the window is wider than the page
          : windowWidth() / width; // scale down if the window is narrower than the page
        var windowHeight = window.innerHeight;
        var height_scale = (windowHeight > height) ?
          ((windowHeight - height) / windowHeight) + 1 // scale up if the window is wider than the page
          : windowHeight / height; // scale down if the window is narrower than the page

        zoom_scale = (width_scale > height_scale) ? height_scale : width_scale;
        scale = zoom_scale;
        break;

      default:
        throw ComicBookException.INVALID_ZOOM_MODE + ' ' + options.zoomMode;
      }

      var canvas_width  = page.width * zoom_scale;
      var canvas_height = page.height * zoom_scale;

      var page_width = (options.zoomMode === 'manual') ? page.width * scale : canvas_width;
      var page_height = (options.zoomMode === 'manual') ? page.height * scale : canvas_height;

      canvas_height = page_height;

      // make sure the canvas is always at least full screen, even if the page is more narrow than the screen
      canvas.width = (canvas_width < windowWidth()) ? windowWidth() : canvas_width;
      canvas.height = (canvas_height < window.innerHeight) ? window.innerHeight : canvas_height;

      // always keep pages centered
      if (options.zoomMode === 'manual' || options.zoomMode === 'fitWindow') {

        // work out a horizontal position
        if (canvas_width < windowWidth()) {
          offsetW = (windowWidth() - page_width) / 2;
          if (options.displayMode === 'double') { offsetW = offsetW - page_width / 2; }
        }

        // work out a vertical position
        if (canvas_height < window.innerHeight) {
          offsetH = (window.innerHeight - page_height) / 2;
        }
      }

      // in manga double page mode reverse the page(s)
      if (options.manga && options.displayMode === 'double' && typeof page2 === 'object') {
        var tmpPage = page;
        var tmpPage2 = page2;
        page = tmpPage2;
        page2 = tmpPage;
      }

      // draw the page(s)
      context.drawImage(page, offsetW, offsetH, page_width, page_height);
      if (options.displayMode === 'double' && typeof page2 === 'object') {
        context.drawImage(page2, page_width + offsetW, offsetH, page_width, page_height);
      }

      this.pixastic = new Pixastic(context, options.libPath + 'pixastic/');

      // apply any image enhancements previously defined
      $.each(options.enhance, function(action, options) {
        self.enhance[action](options);
      });

      var current_page =
        (options.displayMode === 'double' &&
          pointer + 2 <= srcs.length) ? (pointer + 1) + '-' + (pointer + 2) : pointer + 1;

      this.getControl('toolbar')
        .find('#current-page').text(current_page)
        .end()
        .find('#page-count').text(srcs.length);

      // revert page mode back to double if it was auto switched for a double page spread
      if (is_double_page_spread) { options.displayMode = 'double'; }

      // disable the fit width button if needed
      $('button.cb-fit-width').attr('disabled', (options.zoomMode === 'fitWidth'));
      $('button.cb-fit-window').attr('disabled', (options.zoomMode === 'fitWindow'));

      // disable prev/next buttons if not needed
      $('.navigate').show();
      if (pointer === 0) {
        if (options.manga) {
          $('.navigate-left').show();
          $('.navigate-right').hide();
        } else {
          $('.navigate-left').hide();
          $('.navigate-right').show();
        }
      }

      if (pointer === srcs.length-1 || (typeof page2 === 'object' && pointer === srcs.length-2)) {
        if (options.manga) {
          $('.navigate-left').hide();
          $('.navigate-right').show();
        } else {
          $('.navigate-left').show();
          $('.navigate-right').hide();
        }
      }

      if (pointer !== getHash()){
        $(this).trigger('navigate');
      }

      // update hash location
      if (getHash() !== pointer) {
        setHash(pointer + 1);
      }
    };

    /**
     * Increment the counter and draw the page in the canvas
     *
     * @see #drawPage
     */
    ComicBook.prototype.drawNextPage = function () {

      var page;

      try {
        page = self.getPage(pointer+1);
      } catch (e) {}

      if (!page) { return false; }

      if (pointer + 1 < pages.length) {
        pointer += (options.displayMode === 'single' || is_double_page_spread) ? 1 : 2;
        try {
          self.drawPage();
        } catch (e) {}
      }

      // make sure the top of the page is in view
      window.scroll(0, 0);
    };

    /**
     * Decrement the counter and draw the page in the canvas
     *
     * @see #drawPage
     */
    ComicBook.prototype.drawPrevPage = function () {

      var page;

      try {
        page = self.getPage(pointer-1);
      } catch (e) {}

      if (!page) { return false; }

      is_double_page_spread = (page.width > page.height); // need to run double page check again here as we are going backwards

      if (pointer > 0) {
        pointer -= (options.displayMode === 'single' || is_double_page_spread) ? 1 : 2;
        self.drawPage();
      }

      // make sure the top of the page is in view
      window.scroll(0, 0);
    };

    ComicBook.prototype.brightness = function () {
      self.enhance.brightness({ brightness: $(this).val() });
    };

    ComicBook.prototype.contrast = function () {
      self.enhance.brightness({ contrast: $(this).val() });
    };

    ComicBook.prototype.sharpen = function () {
      self.enhance.sharpen({ strength: $(this).val() });
    };

    ComicBook.prototype.desaturate = function () {
      if ($(this).is(':checked')) {
        self.enhance.desaturate();
      } else {
        self.enhance.resaturate();
      }
    };

    ComicBook.prototype.resetEnhancements = function () {
      self.enhance.reset();
    };

    /**
     * Apply image enhancements to the canvas.
     *
     * Powered by the awesome Pixastic: http://www.pixastic.com/
     *
     * TODO: reset & apply all image enhancements each time before applying new one
     * TODO: abstract this into an 'Enhance' object, separate from ComicBook?
     */
    ComicBook.prototype.enhance = {

      /**
       * Reset enhancements.
       * This can reset a specific enhancement if the method name is passed, or
       * it will reset all.
       *
       * @param method {string} the specific enhancement to reset
       */
      reset: function (method) {
        if (!method) {
          options.enhance = {};
        } else {
          delete options.enhance[method];
        }
        self.drawPage(null, false);
      },

      /**
       * Pixastic progress callback
       * @param  {float} progress
       */
      // progress: function (progress) {
      progress: function () {
        // console.info(Math.floor(progress * 100));
      },

      /**
       * Pixastic on complete callback
       */
      done: function () {

      },

      /**
       * Adjust brightness / contrast
       *
       * params
       *    brightness (int) -150 to 150
       *    contrast: (float) -1 to infinity
       *
       * @param {Object} params Brightness & contrast levels
       * @param {Boolean} reset Reset before applying more enhancements?
       */
      brightness: function (params, reset) {

        if (reset !== false) { this.reset('brightness'); }

        // merge user options with defaults
        var opts = merge({ brightness: 0, contrast: 0 }, params);

        // remember options for later
        options.enhance.brightness = opts;

        // run the enhancement
        self.pixastic.brightness({
          brightness: opts.brightness,
          contrast: opts.contrast
        }).done(this.done, this.progress);
      },

      /**
       * Force black and white
       */
      desaturate: function () {
        options.enhance.desaturate = {};
        self.pixastic.desaturate().done(this.done, this.progress);
      },

      /**
       * Undo desaturate
       */
      resaturate: function() {
        delete options.enhance.desaturate;
        self.drawPage(null, false);
      },

      /**
       * Sharpen
       *
       * options:
       *   strength: number (-1 to infinity)
       *
       * @param {Object} options
       */
      sharpen: function (params) {

        this.desharpen();

        var opts = merge({ strength: 0 }, params);

        options.enhance.sharpen = opts;

        self.pixastic.sharpen3x3({
          strength: opts.strength
        }).done(this.done, this.progress);
      },

      desharpen: function() {
        delete options.enhance.sharpen;
        self.drawPage(null, false);
      }
    };

    ComicBook.prototype.navigation = function (e) {

      // disable navigation when the overlay is showing
      if ($('#cb-loading-overlay').is(':visible')) { return false; }

      var side = false;

      switch (e.type) {

      case 'click':
        side = e.currentTarget.getAttribute('data-navigate-side');
        break;

      case 'keydown':

        // navigation
        if (e.keyCode === options.keyboard.previous) { side = 'left'; }
        if (e.keyCode === options.keyboard.next) { side = 'right'; }

        // display controls
        if (e.keyCode === options.keyboard.toolbar) {
          self.toggleToolbar();
        }
        if (e.keyCode === options.keyboard.toggleLayout) {
          self.toggleLayout();
        }
        break;

      default:
        throw ComicBookException.INVALID_NAVIGATION_EVENT + ' ' + e.type;
      }

      if (side) {

        e.stopPropagation();

        // western style (left to right)
        if (!options.manga) {
          if (side === 'left') { self.drawPrevPage(); }
          if (side === 'right') { self.drawNextPage(); }
        }
        // manga style (right to left)
        else {
          if (side === 'left') { self.drawNextPage(); }
          if (side === 'right') { self.drawPrevPage(); }
        }

        return false;
      }
    };

    ComicBook.prototype.toggleReadingMode = function () {
      options.manga = !options.manga;
      self.getControl('toolbar')
        .find('.manga-' + options.manga).show().end()
        .find('.manga-' + !options.manga).hide();
    };

    ComicBook.prototype.toggleToolbar = function () {
      self.toggleControl('toolbar');
    };

    ComicBook.prototype.destroy = function () {

      $.each(this.controls, function (name, $control) {
        $control.remove();
      });

      canvas.width = 0;
      canvas.height = 0;

      window.removeEventListener('keydown', this.navigation, false);
      window.removeEventListener('hashchange', checkHash, false);

      setHash('');

      // $(this).trigger('destroy');
    };

  }

  return ComicBook;

})(jQuery);
