var ext = require('../js/lib.js');
var c = require('../js/chrome.js');

require('../img/icon-128.png');

/**
 * @type {number} Default scroll to bottom count setting used in options
 */
const defaultPageScrollToBottomCount = 30;

/**
 * @type {boolean} Default scroll to bottom then scroll back to the starting place setting used in options
 */
const defaultPageScrollToBottomScrollBack = true;

/**
 * @type {number} Default scroll to bottom count (via keyboard) setting used in options
 */
const defaultPageScrollToBottomDefaultCount = 15;

/**
 * @type {number[]} Scroll positions in the menu
 */
const scrollCounts = [5, 10, 15];

// let us know we're running
console.log("Background service worker has loaded via Manifest V3.");

// clear, add, and listen to new context menu
const pageContextMenus = async () => {
    console.log('adding page menus');
    let storageCache = await c.getStorageCache();

    const count = storageCache.pageScrollToBottomCount;

    const scrollToBottomCounts = [];
    scrollCounts.forEach((v) => {
        scrollToBottomCounts[v] = v;
    });
    scrollToBottomCounts[count] = count;

    scrollToBottomCounts.sort(function (a, b) {
        return a - b
    });

    scrollToBottomCounts.forEach(value => {

        c.chromeContextMenusCreate({
            "id": `${ext.menu.page.scrollToBottom}-${value}`,
            "title": `Scroll To Bottom ${value}x Times`,
            "contexts": ['page']
        });
    });

    return true;
};

// handle interactions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId.startsWith(ext.menu.page.scrollToBottom)) {
        scrollToBottom(tab, info);
    } else {
        console.warn('Unknown context menu: ', info.menuItemId);
    }
});

// listen for messages
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // log the message
    console.log("Message received!", request, sender);

    // has the content script asked to us execute our business logic?
    if (request.cmd === "runLogic") {
        await chrome.scripting.executeScript({
            target: {
                tabId: sender.tab.id
            }, files: ["logic.bundle.js"]
        });
    } else if (request.cmd === "addMenu") { // has our business logic asked us to add a menu?
        // don't try to duplicate this menu item
        c.chromeContextMenusRemoveAll()
            .then(function () {
                pageContextMenus();

                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                }
            });
    } else if (request.cmd.startsWith(ext.menu.page.scrollToBottom)) {
        await scrollToBottom(sender.tab);
    } else {
        console.warn('Unknown command: ', request.cmd);
    }

    return true;
});

chrome.action.onClicked.addListener((tab) => {
    //console.log(tab);
    //scrollToBottom(tab);
});

chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command.startsWith(ext.menu.page.scrollToBottom)) {
        await scrollToBottom(tab);
    } else {
        console.warn('No command handler found: ', command);
    }
});

chrome.runtime.onInstalled.addListener((reason) => {
    console.log('OnInstalled: ', reason);
    if (reason.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        checkCommandShortcuts();
        initializeSettings();
    }
});

// Only use this function during the initial install phase. After
// installation the user may have intentionally unassigned commands.
function checkCommandShortcuts() {
    chrome.commands.getAll((commands) => {
        let missingShortcuts = [];

        for (let {name, shortcut} of commands) {
            if (shortcut === '') {
                missingShortcuts.push(name);
                console.log('Missing: ', name, shortcut);
            }
        }

        if (missingShortcuts.length > 0) {
            // Update the extension UI to inform the user that one or more
            // commands are currently unassigned.
        }
    });
}

/**
 * @returns {Promise<*>}
 */
async function initializeSettings() {
    console.log('Initializing settings');
    let storageCache = await c.getStorageCache();
    console.log(storageCache);
    if (storageCache.pageScrollToBottomCount == null || storageCache.pageScrollToBottomScrollBack == null || storageCache.pageScrollToBottomDefaultCount == null) {
        console.log('Settings are not up to date. Resetting to defaults.');
        storageCache = {
            pageScrollToBottomCount: defaultPageScrollToBottomCount,
            pageScrollToBottomScrollBack: defaultPageScrollToBottomScrollBack,
            pageScrollToBottomDefaultCount: defaultPageScrollToBottomDefaultCount,
        };
    }

    return c.setStorageCache(storageCache);
}

/**
 * @param {chrome.tabs.Tab} tab
 * @param {chrome.contextMenus.OnClickData|null} info
 */
async function scrollToBottom(tab, info = null) {
    let storageCache = await c.getStorageCache();
    let count = 2;
    if (info != null) {
        if (info.menuItemId === ext.menu.page.scrollToBottom) {
            count = storageCache.pageScrollToBottomCount;
        } else {
            count = parseInt(info.menuItemId.substring(info.menuItemId.lastIndexOf('-') + 1));
        }
    } else {
        count = storageCache.pageScrollToBottomDefaultCount;
    }

    if (count < 2) {
        count = 2;
    }

    let curr;

    if (storageCache.pageScrollToBottomScrollBack) {
        curr = await c.chromeTabsSendMessage(tab.id, {request: ext.message.scroll.position.get});
    }

    await doScrollToBottom(tab.id);
    await doScrollTo(tab.id, 0);

    for (let i = 0; i < count; i++) {
        await wait(1000);
        await doScrollToBottom(tab.id);
        await wait(1000);
        await c.chromeTabsSendMessage(tab.id, {request: ext.message.scroll.bottom.up});
    }

    if (storageCache.pageScrollToBottomScrollBack) {
        await doScrollTo(tab.id, curr);
    }
    console.log('Done scrolling')
}

/**
 * @param {number} tabId
 * @returns {Promise<*>}
 */
async function doScrollToBottom(tabId) {
    return c.chromeTabsSendMessage(tabId, {request: ext.message.scroll.bottom.down});
}

/**
 * @param {number} tabId
 * @param {number} position
 * @return {Promise<*>}
 */
async function doScrollTo(tabId, position) {
    return c.chromeTabsSendMessage(tabId, {request: 'scroll_to', y: position});
}

/**
 * @param {number} time
 * @return {Promise<void>}
 */
function wait(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
