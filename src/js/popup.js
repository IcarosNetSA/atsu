document.addEventListener("DOMContentLoaded", function () {
    class popup {

        c_uri = null;

        c_global_setting = {};

        constructor() {
            console.log('called popup.js');
        }

        /**
         * need retrive stored setting if is hable.
         */

        retriveSetting = () => {

            if (typeof this.c_global_setting.atsu_setting.uri_conf[this.c_uri] !== 'undefined') {
                let config = this.c_global_setting.atsu_setting.uri_conf[this.c_uri];

                /**
                 * Set config to the current config windows
                 */


                console.log(this.c_global_setting, this.c_uri);

                let atsu_enable = document.getElementById('act-url');
                let atsu_new_post = document.getElementById('atsu-new-post');
                let atsu_comment = document.getElementById('atsu-comment');
                let atsu_lang_dt = document.getElementById('atsu-lang-dt');
                let atsu_lang_sel = document.getElementById('atsu-lang-sel');
                let atsu_mre = document.getElementById('atsu-mre');
                let atsu_post_fc = document.getElementById('atsu-post-fc');
                let atsu_hl_post = document.getElementById('atsu-hl-post');
                let c_normal = document.getElementById('atsu-color-normal');
                let c_visited = document.getElementById('atsu-color-visited');
                let c_closed = document.getElementById('atsu-color-closed');

                atsu_enable.checked = config.enable;

                atsu_new_post.checked = config.new_post;
                atsu_comment.checked = config.comment;
                atsu_lang_dt.checked = config.lang_dt;
                atsu_lang_sel.value = config.lang_sel;
                atsu_mre.checked = config.mre;
                atsu_post_fc.checked = config.post_fc;
                atsu_hl_post.checked = config.colors;

                c_normal.value = config.rgb_colors.normal;
                c_visited.value = config.rgb_colors.visited;
                c_closed.value = config.rgb_colors.closed;

                /**
                 * mostrar elementos.
                 */

                let collapseElementList = [].slice.call(document.querySelectorAll('.atsu-options'));
                let atsu_colors = document.getElementById('atsu-colors');

                if (config.enable) {
                    console.log('ATSU: trying to activate the settings for this site.');
                    collapseElementList.map(function (collapseEl) {
                        new bootstrap.Collapse(collapseEl, { hide: false });
                    });
                } else {
                    console.log('ATSU: trying to disable the settings for this site.');
                    var collapseList = collapseElementList.map(function (collapseEl) {
                        new bootstrap.Collapse(collapseEl, { show: false });
                    });
                }

                if (config.colors) {
                    if (!atsu_colors.className.includes('show') && atsu_hl_post.checked) {
                        new bootstrap.Collapse(atsu_colors, { hide: false });
                    }
                } else {
                    if (atsu_colors.className.includes('show')) {
                        new bootstrap.Collapse(atsu_colors, { show: false });
                    }
                }

                //this.enableConfEvent(this, atsu_enable);

            }
        }

        /**
         * Event Handlers
         * @param {} c_this 
         */

        startPopUp = (c_this) => {
            c_this.retriveSetting();
            let atsu_enable = document.getElementById('act-url');
            atsu_enable.addEventListener("change", function (e) {
                e.preventDefault();
                c_this.enableConfEvent(c_this, atsu_enable);
            });

            let atsu_hl_post = document.getElementById('atsu-hl-post');
            atsu_hl_post.addEventListener("change", function (e) {
                e.preventDefault();
                atsu_hl_post.setAttribute("disabled", true);
                setTimeout(() => {
                    console.log('remove atributed fired');
                    atsu_hl_post.removeAttribute("disabled");
                }, 1800);
            });

            let normal = document.getElementById('atsu-color-normal');
            normal.addEventListener("input", function (e) {
                e.preventDefault();
                c_this.IntefaceColor();
            });

            let visited = document.getElementById('atsu-color-visited');
            visited.addEventListener("input", function (e) {
                e.preventDefault();
                c_this.IntefaceColor();
            });

            let closed = document.getElementById('atsu-color-closed');
            closed.addEventListener("input", function (e) {
                e.preventDefault();
                c_this.IntefaceColor();
            });

            let apply = document.getElementById('atsu-apply');
            apply.addEventListener("click", function (e) {
                e.preventDefault();
                c_this.getInputConfig();
            });
        };


        enableConfEvent = (c_this, atsu_enable) => {
            atsu_enable.setAttribute("disabled", true);
            setTimeout(() => {
                console.log('remove atributed fired');
                atsu_enable.removeAttribute("disabled");
            }, 1800);
            if (!navigator.cookieEnabled) {
                if (atsu_enable.checked) {
                    atsu_enable.checked = false;
                }
                alert("You are trying to activate ATSU, and it is not possible since your browser's cookies are not activated.");
                window.close();
                return false;
            }
            let collapseElementList = [].slice.call(document.querySelectorAll('.atsu-options'));
            let atsu_colors = document.getElementById('atsu-colors');
            let atsu_hl_post = document.getElementById('atsu-hl-post');
            if (atsu_enable.checked) {
                console.log('ATSU: trying to activate the settings for this site.');
                collapseElementList.map(function (collapseEl) {
                    new bootstrap.Collapse(collapseEl, { hide: false });
                });
                if (!atsu_colors.className.includes('show') && atsu_hl_post.checked) {
                    new bootstrap.Collapse(atsu_colors, { hide: false });
                }
                if (atsu_hl_post.checked) {
                    c_this.IntefaceColor();
                }
            } else {
                console.log('ATSU: trying to disable the settings for this site.');
                var collapseList = collapseElementList.map(function (collapseEl) {
                    new bootstrap.Collapse(collapseEl, { show: false });
                });
                if (atsu_colors.className.includes('show')) {
                    new bootstrap.Collapse(atsu_colors, { show: false });
                }
                c_this.removeColorInteface();
            }
        }



        IntefaceColor = async () => {
            console.log('get interface color')
            let color_normal = document.getElementById('atsu-color-normal').value;
            let color_visited = document.getElementById('atsu-color-visited').value;
            let color_closed = document.getElementById('atsu-color-closed').value;
            await chrome.tabs.query({ active: true }, async function (tabs) {
                let tab = tabs[0];
                console.log('triying send color for CSS')
                await chrome.tabs.sendMessage(tab.id, { setcolors: [color_normal, color_visited, color_closed] });
            });
        }

        removeColorInteface = async () => {
            await chrome.tabs.query({ active: true }, async function (tabs) {
                let tab = tabs[0];
                await chrome.tabs.sendMessage(tab.id, { removecolors: true });
            });
        }

        getInputConfig = () => {
            let config = {};
            let atsu_enable = document.getElementById('act-url');
            config.enable = atsu_enable.checked;
            if (atsu_enable.checked) {
                let atsu_new_post = document.getElementById('atsu-new-post');
                let atsu_comment = document.getElementById('atsu-comment');
                let atsu_lang_dt = document.getElementById('atsu-lang-dt');
                let atsu_lang_sel = document.getElementById('atsu-lang-sel');
                let atsu_mre = document.getElementById('atsu-mre');
                let atsu_post_fc = document.getElementById('atsu-post-fc');
                let atsu_colors = document.getElementById('atsu-hl-post');
                let c_normal = document.getElementById('atsu-color-normal');
                let c_visited = document.getElementById('atsu-color-visited');
                let c_closed = document.getElementById('atsu-color-closed');
                config.new_post = atsu_new_post.checked;
                config.comment = atsu_comment.checked;
                config.lang_dt = atsu_lang_dt.checked;
                if (atsu_lang_dt.checked && typeof atsu_lang_sel.options[atsu_lang_sel.selectedIndex] !== 'undefined') {
                    config.lang_sel = atsu_lang_sel.options[atsu_lang_sel.selectedIndex].value;
                }
                config.mre = atsu_mre.checked;
                config.post_fc = atsu_post_fc.checked;
                config.colors = atsu_colors.checked;
                if (atsu_colors.checked) {
                    config.rgb_colors = {
                        normal: c_normal.value,
                        visited: c_visited.value,
                        closed: c_closed.value
                    }
                }
            }
            this.saveSetting(config);
        };

        saveSetting = (config) => {
            console.log(config);
            chrome.runtime.sendMessage({ "saveSetting": true, "config": config }, (response) => {
                if (response) {
                    let not = document.getElementById('atsu-not-save');
                    not.innerHTML = 'Saved Setting!';
                    console.log('ATSU: has saved the settings for this URL locally.');
                    this.tabUpdate();
                    setTimeout(() => {
                        window.close();
                        return false;
                    }, 2000);
                }
            });
        };

        syncSaveSetting = () => {
            /**
             * Guardado de Configuracion en la nube
             */
        };

        /**
         * update current tab.
         */

        tabUpdate = () => {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
            });
        }
    }

    var pp = new popup();

    chrome.runtime.sendMessage({ popupOpen: true, getURl: true }, (response) => {
        if (typeof response.uri !== 'undefined') {
            pp.c_uri = response.uri;
        }
        if (typeof response.setting !== 'undefined') {
            pp.c_global_setting = response.setting;
        }
        pp.startPopUp(pp);
    });

    window.onblur = () => {
        chrome.runtime.sendMessage({ popupClosed: true });
    }

});
