
var MAX_CANDIDATES = 10;
var activeDiscPoints, inactiveDiscPoints;
var searchRadiusInner, searchRadiusOuter;

$('#min-disc-spacing').change(function(e){
    console.log(e);
});

function updateSearchRadii() {
    searchRadiusInner = parseFloat($('#min-disc-spacing').val());
    searchRadiusOuter = parseFloat($('#max-disc-spacing').val());
}


function resetDiscPoints() {
    activeDiscPoints = [];
    inactiveDiscPoints = [];
}

function startFindingDiscPoints() {
    points_graphics.clear();
    resetDiscPoints();

    var startPoint = {
        x: ~~(Math.random() * IMAGE_WIDTH),
        y: ~~(Math.random() * IMAGE_HEIGHT)
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

    var testIndex = ~~(Math.random() * activeDiscPoints.length);
    var testPoint = activeDiscPoints[testIndex];

    console.log(testPoint);
    drawRange(testPoint);

    var setPointInactive = true;
    for (var i=0; i<MAX_CANDIDATES; i++) {
        var candidate = generateCandidate(testPoint);
        drawPoint(candidate);

        if (testCandidate(candidate)) {
            recordPointDetails(candidate);
            activeDiscPoints.push(candidate);
            setPointInactive = false;
            break;
        }
    }
    if (setPointInactive) {
        activeDiscPoints.splice(testIndex, 1);
        inactiveDiscPoints.push(testPoint);
    }
    setTimeout(processNextActivePoint, 500);
}

function recordPointDetails(p) {
    var pixel = getPixel(image_data, p.x, p.y);
    console.log(pixel);
}


function testCandidate(candidate) {
    return true;
}


var PI_2 = 2 * Math.PI;
function generateCandidate(p) {
    var theta = Math.random() * PI_2;

    var range = searchRadiusOuter - searchRadiusInner;
    console.log(range);
    var radius = searchRadiusInner + Math.random() * range;

    var x = p.x + radius * Math.cos(theta);
    var y = p.y + radius * Math.sin(theta);

    if (x < 0) return generateCandidate(p);
    if (x > IMAGE_WIDTH) return generateCandidate(p);
    if (y < 0) return generateCandidate(p);
    if (y > IMAGE_HEIGHT) return generateCandidate(p);

    return { x:x, y:y };
}


function drawRange(p) {

    points_graphics.beginStroke('#f00');
    points_graphics.beginFill(null);
    points_graphics.drawCircle(p.x, p.y, searchRadiusInner);
    points_graphics.endStroke();

    points_graphics.beginStroke('#f00');
    points_graphics.beginFill(null);
    points_graphics.drawCircle(p.x, p.y, searchRadiusOuter);
    points_graphics.endStroke();

    main_stage.update();
}


function drawPoint(p) {

    points_graphics.beginFill('#fdc');
    points_graphics.drawCircle(p.x, p.y, 3);
    points_graphics.endStroke();

    main_stage.update();
}
