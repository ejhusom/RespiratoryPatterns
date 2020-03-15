// Function for drawing graph of heart rate data in real time
// TODO: Filter peaks by distance
// TODO: Filter peaks by prominence

function drawWaves(valueArray, peaks, canvas, scale, xScale=30, adjust=0) {


  requestAnimationFrame(() => {
    canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
    canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;

    var context = canvas.getContext('2d');
    var margin = 2;
    var max = Math.max(0, Math.round(canvas.width / xScale));
    var offset = valueArray.length - max;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#00796B';

    context.beginPath();
    context.lineWidth = 3;
    context.lineJoin = 'round';

    for (var i = 0; i < Math.max(valueArray.length, max); i++) {
      var lineHeight = Math.round(valueArray[i] * canvas.height / scale);
      if (i === 0) {
        context.moveTo(xScale * i, canvas.height - lineHeight);
      } else {
        context.lineTo(adjust + xScale * i, canvas.height - lineHeight);
      }
      context.stroke();
      // var j = 0;
      // if (i = peaks[j]) {
      //     // var barHeight = Math.round(valueArray[peaks[i] + offset] * canvas.height / scale);
      //     var barHeight = canvas.height - lineHeight;
      //     context.rect(xScale * i + adjust, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
      //     context.stroke();
      //     j += 1;
      // }
    }

    for (var i = 0; i < peaks.length; i++) {
      var barHeight = Math.round(valueArray[peaks[i]] * canvas.height / scale);
      context.rect(xScale * peaks[i] + adjust, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
      context.stroke();
    }
  });
}

window.onresize = drawWaves;

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    drawWaves();
  }
});


