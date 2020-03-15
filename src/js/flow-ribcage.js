/* 
Web bluetooth api script for BreathZpot sensors. 
Adapted from the following source: https://googlechrome.github.io/samples/web-bluetooth/notifications-async-await.html

Copyright 2019 Eigil Aandahl

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var flowRibcageCharacteristic;
var ribcageValues = [];
// var maxRibVal = 0;
// var minRibVal = 4096;
var ribcageCanvas = document.querySelector('#ribcageChart');
var respiratoryRateText = document.querySelector('#respiratoryRateText');
var smoothingSlider = document.getElementById("smoothingSlider");
var smoothingDiv = document.getElementById("smoothingValue")
var prominenceSlider = document.getElementById("prominenceSlider");
var prominenceDiv = document.getElementById("prominenceValue")
var distanceSlider = document.getElementById("distanceSlider");
var distanceDiv = document.getElementById("distanceValue")
var s = 5; // smooting
var p = 0.05; // prominence
var d = 5; // distance

smoothingSlider.onchange = function() {
    smoothingDiv.innerHTML = this.value;
    s = this.value;
}
prominenceSlider.onchange = function() {
    prominenceDiv.innerHTML = this.value;
    p = this.value;
}
distanceSlider.onchange = function() {
    distanceDiv.innerHTML = this.value;
    d = this.value;
}

async function onFlowRibcageButtonClick() {

    let serviceUuid = 0xffb0; // BreathZpot breathing service
    serviceUuid = parseInt(serviceUuid);

    let characteristicUuid = 0xffb3; // BreathZpot breathing characteristic
    characteristicUuid = parseInt(characteristicUuid);

    try {
        console.log('Requesting Bluetooth Device...');
        const device = await navigator.bluetooth.requestDevice({
            filters: [{services: [serviceUuid]}]});

        console.log('Connecting to GATT Server...');
        const server = await device.gatt.connect();

        console.log('Getting Service...');
        const service = await server.getPrimaryService(serviceUuid);

        console.log('Getting Characteristic...');
        flowRibcageCharacteristic = await service.getCharacteristic(characteristicUuid);

        await flowRibcageCharacteristic.startNotifications();

        console.log('> Notifications started');
        flowRibcageCharacteristic.addEventListener('characteristicvaluechanged',
            handleFlowRibcageNotifications);

    
    } catch(error) {
        console.log('Argh! ' + error);
    }

}

async function onStopFlowRibcageClick() {
  if (flowRibcageCharacteristic) {
    try {
      await flowRibcageCharacteristic.stopNotifications();
      console.log('> Notifications stopped');
      flowRibcageCharacteristic.removeEventListener('characteristicvaluechanged',
          handleFlowRibcageNotifications);
    } catch(error) {
      console.log('Argh! ' + error);
    }
  }
}

function handleFlowRibcageNotifications(event) {
    let value = event.target.value;
    let id = event.target.service.device.id;
    let int16View = new Int16Array(value.buffer);
    let timestamp = new Date().getTime();
    // TextDecoder to process raw data bytes.
    for (let i = 0; i < 7; i++) {

        let v = int16View[i];

        // if (v > maxRibVal) {
        //     maxRibVal = v;
        // }
        // if (v < minRibVal) {
        //     minRibVal = v;
        // }

        ribcageValues.push(int16View[i]);
    }
    
    // Normalize data
    var minRibVal = Math.min.apply(null, ribcageValues);
    var maxRibVal = Math.max.apply(null, ribcageValues);
    let ribcageRange = maxRibVal - minRibVal;
    var ribcageValuesNorm = ribcageValues.map(function(element) {
        return (element - minRibVal)/ribcageRange;
    });

    // Smoothing data
    var ribcageValuesSmooth = [];
    for (var i = 1; i < ribcageValuesNorm.length - 1; i++) {
        var mean = ribcageValuesNorm.slice(i-s,i+2).reduce((a, b) => a + b, 0)/(2*s+1);
        ribcageValuesSmooth.push(mean);
    }


    // Find peaks in data
    var peaks = findPeaks(ribcageValuesSmooth);
    peaks = selectByPeakProminence(ribcageValuesSmooth, peaks, 5, p);
    // var priority = [];
    // for (var i = 0; i < peaks.length; i++) {
    //     priority.push(ribcageValuesSmooth[peaks[i]]);
    // }
    // peaks = selectByPeakDistance(peaks, priority, d);
    
    // Plot and display data
    var maxTime = 450;
    if (ribcageValues.length > maxTime) {
        ribcageValues.splice(0, 7);
        var respiratoryRate = 600*peaks.length/maxTime;
        respiratoryRateText.innerHTML = "Respiratory rate: " + respiratoryRate.toFixed(1) + " breaths/minute.";
    }
    drawWaves(ribcageValuesSmooth, peaks, ribcageCanvas, 1, 6.0);
}

function findPeaks(x) {

    var midpoints = [];
    var left_edges = [];
    var right_edges = [];

    var i = 1;
    while (i < x.length - 1) {
        if (x[i-1] < x[i]) {
            var i_ahead = i + 1;

            while (i_ahead < x.length - 1 && x[i_ahead] == x[i]) {
                i_ahead += 1;
            }

            if (x[i_ahead] < x[i]) {
                left_edges.push(i);
                right_edges.push(i_ahead - 1);
                midpoints.push(Math.floor((i + i_ahead - 1)/2));
                i = i_ahead;
            }
        }
        i += 1;
    }
    
    return midpoints;
}

function selectByPeakProminence(x, peaks, wlen, prominence) {

    var prominences = [];
    var left_bases = [];
    var right_bases = [];

    for (var i = 0; i < peaks.length; i++) {
        prominences.push(0);    
        left_bases.push(0);    
        right_bases.push(0);    
    }
    
    for (var peak_nr = 0; peak_nr < peaks.length; peak_nr++) {
        var peak = peaks[peak_nr];
        var i_min = 0;
        var i_max = x.length - 1;

        if (2 <= wlen) {
            i_min = Math.max((peak - wlen / 2).toFixed(0), i_min); 
            i_max = Math.min((peak + wlen / 2).toFixed(0), i_max); 
        }

        var i = peak;
        left_bases[peak_nr] = peak;
        var left_min = x[peak];
        while (i_min <= i && x[i] <= x[peak]) {
            if (x[i] < left_min) {
                left_min = x[i];
                left_bases[peak_nr] = i;
            }
            i = i - 1;
        }

        i = peak;
        right_bases[peak_nr] = peak;
        var right_min = x[peak];
        while (i <= i_max && x[i] <= x[peak]) {
            if (x[i] < right_min) {
                right_min = x[i];
                right_bases[peak_nr] = i;
            }
            i = i + 1;
        }

        prominences[peak_nr] = x[peak] - Math.max(left_min, right_min);

        if (prominences[peak_nr] == 0) {
            console.log("Some peaks have prominence of 0.");
        }

    }


    var result = [];

    for (var i = 0; i < peaks.length; i++) {
        if (prominences[i] >= p) {
            result.push(peaks[i]);
        }
    }

    return result;
    
}

function selectByPeakDistance(peaks, priority, distance) {

    var keep = [];
    for (var i = 0; i < peaks.length; i++) {
        keep.push(1);
    }

    var priority_to_position = argSort(priority);

    for (var i = peaks.length-1; i > -1; i--) {
        var j = priority_to_position[i];

        if (keep[j] == 0) {
            continue;
        }

        var k = j - 1;

        while (0 <= k && (peaks[k] - peaks[j]) < distance) {
            keep[k] = 0;
            k = k + 1; 
        }

        k = j + 1;

        while (k < peaks.length && peaks[k] - peaks[j] < distance) {
            keep[k] = 0;
            k = k + 1;
        }
        
    }

    var result = [];

    for (var i = 0; i < peaks.length; i++) {
        if (keep[i] == 1) {
            result.push(peaks[i]);
        }
    }

    return result;
}


function argSort(x) {
    
    var indeces = []

    for (var i = 0; i < x.length; i++) {
        indeces.push(i);
    }

    const result = indeces
      .map((item, index) => [x[index], item]) // add the x to sort by
      .sort(([count1], [count2]) => count1 - count2) // sort by the x data
      .map(([, item]) => item); // extract the sorted items
  
    return result;
}

function indexOfMin(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var min = arr[0];
    var minIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }

    return minIndex;
}
