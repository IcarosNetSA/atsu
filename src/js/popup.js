console.log('popup.js');
chrome.runtime.sendMessage({ popupOpen: true });
document.addEventListener("DOMContentLoaded", function () {

    //let apply = document.getElementById('atsu-apply');
    let atsu_enable = document.getElementById('act-url');
    let normal = document.getElementById('atsu-color-normal');
    let visited = document.getElementById('atsu-color-visited');
    let closed = document.getElementById('atsu-color-closed');

    atsu_enable.addEventListener("change", function (e) {
        e.preventDefault();
        if (navigator.cookieEnabled) {
            if (atsu_enable.checked) {
                var collapseElementList = [].slice.call(document.querySelectorAll('.atsu-options'))
                var collapseList = collapseElementList.map(function (collapseEl) {
                    return new bootstrap.Collapse(collapseEl, { toggle: true });
                });

                //add-comment-492923

                //aqui evaluar se la Cookies existe;
                //aqui evaliar si la Cookies contiene los valores de los setting.
                //colocar los valores guardado en los input.

            } else {
                var collapseElementList = [].slice.call(document.querySelectorAll('.atsu-options'))
                var collapseList = collapseElementList.map(function (collapseEl) {
                    return new bootstrap.Collapse(collapseEl, { toggle: true });
                });
            }
        } else {
            if (atsu_enable.checked) {
                atsu_enable.checked = false;
            }
            alert("You are trying to activate ATSU, and it is not possible since your browser's cookies are not activated.");
            window.close();
            return false;
        }
    });

    normal.addEventListener("input", function (e) {
        e.preventDefault();
        IntefaceColor();
    });

    visited.addEventListener("input", function (e) {
        e.preventDefault();
        IntefaceColor();
    });

    closed.addEventListener("input", function (e) {
        e.preventDefault();
        IntefaceColor();
    });
});

async function IntefaceColor() {
    let color_normal = document.getElementById('atsu-color-normal').value;
    let color_visited = document.getElementById('atsu-color-visited').value;
    let color_closed = document.getElementById('atsu-color-closed').value;
    await chrome.tabs.query({ active: true }, async function (tabs) {
        let tab = tabs[0]
        await chrome.tabs.sendMessage(tab.id, { "setcolors": [color_normal, color_visited, color_closed] });
    });
}







