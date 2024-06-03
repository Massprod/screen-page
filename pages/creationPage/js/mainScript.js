import BasePlatformManager from "../components/basePlatform/js/basePlatformManager.js";


document.addEventListener('DOMContentLoaded', () => {

    const topSideContainer = document.getElementsByClassName('top-half');
    const platformManager = new BasePlatformManager(topSideContainer[0]);

})