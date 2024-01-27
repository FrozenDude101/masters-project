const cytoscapeContainer = document.getElementById("ctyoscape-container");
const graph = cytoscape({
    container: cytoscapeContainer,
    style: [
        {
            selector: 'node',
            style: {
                'background-color': '#C66',
                'label': 'data(id)'
        }},
        {
            selector: ':parent',
            style: {
                'background-color': '#66C',
                'label': 'data(id)'
        }},
    ],
});


function displayState() {
    if (state === null)
        return
    let elems = state.getGraphElements();
    console.log(elems);
    graph.add(elems);
}