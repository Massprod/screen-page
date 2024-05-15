// Imports
import ZoomAndDrag from './zoomDrag.js';
import GridManager from './classGridManager.js';

// Viewport + Body of the main area
let zoomableZone = document.getElementById('viewport');
let gridContainer = document.getElementById('grid');
const zoomAndDrag = new ZoomAndDrag(zoomableZone, gridContainer);
// Initialize GridManager
const gridManager = new GridManager(gridContainer, 10, 10, 30, 30, '#00ffdd');
// DOM elements
let createButton = document.getElementById('testBut');
let heightButton = document.getElementById('heightButton');
let widthButton = document.getElementById('widthButton');
let heightInput = document.getElementById('heightBox');
let widthInput = document.getElementById('widthBox');
let testAreaButton = document.getElementById('testArea');
let testSaveAreaButton = document.getElementById('testSaveArea');
let savedZonesDropdown = document.getElementById('savedZonesDropdown');
let testRestoreZoneButton = document.getElementById('testRestoreZone');
// Event listeners
createButton.addEventListener('click', () => gridManager.fillTheGrid());

heightButton.addEventListener('click', () => {
    let height = Math.floor(heightInput.value) * 2;
    gridManager.setHeight(height);
});

widthButton.addEventListener('click', () => {
    let width = Math.floor(widthInput.value) * 2;
    gridManager.setWidth(width);
});

testAreaButton.addEventListener('click', () => {
  testAreaButton.textContent = gridManager.toggleCreatingArea();
});

testSaveAreaButton.addEventListener('click', () => {
  let data = gridManager.saveZone();
  if (!gridManager.isEmptyObject(data.zoneAreas)) {
      gridManager.zoneStorage[data.zoneId] = {
          'zoneMatrix': data.zoneMatrix,
          'zoneAreas': data.zoneAreas
      };
  }
});

savedZonesDropdown.addEventListener('focus', () => {
    savedZonesDropdown.innerHTML = '';
    for (let zone in gridManager.zoneStorage) {
        let newOption = document.createElement('option');
        newOption.text = zone;
        savedZonesDropdown.add(newOption);
    }
});

testRestoreZoneButton.addEventListener('click', () => {
    let chosenZoneId = savedZonesDropdown.value;
    if (chosenZoneId) {
        gridManager.restoreZone(chosenZoneId);
    }
});
