var circles = [
    {id: '1', x: 40, y: 40, radius: 20, fillStyle: "orange"},
    {id: '2', x: 190, y: 100, radius: 10, fillStyle: "red"},
    {id: '3', x: 160, y: 200, radius: 20, fillStyle: "green"},
    {id: '4', x: 260, y: 200, radius: 30, fillStyle: "blue"},
    {id: '5', x: 290, y: 100, radius: 15, fillStyle: "black"}
];
var lines = [
    {from: '1', to: '2'},
    {from: '3', to: '2'},
    {from: '4', to: '2'},
    {from: '5', to: '2'},
    {from: '1', to: '3'},
    {from: '3', to: '4'},
    {from: '4', to: '5'},
    {from: '5', to: '1'},
];

function draw() {
    var canvas = document.getElementById("brainMap")
    if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        for (let i = 0; i < circles.length; i++) {
            let circle = circles[i];
            ctx.beginPath();
            ctx.fillStyle = circle.fillStyle;
            ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.fillText(circle.id, circle.x - 4, circle.y + 4);//为了居中显示，4像素是假设文本的高宽是8像素，实际不一定。
            ctx.closePath();
        }
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let from = circles.find(circle => circle.id === line.from);
            let to = circles.find(circle => circle.id === line.to);
            ctx.beginPath();
            ctx.strokeStyle = "#ff0000";
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            ctx.closePath();
        }
    } else {
        //展示静态图片
    }
}