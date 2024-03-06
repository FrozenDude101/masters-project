let cols = {
    "0": document.getElementById("cc0"),
}
let rows = {
    "": document.getElementById("cr"),
}
let titles = {

}
let bodies = {
    
}
let states = {

}
let marked = [];
let typeCols = {

}
let typeTitles = {}
let typeBodies = {}

function reset() {
    document.getElementById("cr").innerHTML = `<div class="container-column" id="cc0"></div>`;
    cols = {
        "0": document.getElementById("cc0"),
    }
    rows = {
        "": document.getElementById("cr"),
    }
    titles = {

    }
    bodies = {
        
    }
    marked = [];
    typeCols = {

    }
    typeTitles = {}
    typeBodies = {}

    let c = createContainer("0");
    cols["0"].appendChild(c);
    titles["0"].innerHTML = "Setup to begin.";
}

function displayState() {
    if (states["0"] === null) return;
    bodies["0"].innerHTML = states["0"].toHtml();
    for (let b in bodies) {
        bodies[b].innerHTML = states[b].toHtml();
    }
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
function applicationClick(event, id) {
    event.stopPropagation();

    if (Object.values(states).includes(id))
        return;

    let parent = "0";
    for (let b in bodies) {
        if (states[b].getThunkById(id)) {
            parent = b;
        }
    }

    let cID = createCol(parent).id.slice(2);

    states[cID] = states["0"].getThunkById(id);
    tW = states["0"].getThunkById(id);
    console.log(tW+"");

    titles[cID].innerHTML = ""+tW;
    titles[cID].appendChild(createTypeButton(cID));
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

    let container = createContainer(`${id}${n}`);
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

    let r = document.createElement("div");
    r.classList.add("container-row");
    r.appendChild(container);

    let tb = createTypeButton(id);

    return r;
}
function createTypeButton(id) {
    let typeButton = document.createElement("button");
    typeButton.classList.add("title-button");
    typeButton.id = `tb${id}`;
    typeButton.innerHTML = "T"
    typeButton.onclick = (e) => typeClick(e, id);
    return typeButton;
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
    removeTypeContainer(id);
    if (row.children.length === 0) {
        let col2 = cols[id.slice(0, -1)];
        col2.removeChild(row);
        delete rows[`${id.slice(0, -1)}`]
    }
}
function removeTypeContainer(id) {
    if (!typeCols[`${id}`]) return;
    typeCols[`${id}`].remove();
    delete typeCols[`${id}`];
    delete typeTitles[`${id}`];
    delete typeBodies[`${id}`];
}

function containerClick(id) {
    if (!states[id]?.canStep()) {
        removeContainer(id);
        return;
    };
    let pre = states[id]+"";
    while (states[id]+"" === pre) {
        states[id] = states[id].step();
    }
    displayState();
}

function createTypeCol(id) {
    let col = document.createElement("div");
    col.classList.add("container-column", "type");
    col.id = `tc${id}`;
    typeCols[`${id}`] = col;

    let container = createTypeContainer(`${id}`)

    col.appendChild(container);
    return col;
}
function createTypeContainer(id) {
    let c = document.createElement("div");
    c.classList.add("container", "type");

    let title = document.createElement("div");
    title.classList.add("container-title", "type");
    title.id = `ct${id}`;
    typeTitles[`${id}`] = title;

    let body = document.createElement("div");
    body.classList.add("container-body", "type");
    body.id = `cb${id}`;
    typeBodies[`${id}`] = body;

    let closeButton = document.createElement("button");
    closeButton.classList.add("title-button");
    closeButton.id = `cb${id}`;
    closeButton.innerHTML = "X";
    closeButton.onclick = () => removeTypeContainer(id);

    title.innerHTML = states[`${id}`].type;
    title.appendChild(closeButton);

    if (states[`${id}`].t instanceof ApplicationThunk) {
        let cs = states[`${id}`].t.t1.type.getUCS(states[`${id}`].t.t2.type);
        let string = "<br>None";
        if (Object.keys(cs).length !== 0) {
            string = "";
            for (let k in cs) {
                string += `<br>${k.split("_").slice(0,-1).join("_")} = ${cs[k]}`
            }
        }
        body.innerHTML = `${states[`${id}`].t.t2.type}<br>is applied to<br>${states[`${id}`].t.t1.type}<br>returning<br>${states[`${id}`].type}<br><br>Replacements${string}`;
    } else {
        body.innerHTML = `${states[`${id}`]}`
    }

    c.appendChild(title);
    c.appendChild(body);

    return c;
}

function typeClick(event, id) {
    event.stopPropagation();
    if (typeCols[id]) return;
    let col = createTypeCol(id);
    document.getElementById(`c${id}`).insertAdjacentElement("afterend", col);
}

reset();