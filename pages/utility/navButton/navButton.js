import { updateMenuPosition } from '../adjustContainerPosition.js';


export default class NavigationButton {
    constructor(
        position = {
            top: 'auto',
            right: 'auto',
            bottom: 'auto',
            left: 'auto'
        },
        buttonsData,
    ) {
        this.navContainer = null;
        this.position = position;
        this.buttonsData = buttonsData;
        this.init();
    }

    init() {
        // Create hamburger button
        const navButton = document.createElement('button');
        navButton.className = 'nav-button btn btn-dark'; // Bootstrap's btn-dark class for black styling
        navButton.innerHTML = '&#9776;'; // Hamburger icon
        // Apply dynamic positioning to navButton
        navButton.style.position = 'fixed';
        navButton.style.top = this.position.top;
        navButton.style.right = this.position.right;
        navButton.style.bottom = this.position.bottom;
        navButton.style.left = this.position.left;
        // Create navigation container
        const navContainer = document.createElement('div');
        navContainer.className = 'nav-container bg-light p-3'; // Bootstrap styling
        navContainer.style.position = 'absolute'; // Make sure it's positioned relative to the button
        this.navContainer = navContainer;
        // Create navigation buttons from buttonsData
        this.buttonsData.forEach(btnInfo => {
            const button = document.createElement('button');
            button.className = btnInfo.class;
            button.textContent = btnInfo.text;
            button.onclick = () => window.location.href = btnInfo.href;
            navContainer.appendChild(button);
        });
        // Append navButton and navContainer to the body
        document.body.appendChild(navButton);
        document.body.appendChild(navContainer);
        // Toggle visibility on button click
        navButton.addEventListener('click', (event) => {
            this.toggleNavContainer(event);
        });
        // Hide navContainer when clicking outside
        window.addEventListener('pointerdown', (event) => {
            if (navButton.contains(event.target) && navContainer.contains(event.target)) {
                return;
            }
            this.hideNavContainer();
        });
    }

    toggleNavContainer(event) {
        if (this.navContainer.style.display === 'block') {
            this.hideNavContainer();
        } else {
            this.navContainer.style.display = 'block';
            updateMenuPosition(event, this.navContainer);
        }
    }

    hideNavContainer() {
        this.navContainer.style.display = 'none';
    }
}