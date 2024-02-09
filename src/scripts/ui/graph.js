let cols = {
    "0": document.getElementById("cc0"),
}
let rows = {

}
let bodies = {
    
}

function displayState() {
    containers[0].innerHTML = `${state === null ? "" : state}`;
    cytoscapeContainer.innerHTML = `${state === null ? "" : state}`;
}

function applicationMouseOver(event, id) {
    event.stopPropagation();
    document.getElementById(id).classList.add("hover");
}
function applicationMouseOut(event, id) {
    document.getElementById(id).classList.remove("hover");
}
function applicationClick(event, id) {
    event.stopPropagation();
}

function createRow(id) {
    let row = document.createElement("div");
    row.classList.add("container-row");
    row.id = `cr${id}`;
    rows[id] = row;

    cols[id].appendChild(row);
    return row;
}
function createCol(id) {
    let row = rows[id] ? rows[id] : createRow(id);

    let n = 0;
    while (cols[`${id}${n}`]) n++;

    let col = document.createElement("div");
    col.classList.add("container-column");
    col.id = `cc${id}${n}`;
    cols[`${id}${n}`] = col;

    let container = createContainer()

    col.appendChild(container);
    row.appendChild(col);
    return col;
}
function createContainer(id) { 
    let container = document.createElement("div");
    container.classList.add("container");
    container.id = `c${id}`;

    let title = document.createElement("div");
    title.classList.add("container-title");
    title.id = `ct${id}`;

    let body = document.createElement("div");
    body.classList.add("container-body");
    body.id = `cb${id}`;

    container.appendChild(title);
    container.appendChild(body);

    return container;
}

function addContainer(id) {
    createCol(id);
}
function removeContainer(id) {
    let n = 9;
    while (!cols[`${id}${n}`] && n >= 0) n--;
    if (n === -1) return;
    for (let i = 0; i < 10; i++) {
        removeContainer(`${id}${n}`);
    }
    let col = cols[`${id}${n}`]
    let row = rows[id];
    row.removeChild(col);
    delete cols[`${id}${n}`];
    if (n == 0) {
        cols[`${id}`].removeChild(row);
        delete rows[`${id}`]
    }
}