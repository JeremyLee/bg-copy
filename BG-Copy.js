// ==UserScript==
// @name         BG Copy
// @namespace    http://jlee.in/
// @version      0.1
// @description  Copy verses with reference from BibleGateway
// @author       Jeremy Lee 2016
// @match        *://www.biblegateway.com/passage/*
// @grant        none
// ==/UserScript==


// The MIT License (MIT)
// =====================
//
// Copyright (c) `<year>` `<copyright holders>`
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


(function() {
  'use strict';

  var getExpandedSelection = function getExpandedSelection(range) {
    if(range.startContainer === range.endContainer){
      return range.startContainer.data.substr(range.startOffset, range.endOffset - range.startOffset);
    }
    var strings = [];
    var startText = range.startContainer.data.substr(range.startOffset);
    var startElement = range.startContainer.parentElement;
    var startParentClasses = startElement.parentElement.classList;
    var endElement = range.endContainer.parentElement;
    var endParentClasses = endElement.parentElement.classList;

    if(startElement.classList.contains('versenum')) {
      strings.push(range.startContainer.parentElement.nextSibling.data);
    } else {
      strings.push(startText);
    }

    strings.push(' ');

    if(startParentClasses.contains('indent-1') || startParentClasses.contains('versenum')) {
      startElement = startElement.parentElement;
    }
    if(endParentClasses.contains('indent-1') || endParentClasses.contains('versenum')) {
      endElement = endElement.parentElement;
    }
    var middleElements = $(startElement).nextUntil(endElement).find('.text').addBack('.text');
    var middleText = "";
    for(var i = 0; i < middleElements.length; i++) {
      strings.push($(middleElements[i]).text());
      strings.push(' ');
    }
    var endText = range.endContainer.data.substr(0, range.endOffset);
    strings.push(endText);
    return strings.join('');
  };

  var selectedAnchor = {prevSelection: null, selection: null, changes: 0};
  jQuery.getScript("https://rawgit.com/lgarron/clipboard.js/master/clipboard.js")
    .done(function(e) {
    var observer = new MutationObserver(function(mutations) {
      for(var mi in mutations) {
        var m = mutations[mi];
        for(var ai in m.addedNodes) {
          var a = m.addedNodes[ai];
          if(a.className === 'qtip-content') {

            var no = $($('.notes-options', a)[1]);
            var copyButton = $('<span class="icon-download note"></span>');
            copyButton.click(function(e) {
              selectedAnchor = selectedAnchor;
              var text = getExpandedSelection(selectedAnchor.prevSelection);
              var verseElement = selectedAnchor.prevSelection.startContainer.parentElement;
              if(verseElement.classList.contains('versenum'))
                verseElement = verseElement.parentElement;
              var ref = verseElement.classList[1].split('-');
              text = ref[0] + ' ' + ref[1] + ':' + ref[2] + ' ' + text;
              clipboard.copy(text);
            });
            var b = no.append(copyButton);
            no.parents()[2].style.maxWidth = 'none';
          }
        }
      }
    });


    observer.observe(document.body, {childList: true, subtree: true});

    document.addEventListener("selectionchange", function(e) {
      selectedAnchor.changes++;
      //debugger;
      selectedAnchor.prevSelection = selectedAnchor.selection;
      var s = window.getSelection();
      if(s.rangeCount)
        selectedAnchor.selection = window.getSelection().getRangeAt(0);

    });
  })
    .fail(function() {
    console.error("Couldn't load clipboard.js");
  });
})();
