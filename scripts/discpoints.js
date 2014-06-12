
var maxCandidates = 10;
var activeDiscPoints, inactiveDiscPoints;
var searchRadiusInner, searchRadiusOuter;

$('#min-disc-spacing').change(function(e){
    console.log(e);
});

function updateSearchRadii() {
    searchRadiusInner = $('#min-disc-spacing').val();
    searchRadiusOuter = $('#max-disc-spacing').val();
}


function resetDiscPoints() {
    activeDiscPoints = [];
    inactiveDiscPoints = [];
}

function startFindingDiscPoints() {
    points_graphics.clear();
    resetDiscPoints();

    var startPoint = {
        x: ~~(Math.random() * image_canvas_ctx.canvas.width),
        y: ~~(Math.random() * image_canvas_ctx.canvas.height)
    };
    drawPoint(startPoint);
    activeDiscPoints.push(startPoint);

    updateSearchRadii();

    processNextActivePoint();
}

function processNextActivePoint() {

    if (activeDiscPoints.length == 0) {
        console.log('finished disc points');
        return;
    }

    var index = ~~(Math.random() * activeDiscPoints.length);
    var chosenActivePoint = activeDiscPoints[index];

    console.log(chosenActivePoint);
}


function drawPoint(p) {

    points_graphics.beginFill('#fdc');
    points_graphics.drawCircle(p.x, p.y, 3);
    points_graphics.endStroke();

    main_stage.update();
}
