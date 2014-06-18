
var MAX_CANDIDATES = 10, INTERVAL = 0, MAX_BRIGHTNESS = 255*3;
var activeDiscPoints, inactiveDiscPoints, tree;
var searchRadiusInner, searchRadiusOuter, brightnessToDepth;


/**
 * Worker thread analyzes the image to keep the UI thread nice.
 */
self.addEventListener('message', function(e) {

    var data = e.data;

    switch (data.cmd) {

        case 'begin':
            image_data = data.image_data;

            searchRadiusInner = data.searchRadiusInner;
            searchRadiusOuter = data.searchRadiusOuter;
            brightnessToDepth = data.brightnessToDepth;

            startFindingDiscPoints();
            break;

        case 'stop':
            self.close(); // Terminates the worker.
            break;

        default:
            self.postMessage('Unknown command: ' + data.cmd);
    }

}, false);


function resetDiscPoints() {
    activeDiscPoints = [];
    inactiveDiscPoints = [];
}

function startFindingDiscPoints() {

    resetDiscPoints();

    var startPoint = {
        x: Math.floor(Math.random() * image_data.width),
        y: Math.floor(Math.random() * image_data.height)
    };

    activeDiscPoints.push(startPoint);

    initTree();

    while (activeDiscPoints.length > 0) {
        processNextActivePoint();
    }

    console.log('finished disc points');
    self.postMessage({
        'cmd': 'complete',
        'points': inactiveDiscPoints
    });
}

var drawInterval;


function processNextActivePoint() {

    var testIndex = Math.floor(Math.random() * activeDiscPoints.length);
    var testPoint = activeDiscPoints[testIndex];

    var setPointInactive = true;
    for (var i=0; i<MAX_CANDIDATES; i++) {
        var candidate = generateCandidate(testPoint);
        recordPointDetails(candidate);

        if (testCandidate(candidate)) {
            candidate.radius = .1 + brightnessToDepth * candidate.brightness/MAX_BRIGHTNESS;
            addPointToTree(candidate);
            activeDiscPoints.push(candidate);
            setPointInactive = false;
            break;
        }
    }
    if (setPointInactive) {
        activeDiscPoints.splice(testIndex, 1);
        inactiveDiscPoints.push(testPoint);
        self.postMessage({
            'cmd': 'point_settled',
            'point': testPoint
        });
    }

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

var testPoint, dist, testPool, padding, treeCol, treeRow;
function testCandidate(candidate) {

    padding = candidate.padding;
    treeCol = candidate.treeCol;
    treeRow = candidate.treeRow;

    for (var i=-1; i<=1; i++) {
        for (var j=-1; j<=1; j++) {

            testPool = tree[treeCol+i][treeRow+j];

            for (var k= 0, l=testPool.length; k<l; k++) {
                testPoint = testPool[k];

                dist = pointDistance(candidate, testPoint);

                if (dist < (padding + testPoint.padding)/2) {
                    return false;
                }
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
    if (x > image_data.width) return generateCandidate(p);
    if (y < 0) return generateCandidate(p);
    if (y > image_data.height) return generateCandidate(p);

    return {
        x:parseInt(x),
        y:parseInt(y)
    };
}



function initTree() {
    var cols = Math.ceil(image_data.width / searchRadiusOuter);
    var rows = Math.ceil(image_data.height / searchRadiusOuter);
    tree = {};
    for (var i=-1; i<=cols+1; i++) {
        tree[i] = {};
        for (var j=-1; j<rows+1; j++) {
            tree[i][j] = [];
        }
    }
}

function getPixel(imageData, x, y) {
    index = (x + y * imageData.width) * 4;

    return {
        r: imageData.data[index + 0],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}
