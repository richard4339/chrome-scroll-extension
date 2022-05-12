module.exports = {
    /**
     * @param {number} tabId
     * @param message
     * @param {Object} options
     * @param {boolean} logParameters
     * @return {Promise<unknown>}
     */
    chromeTabsSendMessage(tabId, message, options = {}, logParameters = false) {
        return new Promise((resolve, reject) => {
            try {
                if(logParameters) {
                    console.log('c.chromeTabsSendMessage: ', tabId, message, options);
                }
                chrome.tabs.sendMessage(tabId, message, options, function (response) {
                    if(chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                    }
                    resolve(response);
                })
            } catch (e) {
                reject(e);
            }
        });
    },

    /**
     * @param {chrome.contextMenus.CreateProperties} createProperties
     * @returns {Promise<chrome.runtime.lastError|void>}
     */
    chromeContextMenusCreate(createProperties) {
        return new Promise((resolve, reject) => {
            try {
                chrome.contextMenus.create(createProperties, function () {
                    if(chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    }
                    resolve();
                })
            } catch (e) {
                reject(e);
            }
        });
    },

    /**
     * @returns {Promise<chrome.runtime.lastError|void>}
     */
    chromeContextMenusRemoveAll() {
        return new Promise((resolve, reject) => {
            try {
                chrome.contextMenus.removeAll(function () {
                    if(chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    }
                    resolve();
                })
            } catch (e) {
                reject(e);
            }
        });
    },

    /**
     * @return {Promise<StorageCache>}
     */
    getStorageCache() {
        return chrome.storage.local.get(null);
    },

    /**
     * @param data
     * @return {Promise<unknown>}
     */
    setStorageCache(data) {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.set(data, function () {
                    resolve();
                })
            } catch (e) {
                reject(e);
            }
        });
    }
}

/**
 * @typedef {Object} StorageCache
 * @property {number} pageScrollToBottomCount
 * @property {number} pageScrollToBottomDefaultCount
 * @property {boolean} pageScrollToBottomScrollBack
 */