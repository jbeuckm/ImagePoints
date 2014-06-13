
var MAX_CANDIDATES = 10, INTERVAL = 0, MAX_BRIGHTNESS = 255*3;
var activeDiscPoints, inactiveDiscPoints;
var searchRadiusInner, searchRadiusOuter, brightnessToDepth;
var tree;


$(document).ready(function () {

    $('#min-disc-spacing').on("input change", function(){
        $('#min-disc-spacing-display').text($(this).val());
        searchRadiusInner = parseFloat($('#min-disc-spacing').val());
        if (searchRadiusOuter < searchRadiusInner * 1.1) {
            searchRadiusOuter = searchRadiusInner * 1.1;
            $('#max-disc-spacing').val(searchRadiusOuter);
        }
    });

    $('#max-disc-spacing').on("input change", function(){
        $('#max-disc-spacing-display').text($(this).val());
        searchRadiusOuter = parseFloat($('#max-disc-spacing').val());
        if (searchRadiusInner > searchRadiusOuter / 1.1) {
            searchRadiusInner = searchRadiusOuter / 1.1;
            $('#min-disc-spacing').val(searchRadiusInner);
        }
    });

    $('#brightness-to-depth').on("input change", function(){
        $('#brightness-to-depth-display').text($(this).val());
        brightnessToDepth = parseFloat($('#brightness-to-depth').val());
    });

    $('#disc-speed').on("input change", function(){
        $('#disc-speed-display').text($(this).val());
        INTERVAL = 1000 - parseInt($('#disc-speed').val());
    });

});


function updateSearchRadii() {
    searchRadiusInner = parseFloat($('#min-disc-spacing').val());
    searchRadiusOuter = parseFloat($('#max-disc-spacing').val());
    brightnessToDepth = parseFloat($('#brightness-to-depth').val());
}


function resetDiscPoints() {
    activeDiscPoints = [];
    inactiveDiscPoints = [];
}

function startFindingDiscPoints() {

    points_graphics.clear();

    resetDiscPoints();

    var startPoint = {
        x: Math.floor(Math.random() * IMAGE_WIDTH),
        y: Math.floor(Math.random() * IMAGE_HEIGHT)
    };
    drawPoint(startPoint);
    activeDiscPoints.push(startPoint);

    updateSearchRadii();
    initTree();

    processNextActivePoint();
}


function processNextActivePoint() {

    explicit_graphics.clear();

    if (activeDiscPoints.length == 0) {
        console.log('finished disc points');
        return;
    }

    var testIndex = Math.floor(Math.random() * activeDiscPoints.length);
    var testPoint = activeDiscPoints[testIndex];

    drawRangePoint(testPoint, '#00f');


    var setPointInactive = true;
    for (var i=0; i<MAX_CANDIDATES; i++) {
        var candidate = generateCandidate(testPoint);
        recordPointDetails(candidate);

        if (testCandidate(candidate)) {
            candidate.radius = .1 + brightnessToDepth * candidate.brightness/MAX_BRIGHTNESS;
            drawPoint(candidate, '#0f0', candidate.radius);
            addPointToTree(candidate);
            activeDiscPoints.push(candidate);
            setPointInactive = false;
            break;
        }
    }
    if (setPointInactive) {
        activeDiscPoints.splice(testIndex, 1);
        drawPoint(testPoint, '#000', testPoint.radius+.1);
        drawPoint(testPoint, '#fff', testPoint.radius);
        inactiveDiscPoints.push(testPoint);
    }

    setTimeout(processNextActivePoint, INTERVAL);
}

function recordPointDetails(p) {
    var pixel = getPixel(image_data, p.x, p.y);
    p.brightness = brightness(pixel);
    p.padding = searchRadiusInner + (1-p.brightness/MAX_BRIGHTNESS) * (searchRadiusOuter-searchRadiusInner);

    p.treeCol = Math.floor(p.x / searchRadiusOuter);
    p.treeRow = Math.floor(p.y / searchRadiusOuter);
}

function addPointToTree(p) {
    tree[p.treeCol][p.treeRow].push(p);
}

function brightness(pixel) {
    return pixel.r + pixel.g + pixel.b;
}

function testCandidate(candidate) {

    drawRangePoint(candidate, '#4ff');

    var testPool;

    for (var i=-1; i<=1; i++) {
        for (var j=-1; j<=1; j++) {
            testPool = tree[candidate.treeCol+i][candidate.treeRow+j];

            for (k= 0, l=testPool.length; k<l; k++) {
                var testPoint = testPool[k];

                drawRangePoint(testPoint);

                var dist = pointDistance(candidate, testPoint);

                if (dist < (candidate.padding + testPoint.padding)/2) return false;
            }
        }
    }
    return true;
}


var dx, dy;
function pointDistance(p1, p2) {
    dx = p1.x - p2.x;
    dy = p1.y - p2.y;
    return Math.sqrt( dx*dx + dy*dy );
}

var PI_2 = 2 * Math.PI;
function generateCandidate(p) {
    var theta = Math.random() * PI_2;

    var range = searchRadiusOuter - searchRadiusInner;

    var radius = searchRadiusInner + Math.random() * 2 * range;

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


function drawRangePoint(p, color) {

    explicit_graphics.beginStroke(color || '#f00');
    explicit_graphics.beginFill(null);
    explicit_graphics.drawCircle(p.x, p.y, 4);
    explicit_graphics.endStroke();
}
function drawRange(p) {

    explicit_graphics.beginStroke('#f00');
    explicit_graphics.beginFill(null);
    explicit_graphics.drawCircle(p.x, p.y, searchRadiusInner);
    explicit_graphics.endStroke();

    explicit_graphics.beginStroke('#f00');
    explicit_graphics.beginFill(null);
    explicit_graphics.drawCircle(p.x, p.y, searchRadiusOuter);
    explicit_graphics.endStroke();

    main_stage.update();
}


function drawPoint(p, color, radius) {

    points_graphics.beginFill(color);
    points_graphics.drawCircle(p.x, p.y, radius || .75);
    points_graphics.endStroke();

    main_stage.update();
}


function initTree() {
    var cols = Math.ceil(IMAGE_WIDTH / searchRadiusOuter);
    var rows = Math.ceil(IMAGE_HEIGHT / searchRadiusOuter);
    tree = {};
    for (var i=-1; i<=cols+1; i++) {
        tree[i] = {};
        for (var j=-1; j<rows+1; j++) {
            tree[i][j] = [];
        }
    }
}



(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
