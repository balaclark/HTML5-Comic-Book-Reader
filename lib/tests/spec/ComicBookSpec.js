/* global ComicBook: false, describe: false, beforeEach: false, setFixtures: false, it: false, expect: false */

(function ($) {

  'use strict';

  describe('ComicBook', function () {

    var book;

    beforeEach(function () {

      setFixtures('<canvas id="comic"></canvas>');

      book = new ComicBook(
        'comic',
        ['img/1.png','img/2.png','img/3.png','img/4.png','img/5.png','img/6.png'],
        { libPath: '../vendor/' }
      );

    });

    it('should render all controls on draw', function () {
      expect($('.cb-control, .toolbar').length).toBe(0);
      book.draw();
      expect($('.cb-control, .toolbar').length).toBe(5);
    });

    it('should navigate between pages when the navigation links are clicked', function () {
      book.draw();
      $('.navigate.left').click();
      book.drawNextPage();

      // console.log(book)
      // console.log($(window))
    });

    // navigate on keyboard
    // don't navigate if nothing left
    // show current page
    // customise keyboard control
    // dropdown menus
    // apply effects
    // maximise
    // minimise
    // fit width
    // single page / double page
    // single page should allow double page spreads
    // preloading
    // update hash
    // resume based on hash
    // load from middle of page
    // emit custom events based on data-attributes
    // destroy
  });

})(jQuery);
