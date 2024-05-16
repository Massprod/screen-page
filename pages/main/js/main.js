// Imports
import ZoomAndDrag from './zoomDrag.js';
import GridManager from './classGridManager.js';

// Viewport + Body of the main area
let zoomableZone = document.getElementById('viewport');
let gridContainer = document.getElementById('grid');

const zoomAndDrag = new ZoomAndDrag(
  zoomableZone,
  gridContainer,
  1,
  4,
  0.1,
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  0.1,
);
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
    let height = Math.floor(heightInput.value);
    gridManager.setHeight(height);
});

widthButton.addEventListener('click', () => {
    let width = Math.floor(widthInput.value);
    gridManager.setWidth(width);
});

testAreaButton.addEventListener('click', () => {
  testAreaButton.textContent = gridManager.togglecreatingZone();
});

testSaveAreaButton.addEventListener('click', () => {
  gridManager.saveZone();
});

savedZonesDropdown.addEventListener('focus', () => {
    savedZonesDropdown.innerHTML = '';
    for (let zoneId in gridManager.screensStorage) {
        let newOption = document.createElement('option');
        newOption.text = zoneId;
        savedZonesDropdown.add(newOption);
    }
});

testRestoreZoneButton.addEventListener('click', () => {
    let chosenScreenId = savedZonesDropdown.value;
    if (chosenScreenId) {
        gridManager.restoreZone(chosenScreenId);
    }
});
