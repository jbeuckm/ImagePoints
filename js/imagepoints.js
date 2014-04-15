var main_canvas, main_stage, image_bitmap, image_canvas, image_canvas_ctx;
var holes, points_graphics, points_shape;

var blockSizeSlider, blockSize;
var holeSizeSlider, holeSize;
var finalWidthSlider;

var currentRow, currentJobNo;
var imagepoints_worker;


$(document).ready(function(){

  main_canvas = $('#main-canvas').get(0);
  main_stage = new createjs.Stage(main_canvas);

  points_graphics = new createjs.Graphics();
  points_shape = new createjs.Shape(points_graphics);

  blockSizeSlider = $('#blocksize-slider');
  blockSizeSlider.slider({min:1, max:50, value:10, step:.01}).bind('slide', blockSizeSliderSlide);

  holeSizeSlider = $('#holesize-slider');
  holeSizeSlider.slider({min:1, max:50, value:10, step:.01}).bind('slide', holeSizeSliderSlide);

  finalWidthSlider = $('#final-width-slider');
  finalWidthSlider.slider({min:1, max:50, value:10, step:.0625}).bind('slide', finalWidthSlide);

  var showImageCheckbox = $('#show-image');
  showImageCheckbox.change(function(){
    image_bitmap.visible = $(this).is(':checked');
    main_stage.update();
  });

  imagepoints_worker = new Worker('js/imagepoints_worker.js?v='+Math.random());
  imagepoints_worker.addEventListener('message', function(e) {

    var data = e.data;
    if (data.jobno != currentJobNo) return;

    switch (data.cmd) {

      case 'row_processed':
        drawRowPoints(data.rowPoints);
        break;
    }
  }, false);

  $('#g-code-button').click(generateGcode);


  $('#go-button').click(function(){
    var url;

    if ($('#use-proxy').is(':checked')) {
      url = 'ba-simple-proxy.php?mode=native&url='+$('#image-url').val();
    }
    else {
      url = $('#image-url').val();
    }


    image_bitmap = new createjs.Bitmap(url);
//    image_bitmap.alpha = .2;

    // update stage when image data is available to display
    var img = $('#main-image').get(0);
    img.onload = function(){

      console.log('loaded image '+img.width+', '+img.height);

      var g = new createjs.Graphics();
      g.beginFill('#000');
      g.rect(0, 0, img.width, img.height);
      main_stage.addChild(new createjs.Shape(g));
      main_stage.addChild(image_bitmap);
      main_stage.addChild(points_shape);

      image_canvas = $('<canvas width="'+img.width+'" height="'+img.height+'"></canvas>');
      image_canvas_ctx = $(image_canvas).get(0).getContext("2d");
      image_canvas_ctx.drawImage(img, 0, 0);

      main_stage.update();

      reset_points();
      updateNextRowPoints();
    };
    img.src = url;

  });

});



function updateNextRowPoints() {

  blockSize = blockSizeSlider.slider('value');

  console.log('updateNextRowPoints() '+currentRow+', '+currentJobNo);
  var img_data = image_canvas_ctx.getImageData(0, currentRow*blockSize, image_canvas_ctx.canvas.width, blockSize).data;

  imagepoints_worker.postMessage({
    'cmd': 'find_row_brightness',
    'jobno': currentJobNo,
    'img_data': img_data,
    'width': image_canvas_ctx.canvas.width,
    'blockSize': blockSize
  });

}



function drawRowPoints(points) {

  holes[currentRow] = new Array();

  console.log('finished row '+currentRow);

  holeSize = holeSizeSlider.slider('value');

  var xBlocks = image_canvas_ctx.canvas.width / blockSize;

  for (var x = 0; x < xBlocks; x++) {

//    var d = 1-points[x];
    var d = points[x];

    points_graphics.beginFill('#fdc');
    points_graphics.drawCircle(x*blockSize, currentRow*blockSize, d * holeSize);
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
  reset_points();
  updateNextRowPoints();
}
function holeSizeSliderSlide() {
  reset_points();
  updateNextRowPoints();
}


function reset_points() {
  points_graphics.clear();
  currentRow = 0;
  holes = new Array();
  currentJobNo = (new Date).getTime();
}


function finalWidthSlide() {
  var cols = holes.length;
  var rows = holes[0].length;
  var blockSpacing = finalWidthSlider.slider('value') / cols;
  console.log(cols, rows);

  $('#final-width-value').val(cols*blockSpacing);
  $('#final-height-value').val(rows*blockSpacing);
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

  for (var row=0; row<rows; row++) {
    for (var col=0; col<cols; col++) {

      // use radius scale from visual image with physical block spacing
      var radius = holes[row][col] / blockSize * blockSpacing;

      var depth = coefficientOfDepth*radius;

      if (depth > DEPTH_THRESHOLD) {
        gcode += "g00x"+(blockSpacing*col).toPrecision(4)+"y-"+(blockSpacing*row).toPrecision(4)+"\n";
        gcode += "g01z-"+(depth).toPrecision(4)+"\n";
        gcode += "g00z0.125\n";
      }
    }
  }

  $('#g-code').text(gcode);
}
