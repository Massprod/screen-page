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
        navButton.title = 'Меню навигации';
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
        navContainer.className = 'nav-menu';
        navContainer.style.position = 'absolute';
        this.navContainer = navContainer;
        const navigationList = document.createElement('ul');
        navContainer.appendChild(navigationList);

        // Create navigation buttons from buttonsData
        for ( let btnInfo of this.buttonsData) {
            let navItem = document.createElement('li');
            navItem.title = btnInfo.title;
            const anchorLink = document.createElement('a');
            anchorLink.className = btnInfo.class;
            anchorLink.textContent = btnInfo.text;
            anchorLink.href = btnInfo.href;
            anchorLink.id = btnInfo.id;
            navItem.onclick = (event) => {
                if (window.location.href !== btnInfo.href) {
                    if (btnInfo.href === loginPage) {
                        this.clearCookies.forEach( (cookieName) => {
                            deleteCookie(cookieName);
                        })
                    }
                    if (event.ctrlKey || event.metaKey) {
                        // Ctrl+Click (or Cmd+Click on macOS) - open in a new tab
                        window.open(btnInfo.href, '_blank');
                        return;
                    }
                    window.location.href = btnInfo.href;
                }
            };
            navItem.appendChild(anchorLink);
            navigationList.appendChild(navItem);
        }

        // Append navButton and navContainer to the body
        document.body.appendChild(navButton);
        document.body.appendChild(navContainer);

        // Toggle visibility on button click
        navButton.addEventListener('click', (event) => {
            this.toggleNavContainer(event);
        });

        // Hide navContainer when clicking outside
        window.addEventListener('mousedown', (event) => {
            if (navButton.contains(event.target) || navContainer.contains(event.target)) {
                return;
            }
            this.hideNavContainer();
        });
    }

    toggleNavContainer(event) {
        if (this.navContainer.classList.contains('show')) {
            this.hideNavContainer();
        } else {
            this.navContainer.classList.remove('hide');
            this.navContainer.classList.add('show');
            updateMenuPosition(event, this.navContainer, true);
        }
    }

    hideNavContainer() {
        this.navContainer.classList.add('hide')
        setTimeout( () => {
            this.navContainer.classList.remove('show');
        }, 500);
    }
}