var holes;

var blockSizeSlider, blockSize;
var holeSizeSlider, holeSize;
var finalWidthSlider;

var currentRow, currentJobNo;
var imagepoints_worker;

$(document).ready(function(){

    imagepoints_worker = new Worker('scripts/gridpoints_worker.js?v=' + Math.random());
    imagepoints_worker.addEventListener('message', handleWorkerMessage, false);

    blockSizeSlider = $('#blocksize-slider');
    blockSizeSlider.slider({min: 1, max: 50, value: 10, step: .01}).bind('slide', blockSizeSliderSlide);

    holeSizeSlider = $('#holesize-slider');
    holeSizeSlider.slider({min: 1, max: 50, value: 10, step: .01}).bind('slide', holeSizeSliderSlide);

});

function gridButton() {
    points_graphics.clear();
    resetGridPoints();
    updateNextRowPoints();
}

function handleWorkerMessage(e) {

    var data = e.data;
    if (data.jobno != currentJobNo) return;

    switch (data.cmd) {

        case 'row_processed':
            drawRowPoints(data.rowPoints);
            break;
    }
}


function updateNextRowPoints() {

    blockSize = blockSizeSlider.slider('value');

    console.log('updateNextRowPoints() ' + currentRow + ', ' + currentJobNo);
    var row_data = image_canvas_ctx.getImageData(0, currentRow * blockSize, image_canvas_ctx.canvas.width, blockSize).data;

    imagepoints_worker.postMessage({
        'cmd': 'find_row_brightness',
        'jobno': currentJobNo,
        'img_data': row_data,
        'width': image_canvas_ctx.canvas.width,
        'blockSize': blockSize
    });

}




function drawRowPoints(points) {

    holes[currentRow] = new Array();

    console.log('finished row ' + currentRow);

    holeSize = holeSizeSlider.slider('value');

    var xBlocks = image_canvas_ctx.canvas.width / blockSize;

    for (var x = 0; x < xBlocks; x++) {

        var d = points[x];

        points_graphics.beginFill('#fdc');
        points_graphics.drawCircle(x * blockSize, currentRow * blockSize, d * holeSize);
        points_graphics.endStroke();

        holes[currentRow][x] = d * holeSize;
    }

    main_stage.update();

    currentRow++;

    var yBlocks = image_canvas_ctx.canvas.height / blockSize;
    if (currentRow < yBlocks) {
        updateNextRowPoints();
    }
}

function blockSizeSliderSlide() {
    points_graphics.clear();
    resetGridPoints();
    updateNextRowPoints();
}
function holeSizeSliderSlide() {
    points_graphics.clear();
    resetGridPoints();
    updateNextRowPoints();
}


function resetGridPoints() {
    currentRow = 0;
    holes = new Array();
    currentJobNo = (new Date).getTime();
}


function finalWidthSlide() {
    var cols = holes.length;
    var rows = holes[0].length;
    var blockSpacing = finalWidthSlider.slider('value') / cols;
    console.log(cols, rows);

    $('#final-width-value').val(cols * blockSpacing);
    $('#final-height-value').val(rows * blockSpacing);
}

var DEPTH_THRESHOLD = .001;
function generateGcode() {

    var gcode = "g20 g90 f60\n";
    gcode += "g00z0.125\n";

//  var coefficientOfDepth = 1.733; // 60 degree bit
    var coefficientOfDepth = 1; // 90 degree bit

    var rows = holes.length;
    var cols = holes[0].length;
    var blockSpacing = finalWidthSlider.slider('value') / cols;

    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {

            // use radius scale from visual image with physical block spacing
            var radius = holes[row][col] / blockSize * blockSpacing;

            var depth = coefficientOfDepth * radius;

            if (depth > DEPTH_THRESHOLD) {
                gcode += "g00x" + (blockSpacing * col).toPrecision(4) + "y-" + (blockSpacing * row).toPrecision(4) + "\n";
                gcode += "g01z-" + (depth).toPrecision(4) + "\n";
                gcode += "g00z0.125\n";
            }
        }
    }

//    $('#g-code').text(gcode);
    var data = "application/text;charset=utf-8," + encodeURIComponent(gcode);
    var gcode_url = "data:" + data;
//    window.open(gcode_url);

    downloadWithName(gcode_url, "imagepoints.nc");
}
