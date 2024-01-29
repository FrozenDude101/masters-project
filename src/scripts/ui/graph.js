const cytoscapeContainer = document.getElementById("ctyoscape-container");

function displayState() {
    if (state === null)
        return
    cytoscapeContainer.innerHTML = ""+state;
}