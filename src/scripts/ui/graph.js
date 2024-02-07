const cytoscapeContainer = document.getElementById("ctyoscape-container");

function displayState() {
    cytoscapeContainer.innerHTML = `${state === null ? "" : state}`;
}