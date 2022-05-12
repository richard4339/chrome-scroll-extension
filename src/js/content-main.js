const jQuery = require('jquery');
const $ = jQuery;
const ext = require("../js/lib.js");

// let us know we're running
console.log("Content script has loaded via Manifest V3.");

(function ($) {
    /**
     * Scrolls to the entry
     * @returns {jQuery}
     */
    $.fn.scrollToEntry = function () {
        this.children().first().get(0).scrollIntoView();
        return this;
    };
}(jQuery));

// send a message to the background requesting our business logic
chrome.runtime.sendMessage({
    cmd: "runLogic"
});

chrome.runtime.onMessage.addListener(listener);

function listener(request, sender, sendResponse) {
    switch (request.request) {
        case ext.message.scroll.position.get:
            sendResponse(getCurrentScrollPosition(request));
            break;
        case ext.message.scroll.bottom.down:
            scrollToBottom(request);
            sendResponse({status: 'done'});
            break;
        case ext.message.scroll.bottom.up:
            scrollUpBottom(request);
            sendResponse({status: 'done'});
            break;
        case ext.message.scroll.to:
            scrollTo(request);
            sendResponse({status: 'done'});
            break;
        case "hello":
            sendResponse({farewell: "goodbye"});
            break;
    }

    return Promise.resolve("Dummy response to keep the console quiet");
}

/**
 * @param request
 * @return {number}
 */
function getCurrentScrollPosition(request) {
    return $(window).scrollTop();
}

/**
 * @param request
 */
function scrollToBottom(request) {
    $('html, body').scrollTop($(document).height());
}

/**
 * @param request
 */
function scrollUpBottom(request) {
    $('html, body').scrollTop($(document).height() - 50);
}

/**
 * @param {Object} request
 * @param {number} request.y
 */
function scrollTo(request) {
    $('html, body').scrollTop(request.y);
}

/**
 * @param {number} time (in milliseconds)
 * @return {Promise<unknown>}
 */
function wait(time = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
