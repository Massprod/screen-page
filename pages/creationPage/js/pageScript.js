import ZoomAndDrag from './zoomDrag.js';
import GridManager from './gridManager.js';
import FlashMessage from '../../utility/flashMessage.js';


document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('viewport');
  const createGridButton = document.getElementById('testBut');
  const startAreaButton = document.getElementById('testArea');
  const saveAreaButton = document.getElementById('testSaveArea');
  const restoreZoneButton = document.getElementById('testRestoreZone');
  const heightBox = document.getElementById('heightBox');
  const widthBox = document.getElementById('widthBox');
  const savedZonesDropdown = document.getElementById('savedZonesDropdown');
  const gridManager = new GridManager();
  const message = new FlashMessage();

  const assignZoom = (gridElement) => {
    const zoomer = new ZoomAndDrag(
      { 
        'zoomableZone': viewport,
        'gridContainer': gridElement,
        'maxScale': 6,
      });
    gridManager.setZoomAndDragInstance(zoomer);
  };

  const reassignGrid = (gridElement) => {
    viewport.replaceChildren([]);
    viewport.appendChild(gridElement);
  };

  createGridButton.addEventListener('click', ()=> {
    let height = parseInt(heightBox.value);
    let width = parseInt(widthBox.value);
    if (isNaN(height)) {
      height = gridManager.availableRows;
    }
    if (isNaN(width)) {
      width = gridManager.availableCols;
    };
    if (!gridManager.setHeight(height) || !gridManager.setWidth(width)) {
      const flashText = 'Height and width limited to 0 - 300.';
      message.show({ 'message': flashText })
      return;
    }
    const gridElement = gridManager.createBasicGrid(); 
    reassignGrid(gridElement);
    assignZoom(gridElement);
  });

  startAreaButton.addEventListener('click', () => {
    const isCreating = gridManager.toggleCreatingZone();
    const endText = 'End zone';
    const startText = 'Start zone';
    startAreaButton.textContent = isCreating ? startText : endText;
  });

  // Input size limitations
  const allowOnlyDigits = (inputElement) => {
    inputElement.addEventListener('input', () => {
      const value = inputElement.value;
      const regex = /^\d*$/;
  
      if (!regex.test(value)) {
        inputElement.value = value.replace(/[^\d]/g, '');
      }
    });
  };
  
  // Apply the digit-only restriction to both input fields
  allowOnlyDigits(heightBox);
  allowOnlyDigits(widthBox);
})
