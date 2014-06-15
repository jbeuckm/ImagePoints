var searchRadiusInner, searchRadiusOuter, brightnessToDepth;
var discpoints_worker;

$(document).ready(function () {

    discpoints_worker = new Worker('scripts/discpoints_worker.js?v=' + Math.random());
    discpoints_worker.addEventListener('message', handleWorkerMessage, false);

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

function startFindingDiscPoints() {

    updateSearchRadii();

    discpoints_worker.postMessage({
        cmd: 'begin',
        image_data: image_data,
        searchRadiusInner: searchRadiusInner,
        searchRadiusOuter: searchRadiusOuter,
        brightnessToDepth: brightnessToDepth
    })
}

function handleWorkerMessage(e) {

    var data = e.data;

    switch (data.cmd) {

        case 'point_settled':
            drawPoint(data.point, "#fff");
            break;
    }
}


function updateSearchRadii() {
    searchRadiusInner = parseFloat($('#min-disc-spacing').val());
    searchRadiusOuter = parseFloat($('#max-disc-spacing').val());
    brightnessToDepth = parseFloat($('#brightness-to-depth').val());
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


function drawDiscPoints() {

    points_graphics.clear();

    console.log(inactiveDiscPoints.length+"/"+activeDiscPoints.length);

    for (var i= 0, l=activeDiscPoints.length; i<l; i++) {
        var p = activeDiscPoints[i];
        drawPoint(p, '#0f0', p.radius);
    }

    for (var i= 0, l=inactiveDiscPoints.length; i<l; i++) {
        var p = inactiveDiscPoints[i];
        drawPoint(p, '#fff', p.radius);
    }
    if (activeDiscPoints.length == 0) {
        clearInterval(drawInterval);
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
