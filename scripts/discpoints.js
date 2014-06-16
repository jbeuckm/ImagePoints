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
    main_canvas.width = main_canvas.width;

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
            drawPoint(data.point, "#fff", data.point.radius);
            break;

        case "complete":
            break;
    }
}

function updateSearchRadii() {
    searchRadiusInner = parseFloat($('#min-disc-spacing').val());
    searchRadiusOuter = parseFloat($('#max-disc-spacing').val());
    brightnessToDepth = parseFloat($('#brightness-to-depth').val());
}



function drawPoint(p, color, radius) {

    main_ctx.fillStyle = color;
    main_ctx.beginPath();
    main_ctx.arc(p.x, p.y, radius || .75, 0, Math.PI*2, true);
    main_ctx.closePath();
    main_ctx.fill();

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


