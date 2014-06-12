var main_canvas, main_stage, image_bitmap, image_canvas, image_canvas_ctx;
var image_data;


$(document).ready(function () {

    main_canvas = $('#main-canvas').get(0);
    main_stage = new createjs.Stage(main_canvas);

    points_graphics = new createjs.Graphics();
    points_shape = new createjs.Shape(points_graphics);

    blockSizeSlider = $('#blocksize-slider');
    blockSizeSlider.slider({min: 1, max: 50, value: 10, step: .01}).bind('slide', blockSizeSliderSlide);

    holeSizeSlider = $('#holesize-slider');
    holeSizeSlider.slider({min: 1, max: 50, value: 10, step: .01}).bind('slide', holeSizeSliderSlide);

    finalWidthSlider = $('#final-width-slider');
    finalWidthSlider.slider({min: 1, max: 50, value: 10, step: .0625}).bind('slide', finalWidthSlide);

    var showImageCheckbox = $('#show-image');
    showImageCheckbox.change(function () {
        image_bitmap.visible = $(this).is(':checked');
        main_stage.update();
    });

    imagepoints_worker = new Worker('scripts/gridpoints_worker.js?v=' + Math.random());
    imagepoints_worker.addEventListener('message', handleWorkerMessage, false);

    $('#load-image-button').click(loadImage);
    $('#g-code-button').click(generateGcode);

    $('#grid-button').click(gridButton);
    $('#disc-button').click(startFindingDiscPoints);
});


function loadImage() {
    var url;

    if ($('#use-proxy').is(':checked')) {
        url = 'ba-simple-proxy.php?mode=native&url=' + $('#image-url').val();
    }
    else {
        url = $('#image-url').val();
    }

    image_bitmap = new createjs.Bitmap(url);

    // update stage when image data is available to display
    var img = $('#main-image').get(0);
    img.onload = handleImageLoaded;
    img.src = url;
}


function handleImageLoaded() {

    var img = this;

    console.log('loaded image ' + img.width + ', ' + img.height);

    var g = new createjs.Graphics();
    g.beginFill('#000');
    g.rect(0, 0, img.width, img.height);
    main_stage.addChild(new createjs.Shape(g));
    main_stage.addChild(image_bitmap);
    main_stage.addChild(points_shape);

    image_canvas = $('<canvas width="' + img.width + '" height="' + img.height + '"></canvas>');
    image_canvas_ctx = $(image_canvas).get(0).getContext("2d");
    image_canvas_ctx.drawImage(img, 0, 0);

    image_data = image_canvas_ctx.getImageData(0, 0, img.width, img.height).data;

    main_stage.update();
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
function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}
