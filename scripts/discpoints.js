
var MAX_CANDIDATES = 10, INTERVAL = 5;
var activeDiscPoints, inactiveDiscPoints;
var searchRadiusInner, searchRadiusOuter;

var range_graphics;

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

    if (!range_graphics) {
        range_graphics = new createjs.Graphics();
        var range_shape = new createjs.Shape(range_graphics);
        main_stage.addChild(range_shape);
    }

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

    range_graphics.clear();

    if (activeDiscPoints.length == 0) {
        console.log('finished disc points');
        return;
    }

    var testIndex = ~~(Math.random() * activeDiscPoints.length);
    var testPoint = activeDiscPoints[testIndex];

    drawRange(testPoint);

    var setPointInactive = true;
    for (var i=0; i<MAX_CANDIDATES; i++) {
        var candidate = generateCandidate(testPoint);
        recordPointDetails(candidate);

        if (testCandidate(candidate)) {
            drawPoint(candidate);
            activeDiscPoints.push(candidate);
            setPointInactive = false;
            break;
        }
    }
    if (setPointInactive) {
        activeDiscPoints.splice(testIndex, 1);
        inactiveDiscPoints.push(testPoint);
    }
    setTimeout(processNextActivePoint, INTERVAL);
}

function recordPointDetails(p) {
    var pixel = getPixel(image_data, p.x, p.y);
}


function testCandidate(candidate) {

    var testPool = activeDiscPoints.concat(inactiveDiscPoints);

    for (var i= 0, l=testPool.length; i<l; i++) {
        var testPoint = testPool[i];
        var dist = pointDistance(candidate, testPoint);
        console.log(dist);
        if (dist < searchRadiusInner) return false;
    }
    return true;
}

function pointDistance(p1, p2) {
    return Math.sqrt( (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y) );
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

    return {
        x:parseInt(x),
        y:parseInt(y)
    };
}


function drawRange(p) {

    range_graphics.beginStroke('#f00');
    range_graphics.beginFill(null);
    range_graphics.drawCircle(p.x, p.y, searchRadiusInner);
    range_graphics.endStroke();

    range_graphics.beginStroke('#f00');
    range_graphics.beginFill(null);
    range_graphics.drawCircle(p.x, p.y, searchRadiusOuter);
    range_graphics.endStroke();

    main_stage.update();
}


function drawPoint(p) {

    points_graphics.beginFill('#fdc');
    points_graphics.drawCircle(p.x, p.y, 1);
    points_graphics.endStroke();

    main_stage.update();
}
