// Saves options to chrome.storage
function save_options() {
    var pageScrollToBottomCount = document.getElementById('page-scrolltobottom-count').value;
    var pageScrollToBottomScrollBack = document.getElementById('page-scrolltobottom-scrollback').checked;
    var pageScrollToBottomDefaultCount = document.getElementById('page-scrolltobottom-default-count').value;

    // Sanity checking
    if(pageScrollToBottomCount < 2) {
        pageScrollToBottomCount = 2;
        document.getElementById('page-scrolltobottom-count').value = pageScrollToBottomCount;
    }
    if(pageScrollToBottomDefaultCount < 2) {
        pageScrollToBottomDefaultCount = 2;
        document.getElementById('page-scrolltobottom-default-count').value = pageScrollToBottomDefaultCount;
    }

    chrome.storage.local.set({
        pageScrollToBottomCount: pageScrollToBottomCount,
        pageScrollToBottomScrollBack: pageScrollToBottomScrollBack,
        pageScrollToBottomDefaultCount: pageScrollToBottomDefaultCount,
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.local.get({
        pageScrollToBottomCount: 5,
        pageScrollToBottomScrollBack: true,
        pageScrollToBottomDefaultCount: 5,
    }, function (items) {
        document.getElementById('page-scrolltobottom-count').value = items.pageScrollToBottomCount;
        document.getElementById('page-scrolltobottom-scrollback').checked = items.pageScrollToBottomScrollBack;
        document.getElementById('page-scrolltobottom-default-count').value = items.pageScrollToBottomDefaultCount;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);