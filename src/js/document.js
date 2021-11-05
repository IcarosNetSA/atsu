
class metaverse {

    e_click = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    a_post = {};

    translate = {};

    getLangSetting = (l_set) => {
        return new Promise((resolve) => {
            const uri = chrome.runtime.getURL('src/json/lang/' + l_set + '.json');
            fetch(uri)
                .then((response) => response.json()) //assuming file contains json
                .then((json) => {
                    this.translate = json;
                    resolve(true);
                });
        });
    }

    showNewPost = (mutation, c_this) => {

        let element = document.querySelector("a.s-btn.d-block");

        if (element != null) {

            element.dispatchEvent(this.e_click);

            var myAudio = new Audio(chrome.runtime.getURL("src/sound/received_post.mp3"));
            myAudio.play();

        }
    }

    PostAnal = (l_set) => {
        return new Promise((resolve) => {
            console.log(this.translate);
            var mined = {};
            let post = document.getElementsByClassName('s-prose js-post-body');
            let p_char = 0;
            let c_char = 0;

            if (typeof post[0] !== 'undefined') {

                let post_content = post[0].children;
                let post_content_exp = '';

                Array.from(post_content).forEach((elem) => {
                    let tag = elem.tagName;
                    switch (tag) {
                        case 'P':
                            post_content_exp += ' ' + elem.textContent;
                            p_char += elem.textContent.length;
                            break;
                        case 'PRE':
                            let seek_code = elem.children;
                            Array.from(seek_code).forEach((subelem) => {
                                let tag = subelem.tagName;
                                if (tag == 'CODE') {
                                    c_char += subelem.textContent.length;
                                }
                            });
                            break;
                    }
                });

                if (p_char <= 25) {
                    mined.content = this.translate.qa.content;
                }

                if (c_char <= 25) {
                    mined.post = this.translate.qa.post;// "Seems to be missing a better Code/MRE";
                }

                if ((c_char + p_char) <= 100) {
                    mined.spam = this.translate.qa.spam; //"Apparently this post may be spam!";
                }

                let newStringSTR = post_content_exp.replace(/[^A-Za-z0-9]/g, '');
                newStringSTR = newStringSTR.replace(/\s/g, '');
                let char_count = newStringSTR.length;

                let newStringSC = post_content_exp.replace(/[A-Za-z0-9]/g, "");
                newStringSC = newStringSC.replaceAll(/\s/g, '');
                let spchar_count = newStringSC.length;

                console.log(p_char, c_char, char_count, spchar_count);

                let interpreter = parseInt((spchar_count * 100) / char_count);
                console.log(c_char, interpreter);

                if (c_char <= 25 && interpreter >= 9) {
                    mined.noformatcode = this.translate.qa.noformatcode; //"Apparently this post contains raw code!";
                }

                let defined_lan = (l_set == 'es') ? 'Español' : 'English';

                chrome.i18n.detectLanguage(post_content_exp, (result) => {

                    let lang = {};
                    lang.rel = result.isReliable;
                    lang.exp = {};

                    for (var i = 0; i < result.languages.length; i++) {
                        lang.exp[result.languages[i].language] = result.languages[i].percentage;
                    }

                    mined.a_lang = lang;

                    if (typeof lang.exp[l_set] == 'undefined') {

                        mined.notlang = this.translate.qa.notlang1;//'Apparently this post is not in the Accepted Language!; defined Laguage: ' + defined_lan;

                    } else if (lang.exp.es < 60) {

                        mined.notlang = this.translate.qa.notlang2;//'Apparently, this publication contains information in a language other than the accepted one!; defined Laguage: ' + defined_lan;

                    }

                    this.a_post = mined;

                    resolve(true);
                });
            }
        });

    }

