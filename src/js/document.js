
class metaverse {

    e_click = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    injectElement = () => {

    }

    showNewPost = (mutation, c_this) => {
        let element = document.querySelector("a.s-btn.d-block");
        if(element != null){
            element.dispatchEvent(this.e_click);
            var myAudio = new Audio(chrome.runtime.getURL("src/sound/received_post.mp3"));
            myAudio.play();
        }
    }
}


window.onload = init;
async function init() {
    let uri = getC_Url();
    chrome.runtime.sendMessage({ getUrlConfig: true }, (response) => {
        if (typeof response.atsu_setting.uri_conf[uri] !== 'undefined') {

            /**
             * Set config to the current windows
             */
            let config = response.atsu_setting.uri_conf[uri];

            if (config.enable) {

                /**
                 * enable Auto Post View
                 */
                if (config.new_post) {
                    enableAutoPOST();
                }

                /**
                 * enable Rich Comment in PostWebPage
                 */
                if (config.comment) {
                    enableRichComments();
                }

                /**
                 * enable lang Detection
                 */
                if (config.lang_dt) {
                    enableLangDetection(config.lang_sel);
                }

                /**
                 * enable absence of MRE
                 */
                if (config.mre) {
                    enableMREDetection();
                }

                /**
                 * enable absence of MRE
                 */
                if (config.post_fc) {
                    enableDetectFullCodePost();
                }

                /**
                 * enable High ligh link color
                 */
                if (config.colors) {
                    enableHighLighColorLink(config.rgb_colors);
                }

            }
        } else {
            console.log('no hay configuracion para esta URL', response);
        }
    })
};

function getC_Url() {
    let urlRegex = /(https?:\/\/[^/]*)/;
    let url = window.location.href;
    return url.match(urlRegex)[1];
}


function enableAutoPOST() {
    console.log('enableAutoPOST');
    let element = document.getElementById('question-mini-list');
    cronodetector(element, 'showNewPost');
}

function enableRichComments() {
    console.log('enableRichComments');
}

function enableLangDetection(lang) {
    console.log('enableLangDetection', lang);
}

function enableMREDetection() {
    console.log('enableMREDetection');
}

function enableDetectFullCodePost() {
    console.log('enableDetectFullCodePost');
}

function enableHighLighColorLink(rgb_colors) {
    console.log('enableHighLighColorLink', rgb_colors);
    setColorLink([rgb_colors.normal, rgb_colors.visited, rgb_colors.closed]);
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(msg)
    if (msg.hasOwnProperty('setcolors')) {
        console.log('%c ATSU is coloring the links of this URL.', 'color: #f6b26b');
        window.setColorLink(msg.setcolors);
    }
    if (msg.hasOwnProperty('removecolors')) {
        console.log('%c ATSU is removing the colors of the links of this URL.', 'color: #f6b26b');
        window.removeColorsLink();
    }
    if (msg.hasOwnProperty('reload')) {
        console.log('%c ATSU Refreshing the website.', 'color: #f6b26b');
        window.location.reload();
    }
    return false;
});

function setColorLink(setColors) {

    var style = document.createElement('style');
    style.setAttribute('id', 'atsu-style');

    style.innerHTML = `
                        a.question-hyperlink,
                        a.answer-hyperlink {
                            font-family: Calibri;
                            font-weight: 100;
                            font-style: italic;
                        }
                        
                        a.question-hyperlink,
                        a.answer-hyperlink {
                            color: `+ setColors[0] + `;
                        }
                        
                        a.question-hyperlink:visited,
                        a.answer-hyperlink:visited  {
                            color: `+ setColors[1] + ` !important;
                        }
                        `;

    var elementExists = document.getElementById("atsu-style");

    if (elementExists) {
        elementExists.innerHTML = style.innerHTML;
    } else {
        document.head.appendChild(style);
    }

    var links_questions = Object.values(document.getElementsByClassName("question-hyperlink"));

    links_questions.forEach(link => {
        const special_post = ['[cerrada]', '[closed]', '[duplicada]', 'duplicated'];
        let title = link.innerHTML;
        if (special_post.some(v => title.includes(v))) {
            link.style.color = setColors[2];
        }
    });
}

function removeColorsLink() {

    var elementExists = document.getElementById("atsu-style");

    if (elementExists) {
        elementExists.remove();
    }

    var links_questions = Object.values(document.getElementsByClassName("question-hyperlink"));

    links_questions.forEach(link => {
        const special_post = ['[cerrada]', '[closed]', '[duplicada]', 'duplicated'];
        let title = link.innerHTML;
        if (special_post.some(v => title.includes(v))) {
            link.style.color = null;
        }
    });
}

function cronodetector(element, functionName) {
    let mt = new metaverse();
    // Select the node that will be observed for mutations
    const targetNode = element; //document.getElementById('add-comment-' + post_id);
    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: false };
    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for (const mutation of mutationsList) {
            mt[functionName](mutation, this);
            //injectElement(mutation, this);
        }
    };
    // Create an observer instance linked to the callback function
    // Start observing the target node for configured mutations
    if (targetNode instanceof HTMLElement) {
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }
}
