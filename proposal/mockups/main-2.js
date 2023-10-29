let canvas = document.getElementsByTagName("canvas")[0];
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight


let ctx = canvas.getContext("2d");
if (ctx == null)
    throw Error("ctx was null.");
ctx.imageSmoothingEnabled = false

ctx.fillStyle = "#FFF"

function drawArrow(x, y, r) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-r/180 * Math.PI)

    ctx.fillRect(-2, 0, 4, 72)

    ctx.translate(0, 71)
    ctx.rotate(-210/180 * Math.PI)
    ctx.fillRect(-2, 0, 4, 20)

    ctx.rotate(210/180 * Math.PI)
    ctx.rotate(-150/180 * Math.PI)
    ctx.fillRect(-2, 0, 4, 20)

    ctx.restore()
}

drawArrow(canvas.width/2-45, 163+150, 0)
drawArrow(canvas.width/2-45, 163+300, 0)
drawArrow(canvas.width/2-35 + 100, 422, 90)