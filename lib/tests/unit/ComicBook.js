/* global $: false, module: false, test: false, equal: false, ComicBook: false console: false */

$(function () {

  'use strict';

  var $fixture;
  var book;

  function initBook() {

    $fixture = $('#qunit-fixture');
    $fixture.append('<canvas id="comic"></canvas>');

    book = new ComicBook(
      'comic',
      ['img/1.png','img/2.png','img/3.png','img/4.png','img/5.png','img/6.png'],
      { libPath: '../vendor/' }
    );
  }

  module('not yet rendered comic', {
    setup: initBook
  });

  test('controls shouldn\'t be renderd yet', function () {
    equal($('.cb-control, .toolbar').length, 0, 'book not drawn yet, nothing should be rendered');
  });

  module('rendered comic', {

    setup: function () {
      initBook();
      book.draw();
    },

    teardown: function () {
    }
  });

  test('all controls should be rendered', function () {
    equal($('.cb-control, .toolbar').length, 5, 'All toolbar elements should have rendered after book.draw');
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
