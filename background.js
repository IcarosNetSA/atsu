class background {

    enviroment = 'test';

    se_network = 'https://api.stackexchange.com/2.3/sites?pagesize=300&filter=8.gkV_asYe9afFfvFqtlq7c*BNYNn1yRTmPHs2A5faWuzs22H5cX3_ZHMlL7PNVfn)nfrUx';

    c_tab = null;

    c_uri = null;

    is_uri_able = false;

    is_uri_conf = false;

    c_setting = {};

    constructor() {
        console.log('called background.js');
    }

    /**
     * method to Manage basge icon text
     */

    installed = () => {
        console.log('Installed');
        chrome.action.setBadgeText({ text: 'Inst!' });
    };

    newTab = () => {
        chrome.action.setBadgeText({ text: 'Open!' });
    };

    setup = () => {
        chrome.action.setBadgeText({ text: 'Conf!' });
    };

    runing = () => {
        chrome.action.setBadgeText({ text: 'Run!' });
    };

    excluded = () => {
        chrome.action.setBadgeText({ text: 'Off!' });
    };

    /**
     * method to initialice background
     */

    start = () => {
        this.getSetting().then(() => {
            this.ValidateURLVisited().then(() => {
                console.log('extension keeper.');
            })
        });
    }

    /**
     * method to Manage Store local setting
     */

    debugSetting = () => {
        chrome.storage.local.get("atsu_setting")
            .then((setting) => {
                console.log(setting);
            });
    }

    initSetting = () => {
        return new Promise((resolve) => {
            let objA = {
                opened: false,
                uri_list: {},
                uri_conf: {},
                comment_list: {},
                comment_conf: {}
            };
            chrome.storage.local.set({ atsu_setting: objA });
            console.log('Setting System Initialized');
            resolve(true);
        });
    }

    getSetting = () => {
        return new Promise((resolve) => {
            chrome.storage.local.get("atsu_setting")
                .then((setting) => {
                    this.c_setting = setting;
                    resolve(true);
                });
        });
    }

    updateSetting = (obj) => {
        return new Promise((resolve) => {
            this.getSetting().then(() => {
                let setting = this.c_setting.atsu_setting;
                setting = this.replaceSetting(setting, obj);
                this.c_setting.atsu_setting = setting;
                chrome.storage.local.set(this.c_setting);
                console.log('Setting System are Updated');
                resolve(true);
            });
        });
    }

    replaceSetting = (objA, objB) => {
        let original = Object.entries(objA);
        let replace = Object.entries(objB);
        replace.forEach((entry) => {
            const [key1, value1] = entry;
            original.forEach((entry) => {
                const [key2, value2] = entry;
                if (typeof objA[key1] !== 'undefined') {
                    objA[key1] = objB[key1];
                } else if (typeof value2 === 'object' && Object.keys(value2).length !== 0) {
                    let tempObjB = {};
                    tempObjB[key1] = value1;
                    objA[key2] = this.replaceSetting(value2, tempObjB);
                }
            });
        });
        return objA;
    }

    /**
    * method to open the guide to pin extension on toolbar
    */

    openGuide = () => {
        return new Promise((resolve) => {
            chrome.action.getUserSettings().then((userSettings) => {
                if (userSettings.isOnToolbar == false) {
                    chrome.tabs.create({ url: chrome.runtime.getURL("src/html/guide.html") }, () => { });
                    console.log('Guide Opened');
                    resolve(true);
                }
            });
        });
    }

    /**
     * Method to URL config validations
     */

    checkURLinList = (list, uri) => {
        let contains = false;
        Object.keys(list).some((key) => {
            contains =
                typeof list[key] === 'object'
                    ? this.checkURLinList(list[key], uri)
                    : list[key] === uri;
            return contains;
        });
        return contains;
    }

    getDomainFromURL = () => {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true }, (tabs) => {
                let tab = tabs[0];
                let uri_arr = tab.url.split('/');
                let uri = uri_arr[0] + '//' + uri_arr[2];
                console.log(this.c_setting);
                let list = null;
                if (typeof this.c_setting.atsu_setting !== 'undefined') {
                    list = this.c_setting.atsu_setting.uri_list;
                }
                if (list == null) {
                    this.getSetting().then(() => {
                        list = this.c_setting.atsu_setting.uri_list;

                        let e_url = bg.checkURLinList(list, uri);
                        if (e_url && tab.status == "complete" && uri != this.c_uri) {
                            this.c_uri = uri;
                            this.is_uri_able = true;
                            this.is_uri_conf = (this.c_setting.atsu_setting.uri_conf[uri]) ? true : false;
                        }
                    })
                } else {
                    let e_url = bg.checkURLinList(list, uri);
                    if (e_url && tab.status == "complete" && uri != this.c_uri) {
                        this.c_uri = uri;
                        this.is_uri_able = true;
                        this.is_uri_conf = (this.c_setting.atsu_setting.uri_conf[uri]) ? true : false;
                    }
                }
            });
        });
    }

    ValidateURLVisited = () => {
        return new Promise((resolve) => {
            this.getDomainFromURL().then(() => {
                resolve(true);
            });
        });
    }

    saveSettingUri = (setting) => {
        return new Promise((resolve) => {
            if (typeof setting[this.c_uri] != 'undefined') {
                this.c_setting.atsu_setting.uri_conf[this.c_uri] = setting[this.c_uri];
                chrome.storage.local.set(this.c_setting);
            }
            resolve(true);
        });
    }
}

