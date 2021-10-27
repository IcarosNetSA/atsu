console.log("background.js");

var enviroment = "test";

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


function set_setting(list_of_URLs) {
    chrome.storage.local.set({
        atsu_setting: { urls: list_of_URLs, user: "", web_setting: {} },
    });
}

function checkURL(json, value) {
    let contains = false;
    Object.keys(json).some((key) => {
        contains =
            typeof json[key] === "object"
                ? checkURL(json[key], value)
                : json[key] === value;
        return contains;
    });
    return contains;
}

chrome.runtime.onInstalled.addListener(async () => {
    new IconEvent().newtab();
    (async () => {
        try {
            if (enviroment != "test") {
                const res = await fetch('https://api.stackexchange.com/2.3/sites?pagesize=300&filter=8.gkV_asYe9afFfvFqtlq7c*BNYNn1yRTmPHs2A5faWuzs22H5cX3_ZHMlL7PNVfn)nfrUx');
                set_setting(res);
            } else {
                const uri = chrome.runtime.getURL('src/json/urls.json');
                fetch(uri)
                    .then((response) => response.json()) //assuming file contains json
                    .then((json) => set_setting(json));
            }
        } catch (err) {
            throw err;
        }
    })();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    chrome.storage.local.get("atsu_setting", function (setting) {
        let list_of_URLs = setting.atsu_setting.urls;
        let uri_arr = tab.url.split('/');
        let uri = uri_arr[0] + '//' + uri_arr[2];
        let eval_uri = checkURL(list_of_URLs, uri);
        if (eval_uri && tab.url !== undefined && changeInfo.status == "complete") {
            console.log('Loading Dependency Script...');
            chrome.scripting.executeScript({
                target: { tabId: tabId, allFrames: true },
                files: ['src/js/stacks.min.js'],
            });
            console.log('Script Loaded !!!');
        }
    });
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
