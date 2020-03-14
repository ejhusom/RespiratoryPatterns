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
var airflowValues = [];
var maxRibVal = 0;
var minRibVal = 4096;
var minAirVal = 0.1;
var maxAirVal = 0.0;
var ribcageCanvas = document.querySelector('#ribcageChart');
var respiratoryRateText = document.querySelector('#respiratoryRateText');

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

        if (v > maxRibVal) {
            maxRibVal = v;
        }
        if (v < minRibVal) {
            minRibVal = v;
        }

        ribcageValues.push(int16View[i]);
    }
    
    let ribcageRange = maxRibVal - minRibVal;
    var ribcagePlotValues = ribcageValues.map(function(element) {
        return (element - minRibVal)/ribcageRange;
    });

    // Smoothing data
    var ribcageValuesSmooth = [];
    var n = 5; // amount of smoothing
    for (var i = 1; i < ribcagePlotValues.length - 1; i++) {
        var mean = ribcagePlotValues.slice(i-n,i+2).reduce((a, b) => a + b, 0)/(2*n+1);
        ribcageValuesSmooth.push(mean);
    }

    peaks = findPeaks(ribcageValuesSmooth);
    var maxTime = 450;

    if (ribcagePlotValues.length > maxTime) {
        ribcageValues.splice(0, 7);
        var respiratoryRate = 600*peaks.length/maxTime;
        respiratoryRateText.innerHTML = "Respiratory rate: " + respiratoryRate.toFixed(1);
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
