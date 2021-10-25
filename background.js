console.log('background.js');
class IconEvent {
    newtab = () => {
        chrome.action.setBadgeText({ text: "Open!" });
    };

    setup = () => {
        chrome.action.setBadgeText({ text: "SetUp" });
    };

    runing = () => {
        chrome.action.setBadgeText({ text: "Run" });
    };

    excluded = () => {
        chrome.action.setBadgeText({ text: "Off" });
    };
}

chrome.runtime.onInstalled.addListener(async () => {
    new IconEvent().newtab();
});

chrome.runtime.onMessage.addListener(function (data) {
    if (data.popupOpen) {
        new IconEvent().setup();
    }
    /*
    if (data.hasOwnProperty('colors')) {
        window.setColorLink(colors.normal, colors.visited, colors.closed);
    }
    */
});
