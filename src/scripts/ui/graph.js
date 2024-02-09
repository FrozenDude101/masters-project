let cols = {
    0: document.getElementById("cc0"),
}
let rows = {

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

    let container = document.createElement("div");
    container.classList.add("container");
    container.id = `c${id}${n}`;
    container.innerHTML = `
        <button onclick="addContainer(event, '${id}${n}')">+</button>
        <button onclick="removeContainer(event, '${id}${n}')">-</button>
    `;

    col.appendChild(container);
    row.appendChild(col);
    return col;
}

function addContainer(_, id) {
    createCol(id);
}
function removeContainer(_, id) {
    let n = 9;
    while (!cols[`${id}${n}`] && n >= 0) n--;
    if (n === -1) return;
    for (let i = 0; i < 10; i++) {
        removeContainer(null, `${id}${n}`)
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