    injectElement = (mutation, c_this) => {

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

                let mt = new metaverse();
                var l_set = config.lang_sel.toLowerCase();
                mt.getLangSetting(l_set).then(() => {

                    mt.PostAnal(l_set);


                    /**
                     * enable High ligh link color
                     */

                    if (config.colors) {
                        enableHighLighColorLink(config.rgb_colors);
                    }

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

                    let qa_post = '';

                    /**
                     * enable lang Detection
                     */
                    if (config.lang_dt) {
                        qa_post += enableLangDetection(mt);
                    }

                    /**
                     * enable absence of MRE
                     */
                    if (config.mre) {
                        qa_post += enableMREDetection(mt);
                    }

                    /**
                     * enable absence of MRE
                     */
                    if (config.post_fc) {
                        qa_post += enableDetectFullCodePost(mt);
                    }

                    qa_post += postquality(mt);

                    if (qa_post != '') {
                        atsu_suggest = `<div id="sidebar" class="show-votes" role="complementary" aria-label="sidebar">
                                        <div class="s-sidebarwidget s-sidebarwidget__yellow s-anchors s-anchors__grayscale mb16" data-tracker="cb=1">
                                            <ul class="d-block p0 m0">
                                                <div class="s-sidebarwidget--header s-sidebarwidget__small-bold-text fc-light d:fc-black-900 bb bbw1">
                                                 `+ mt.translate.atsu_sugestion + `
                                                </div>
                                                ` + qa_post + `
                                            </ul>
                                        </div>
                                    </div>`;
                        let selected = document.getElementById('sidebar');
                        let template = document.createElement('template');
                        template.innerHTML = atsu_suggest;
                        selected.parentNode.replaceChild(template.content.firstChild, selected);
                    }
                });
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
    console.log('Show New Posts is runing');
    let element = document.getElementById('question-mini-list');
    cronodetector(element, 'showNewPost');
}

function enableRichComments() {
    console.log('enableRichComments');
}

function enableLangDetection(mt) {
    console.log('POST Language Detection is runing');
    let notlang = '';

    if (typeof mt.a_post.notlang !== 'undefined') {
        notlang = `<li class="s-sidebarwidget--item d-flex px16">
                        <div class="flex--item1 fl-shrink0">
                            <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                                viewBox="0 0 14 14">
                                <path
                                    d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                                </path>
                            </svg>
                        </div>
                        <div class="flex--item wmn0 ow-break-word">
                            <span class="js-gps-track" id="atsu-notlang">` + mt.a_post.notlang + `</span>
                        </div>
                    </li>`;
    }
    return notlang;
}

function enableMREDetection(mt) {
    console.log('POST MRE Detection is runing');

    let post = '';

    if (typeof mt.a_post.post !== 'undefined') {
        post = `<li class="s-sidebarwidget--item d-flex px16">
                        <div class="flex--item1 fl-shrink0">
                            <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                                viewBox="0 0 14 14">
                                <path
                                    d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                                </path>
                            </svg>
                        </div>
                        <div class="flex--item wmn0 ow-break-word">
                            <span class="js-gps-track" id="atsu-post-mre">` + mt.a_post.post + `</span>
                        </div>
                    </li>`;
    }

    return post;
}

function enableDetectFullCodePost(mt) {
    console.log('POST Full Code Detection is runing');

    let content = '';

    if (typeof mt.a_post.content !== 'undefined') {
        post = `<li class="s-sidebarwidget--item d-flex px16">
                    <div class="flex--item1 fl-shrink0">
                        <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                            viewBox="0 0 14 14">
                            <path
                                d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                            </path>
                        </svg>
                    </div>
                    <div class="flex--item wmn0 ow-break-word">
                        <span class="js-gps-track" id="atsu-post-fc">` + mt.a_post.content + `</span>
                    </div>
                </li>`;
    }

    return content;
}

function postquality(mt) {

    let noformatcode = '';

    if (typeof mt.a_post.noformatcode !== 'undefined') {
        noformatcode = `<li class="s-sidebarwidget--item d-flex px16">
                            <div class="flex--item1 fl-shrink0">
                                <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                                    viewBox="0 0 14 14">
                                    <path
                                        d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                                    </path>
                                </svg>
                            </div>
                            <div class="flex--item wmn0 ow-break-word">
                                <span class="js-gps-track" id="atsu-noformatcode">` + mt.a_post.noformatcode + `</span>
                            </div>
                        </li>`;
    }

    let spam = '';

    if (typeof mt.a_post.spam !== 'undefined') {
        spam = `<li class="s-sidebarwidget--item d-flex px16">
                    <div class="flex--item1 fl-shrink0">
                        <svg aria-hidden="true" class="va-text-top svg-icon iconPencilSm" width="14" height="14"
                            viewBox="0 0 14 14">
                            <path
                                d="m11.1 1.71 1.13 1.12c.2.2.2.51 0 .71L11.1 4.7 9.21 2.86l1.17-1.15c.2-.2.51-.2.71 0ZM2 10.12l6.37-6.43 1.88 1.88L3.88 12H2v-1.88Z">
                            </path>
                        </svg>
                    </div>
                    <div class="flex--item wmn0 ow-break-word">
                        <span class="js-gps-track" id="atsu-spam">` + mt.a_post.spam + `</span>
                    </div>
                </li>`;
    }

    return noformatcode + spam;
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
