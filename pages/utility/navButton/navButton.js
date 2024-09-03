import { AUTH_COOKIE_NAME, loginPage, USER_ROLE_COOKIE_NAME } from '../../uniConstants.js';
import updateMenuPosition from '../adjustContainerPosition.js';
import { deleteCookie } from '../roleCookies.js';


export default class NavigationButton {
    constructor(
        position = {
            top: 'auto',
            right: 'auto',
            bottom: 'auto',
            left: 'auto'
        },
        buttonsData,
        clearCookies,
    ) {
        this.navContainer = null;
        this.position = position;
        this.buttonsData = buttonsData;
        this.clearCookies = clearCookies;
        this.init();
    }

    init() {
        // Create hamburger button
        const navButton = document.createElement('button');
        navButton.className = 'nav-button'; // Use your custom class
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
        navContainer.style.position = 'absolute'; // Positioned relative to the button
        navContainer.style.display = 'none';
        this.navContainer = navContainer;

        // Create navigation buttons from buttonsData
        for ( let btnInfo of this.buttonsData) {
            const button = document.createElement('button');
            button.className = btnInfo.class;
            button.textContent = btnInfo.text;
            button.onclick = () => {
                if (window.location.href !== btnInfo.href) {
                    if (btnInfo.href === loginPage) {
                        this.clearCookies.forEach( (cookieName) => {
                            deleteCookie(cookieName);
                        })
                    }
                    window.location.href = btnInfo.href;
                }
            };
            navContainer.appendChild(button);
        }

        // Append navButton and navContainer to the body
        document.body.appendChild(navButton);
        document.body.appendChild(navContainer);

        // Toggle visibility on button click
        navButton.addEventListener('click', (event) => {
            this.toggleNavContainer(event);
        });

        // Hide navContainer when clicking outside
        window.addEventListener('click', (event) => {
            if (navButton.contains(event.target) || navContainer.contains(event.target)) {
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