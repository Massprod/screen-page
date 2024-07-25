import BasePlatformManager from "./components/basePlatform/basePlatform.js";
import ZoomAndDrag from "../../utility/zoomDrag.js";
import { BASIC_PRESET_NAMES, TEST_PLATFORM_GRID_NAME } from "./constants.js";

let platformManager = null;

document.addEventListener('DOMContentLoaded', async () => {
    const platformsContainer = document.getElementById("platformsContainer");
    const platformPresetName = BASIC_PRESET_NAMES.PMK_PLATFORM;
    platformManager = new BasePlatformManager(
        platformsContainer
    );
    await platformManager.updatePreset(platformPresetName);
    platformManager.buildPlatform();
    platformManager.platformName = TEST_PLATFORM_GRID_NAME;
    platformManager.updatePlatformCells();
})
