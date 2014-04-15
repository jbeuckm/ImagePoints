/*

Worker thread does the work of analyzing the image to keep the UI thread nice.

 */
self.addEventListener('message', function(e) {

  var data = e.data;

  switch (data.cmd) {

    case 'find_row_brightness':
      findRowBrightness(data.img_data, data.width, data.blockSize, data.jobno);
      break;

    case 'stop':
      self.close(); // Terminates the worker.
      break;

    default:
      self.postMessage('Unknown command: ' + data.cmd);
  }

}, false);



function findRowBrightness(img_data, width, blockSize, jobno) {

  // an array of brightnesses for blocks in the row
  var blockBrightnesses = new Array();
  var blockPixelCounts = new Array();
  var xBlocks = Math.floor(width/blockSize);
  for (var block=0; block<xBlocks; block++) {
    blockBrightnesses[block] = 0;
    blockPixelCounts[block] = 0;
  }


  var offset = 0;

  for (var y=0; y<blockSize; y++) {
    for (var x=0; x<width; x++) {

      var pixelBrightness = 0;

      pixelBrightness += img_data[offset++]; // r
      pixelBrightness += img_data[offset++]; // g
      pixelBrightness += img_data[offset++]; // b

      blockBrightnesses[Math.floor(x/blockSize)] += pixelBrightness;
      blockPixelCounts[Math.floor(x/blockSize)] ++;

      offset++; // alpha

    }
  }

  var rowPoints = new Array();
  var divisor = 3 * 255
  for (var block=0; block<xBlocks; block++) {
    rowPoints[block] = blockBrightnesses[block] / (blockPixelCounts[block] * divisor);
  }

  self.postMessage({'cmd':'row_processed', 'rowPoints':rowPoints, 'jobno':jobno});
}


