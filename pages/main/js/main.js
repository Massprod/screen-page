
// main.js

import ZoomAndDrag from './zoomDrag.js';


let zoomableZone = document.getElementById('viewport');
let gridContainer = document.getElementById('grid');

let zoomAndDrag = new ZoomAndDrag(zoomableZone, gridContainer)

let createButton = document.getElementById('testBut');
let heightButton = document.getElementById('heightButton');
let widthButton = document.getElementById('widthButton');
let heightInput = document.getElementById('heightBox');
let widthInput = document.getElementById('widthBox');
let testAreaButton = document.getElementById('testArea');
let testSaveAreaButton = document.getElementById('testSaveArea');
let savedZonesDropdown = document.getElementById('savedZonesDropdown');
let testRestoreZoneButton = document.getElementById('testRestoreZone');
// base sizes
// 1 tile == 0.5m , 10px == 0.5m
let baseTileHeight = 10;
let baseTileWidth = 10;
// rows cols
let availableRows = 30;
let availableCols = 50;
let zoneMatrix = [];  // Currently shown blueprint of the whole Zone
let zoneStorage = {};
let allTiles = {};  // all ID's of the created tile to get them in O(1) from `zoneMatrix`
let currentArea = [];  // [[coordY, coordX]] for every currently marked tile
let allAreas = {}
let areaId = 0;
// area creation
let defaultTileColor = '#00ffdd';
let creatingArea = false;
let usedColors = {defaultTileColor: true};  // All used colors to mark some areas
let currentColor = '';
let firstTileOfArea = true;


// Bonus
function isEmptyObject( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
}


function getHex(rgb) {
    // This regex matches numbers in the RGB string
    let rgbValues = rgb.match(/\d+/g); // ["255", "0", "0"]
    let hex = rgbValues.map((num) => {
        // Convert each number to a hexadecimal string
        let hex = parseInt(num).toString(16);
        // Pad with zero if necessary
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');

    return hex; // Combine into a full hex code
}
//



function correctNeighbours(tileId) {
    var tileY = allTiles[tileId][0];
    var tileX = allTiles[tileId][1];
    // clockwise from 0 -> 12
    var options = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
    var maxY = zoneMatrix.length;
    var maxX = zoneMatrix[tileY].length;
    for (let index = 0; index < options.length; index += 1) {
        var newCoords = [tileY + options[index][0], tileX + options[index][1]];
        console.log(newCoords);
        if ((0 <= newCoords[0] && maxY > newCoords[0]) && (0 <= newCoords[1] && maxX > newCoords[1])) {
            var neighbour = zoneMatrix[newCoords[0]][newCoords[1]];
            var neighbourColor = window.getComputedStyle(neighbour).backgroundColor;
            if (getHex(neighbourColor) === currentColor) {
                return true;
            }
        }
    }
    return false;
}


function clickOfTheTile(event) {
    if (creatingArea) {
        if (firstTileOfArea || correctNeighbours(event.target.id)) {
            event.target.style.backgroundColor = `#${currentColor}`;
            var tileY = allTiles[event.target.id][0];
            var tileX = allTiles[event.target.id][1];
            currentArea.push([tileY, tileX])
            firstTileOfArea = false;
        }
    }
}


function createArea() {
    allAreas[areaId] = currentArea;
    areaId += 1;
    currentArea = [];
}


function saveZone() {
    var zoneIdentifier = new Date();
    let zoneData = {
        'zoneId': zoneIdentifier,
        'zoneMatrix': zoneMatrix,
        'zoneAreas': allAreas,
    };
    return zoneData;
}


function restoreZone(zoneId) {
    gridContainer.replaceChildren([]);
    var zoneMatrix = zoneStorage[zoneId]['zoneMatrix'];
    console.log(zoneMatrix);
    var zoneRows = zoneMatrix.length;
    for (row = 0; row < zoneRows; row += 1) {
        var rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        gridContainer.appendChild(rowDiv);
        console.log(zoneMatrix[row].length);
        for (col = 0; col < zoneMatrix[row].length; col += 1) {
            rowDiv.appendChild(zoneMatrix[row][col]);
        }
    }
    
}


function fillTheGrid() {
    // clear previous
    gridContainer.replaceChildren([]);
    zoneMatrix = [];
    var curId = 0;
    for (let row = 0; row < availableRows; row += 1) {
        let rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        gridContainer.appendChild(rowDiv);
        let curRow = [];
        for (let column = 0; column < availableCols; column += 1) {
            let newTile = document.createElement('div');
            newTile.className = "tile";
            newTile.id = `${curId}`;
            rowDiv.appendChild(newTile);
            curRow.push(newTile);
            newTile.addEventListener(`click`, clickOfTheTile);
            allTiles[curId] = [row, column];
            curId += 1;
        }
        zoneMatrix.push(curRow);
    }
}


// Rest of your main script logic
createButton.addEventListener('click', (event) => {
    fillTheGrid();
});

heightButton.addEventListener('click', (event) => {
    let height = Math.floor(heightInput.value) * 2;
    availableRows = height;
});

widthButton.addEventListener('click', (event) => {
    let width = Math.floor(widthInput.value) * 2;
    availableCols = width;
});

testAreaButton.addEventListener('click', (event) => {
    if (creatingArea) {
        if (0 !== currentArea.length){
            createArea();
        }
        creatingArea = false;
        testAreaButton.textContent = 'Start new area';
        return;
    }
    currentColor = Math.floor(Math.random()*16777215).toString(16);
    while (currentColor in usedColors) {
        currentColor = Math.floor(Math.random()*16777215).toString(16);
    }
    creatingArea = true;
    firstTileOfArea = true;
    testAreaButton.textContent = 'Create area';
});

testSaveAreaButton.addEventListener('click', (event) => {
    let data = saveZone();
    if (!isEmptyObject(data['zoneAreas'])){
        zoneStorage[data['zoneId']] = {
            'zoneMatrix': data['zoneMatrix'],
            'zoneAreas': data['zoneAreas'],
        }
    }
});

savedZonesDropdown.addEventListener('focus', (event) => {
    savedZonesDropdown.innerHTML = '';
    for (zone in zoneStorage) {
        var newOption = document.createElement('option');
        newOption.text = zone;
        savedZonesDropdown.add(newOption);
        console.log('filling');
    }
});

testRestoreZoneButton.addEventListener('click', (event) => {
    var chosenZoneId = savedZonesDropdown.value;
    console.log(zoneStorage[chosenZoneId]);
    if ('' !== chosenZoneId) {
        console.log(chosenZoneId);
        console.log(zoneStorage[chosenZoneId]);
        restoreZone(chosenZoneId)
    }
});
