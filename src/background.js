chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg === 'get-tabId') {

        chrome.scripting.executeScript(
            {
              target: { tabId: sender.tab.id },
              world: "MAIN",
              func: () => {
                $('.ui-ooMenu:not(.wikibase-entitysearch-list) > .ui-ooMenu-item').eq(0).trigger('mouseenter.ooMenu')
                $('.ui-ooMenu:not(.wikibase-entitysearch-list) > .ui-ooMenu-item').eq(0).trigger({type:'mousedown.ooMenu', which: 1})
              },
            },
            () => { });
    }
});

