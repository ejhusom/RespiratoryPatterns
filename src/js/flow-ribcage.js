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
    // ribcageText.innerHTML = "Ribcage movement: " + int16View[0].toString();
    
    let ribcageRange = maxRibVal - minRibVal;
    var ribcagePlotValues = ribcageValues.map(function(element) {
        return (element - minRibVal)/ribcageRange;
    });

    // Smoothing data
    var ribcageValuesSmooth = [];
    var n = 5;
    for (var i = 1; i < ribcagePlotValues.length - 1; i++) {
        // var mean = (ribcagePlotValues[i] + ribcagePlotValues[i-1] + ribcagePlotValues[i+1])/3.0;
        var mean = ribcagePlotValues.slice(i-n,i+2).reduce((a, b) => a + b, 0)/(2*n+1);
        ribcageValuesSmooth.push(mean);
    }

    if (ribcagePlotValues.length > 455) {
        ribcageValues.splice(0, 7);
    }
    drawWaves(ribcagePlotValues, ribcageCanvas, 1, 6.0);
    drawWaves(ribcageValuesSmooth, ribcageCanvas, 1, 6.0);

}

