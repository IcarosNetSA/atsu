chrome.runtime.sendMessage({ popupOpen: true });
document.addEventListener("DOMContentLoaded", function () {
    
    let apply = document.getElementById('atsu-apply');

    apply.addEventListener("click", function (){
        let color_normal = document.getElementById('atsu-color-normal').value;

        let color_visited = document.getElementById('atsu-color-visited').value;

        let color_closed = document.getElementById('atsu-color-closed').value;

        window.setColorLink(color_normal, color_visited, color_closed);
    })
});