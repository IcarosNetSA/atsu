console.log('popup.js');
chrome.runtime.sendMessage({ popupOpen: true });
document.addEventListener("DOMContentLoaded", function () {

    //let apply = document.getElementById('atsu-apply');
    let normal = document.getElementById('atsu-color-normal');
    let visited = document.getElementById('atsu-color-visited');
    let closed = document.getElementById('atsu-color-closed');

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

async function IntefaceColor(){
    let color_normal = document.getElementById('atsu-color-normal').value;
    let color_visited = document.getElementById('atsu-color-visited').value;
    let color_closed = document.getElementById('atsu-color-closed').value;
    await chrome.tabs.query({active: true}, async function(tabs) {
      let tab = tabs[0]
      await chrome.tabs.sendMessage(tab.id, {"setcolors":[color_normal, color_visited, color_closed]});
    });
}







