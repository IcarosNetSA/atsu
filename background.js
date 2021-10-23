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

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.popupOpen) {
        new IconEvent().setup();
    }
});