var bg = new background();

/**
 * wake up background.js
 */


bg.start();

/**
 * onInstalled Event Seeker
 */

chrome.runtime.onInstalled.addListener(async () => {
    bg.initSetting().then(async () => {
        if (bg.enviroment != "test") {
            const res = await fetch('https://api.stackexchange.com/2.3/sites?pagesize=300&filter=8.gkV_asYe9afFfvFqtlq7c*BNYNn1yRTmPHs2A5faWuzs22H5cX3_ZHMlL7PNVfn)nfrUx');
            bg.updateSetting({ uri_list: res }).then(() => {
                bg.openGuide();
                bg.installed();
            });
        } else {
            const uri = chrome.runtime.getURL('src/json/urls.json');
            fetch(uri)
                .then((response) => response.json()) //assuming file contains json
                .then((json) => {
                    bg.updateSetting({ uri_list: json }).then(() => {
                        bg.openGuide();
                        bg.installed();
                    });
                });
        }
    });
});

chrome.tabs.onUpdated.addListener(() => {
    bg.ValidateURLVisited().then(() => {
        console.log('Update Windows: ' + bg.c_uri);
    });
});
chrome.tabs.onActivated.addListener(() => {

    bg.ValidateURLVisited().then(() => {
        console.log('New Windows: ' + bg.c_uri);
    });
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //comunication popup->background.    
    if (request.popupOpen) {
        bg.updateSetting({ opened: true }).then(() => {
            bg.setup();
        });
    }

    if (request.getURl) {
        bg.getSetting().then(() => {
            sendResponse({ uri: bg.c_uri, setting: bg.c_setting });
        });
    }

    if (request.saveSetting) {
        let setting = {};
        setting[bg.c_uri] = request.config;
        bg.saveSettingUri(setting).then(() => {
            sendResponse(true);
        });
    }

    if (request.popupClosed) {
        if (bg.is_uri_conf && bg.is_uri_able && bg.is_uri_conf) {
            bg.runing();
        } else if (bg.is_uri_conf && bg.is_uri_able && bg.is_uri_conf == false) {
            bg.newTab();
        } else {
            bg.excluded();
        }
    }

    if (request.getUrlConfig) {
        sendResponse(bg.c_setting);
    }

    return true;
});

setInterval(() => {
    bg.debugSetting();
}, 10000);
