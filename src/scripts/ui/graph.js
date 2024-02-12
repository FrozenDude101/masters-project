let cols = {
    "0": document.getElementById("cc0"),
}
let rows = {

}
let titles = {

}
let bodies = {
    
}
let states = {

}
let marked = [];

function displayState() {
    if (states["0"] === null) return;
    for (let b in bodies) {
        states[b].annotate(b);
        bodies[b].innerHTML = states[b].toString(false, true);
    }
    for (let c of marked) {
        removeContainer(c);
    }
    marked = Object.keys(states).filter(
        k => !states[k].canStep() 
    )
}

function applicationMouseOver(event, id) {
    event.stopPropagation();
    for (let e of document.getElementsByClassName(id)) {
        e.classList.add("hover");
    }
}
function applicationMouseOut(event, id) {
    for (let e of document.getElementsByClassName(id)) {
        e.classList.remove("hover");
    }
}
function applicationClick(event, collection, id) {
    event.stopPropagation();

    let tW = states[collection].getById(id);
    if (states.id === id) return;
    for (let k in states) {
        if (states[k] === tW) return;
    }

    let cID = createCol(tW.collection).id.slice(2);
    tW.annotate(cID);

    states[cID] = tW;
    titles[cID].innerHTML = ""+tW;
    displayState();
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

    let container = createContainer(`${id}${n}`)

    col.appendChild(container);
    row.appendChild(col);
    return col;
}
function createContainer(id) { 
    let container = document.createElement("div");
    container.classList.add("container");
    container.id = `c${id}`;

    container.onclick = () => containerClick(id);

    let title = document.createElement("div");
    title.classList.add("container-title");
    title.id = `ct${id}`;

    let body = document.createElement("div");
    body.classList.add("container-body");
    body.id = `cb${id}`;

    titles[id] = title;
    bodies[id] = body;

    container.appendChild(title);
    container.appendChild(body);

    return container;
}

function addContainer(id) {
    createCol(id);
}
function removeContainer(id) {
    if (id === "0") return;
    if (!cols[`${id}`]) return;
    for (let i = 0; i < 10; i++) {
        removeContainer(`${id}${i}`);
    }
    let col = cols[`${id}`]
    let row = rows[id.slice(0, -1)];
    row.removeChild(col);
    delete cols[`${id}`];
    delete titles[`${id}`];
    delete bodies[`${id}`];
    delete states[`${id}`];
    if (row.children.length === 0) {
        let col2 = cols[id.slice(0, -1)];
        col2.removeChild(row);
        delete rows[`${id.slice(0, -1)}`]
    }
}

function containerClick(id) {
    if (!states[id]?.canStep()) {
        removeContainer(id);
        return;
    };
    let pre = ""+states[id];
    while (""+states[id] === pre && states[id].canStep()) {
        states[id].step();
    }
    displayState();
}

cols["0"].appendChild(createContainer("0"));