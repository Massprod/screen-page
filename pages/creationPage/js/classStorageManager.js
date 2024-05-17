export default class StorageManager {
  constructor() {
    this.screensStorage = {};
  }

  save(gridManager) {
    const screenIdentifier = new Date().toISOString();
    const screenData = {
      screenId: screenIdentifier,
      screenRows: gridManager.screenMatrix.length,
      screenColumns: gridManager.screenMatrix[0].length,
      screenTiles: JSON.parse(JSON.stringify(gridManager.allTiles)),
      screenZones: JSON.parse(JSON.stringify(gridManager.allZones)),
    };
    this.screensStorage[screenIdentifier] = JSON.parse(JSON.stringify(screenData));
    return screenData;
  }

  get(screenId) {
    return JSON.parse(JSON.stringify(this.screensStorage[screenId]));
  }

  getAll() {
    return JSON.parse(JSON.stringify(this.screensStorage));
  }
}
