export default class ContextMenuManager {
  constructor({ contextMenuClass = 'context-menu', wheelDetailsMenuClass = 'context-menu' } = {}) {
    this.contextMenu = document.createElement('div');
    this.contextMenu.className = contextMenuClass;
    this.contextMenu.style.display = 'none';
    document.body.appendChild(this.contextMenu);

    this.wheelDetailsMenu = document.createElement('div');
    this.wheelDetailsMenu.className = wheelDetailsMenuClass;
    this.wheelDetailsMenu.style.display = 'none';
    document.body.appendChild(this.wheelDetailsMenu);

    this.hideContextMenu = this.hideContextMenu.bind(this);
    this.hideWheelDetails = this.hideWheelDetails.bind(this);

    document.addEventListener('click', (event) => {
      if (!this.contextMenu.contains(event.target) && !this.wheelDetailsMenu.contains(event.target)) {
        this.hideContextMenu();
      }
      if (event.target.className !== `context-menu-option` && !this.wheelDetailsMenu.contains(event.target)) {
        this.hideWheelDetails();
      }
    });
  }

  showContextMenu(event, wheelStack) {
    event.preventDefault();
    this.populateContextMenu(wheelStack);
    const { clientX: mouseX, clientY: mouseY } = event;
    this.contextMenu.style.top = `${mouseY}px`;
    this.contextMenu.style.left = `${mouseX}px`;
    this.contextMenu.style.display = 'block';
    this.adjustMenuPosition(this.contextMenu, mouseX, mouseY);
  }

  adjustMenuPosition(menu, mouseX, mouseY) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    let positionX = mouseX;
    let positionY = mouseY;

    if (mouseX + menuWidth > viewportWidth) {
      positionX = viewportWidth - menuWidth;
    }
    if (mouseY + menuHeight > viewportHeight) {
      positionY = viewportHeight - menuHeight;
    }

    menu.style.top = `${positionY}px`;
    menu.style.left = `${positionX}px`;
  }

  populateContextMenu(wheelStack) {
    this.contextMenu.innerHTML = ''; // Clear existing menu items

    // Add a button to add a new wheel if the stack is not full
    if (wheelStack.takenPositions < wheelStack.stackSize) {
      const addButton = document.createElement('button');
      addButton.textContent = 'Add Wheel';
      addButton.className = 'context-menu-add-button';
      addButton.onclick = () => {
        this.addWheelToStack(wheelStack);
      };
      this.contextMenu.appendChild(addButton);
    }

    // Add buttons for existing wheels
    Object.keys(wheelStack.stackData).forEach((position) => {
      const wheel = wheelStack.stackData[position];
      const wheelButton = document.createElement('button');
      wheelButton.textContent = `ID: ${wheel.wheelId || 'Empty'}`;
      wheelButton.className = 'context-menu-option';
      wheelButton.addEventListener('click', (event) => {
        this.showWheelDetails(event, wheel);
      });
      this.contextMenu.appendChild(wheelButton);
    });
  }

  addWheelToStack(wheelStack) {
    // Implement the logic to add a new wheel to the stack
    console.log('Adding new wheel to', wheelStack);
    // Hide the context menu
    this.contextMenu.style.display = 'none';
  }

  showWheelDetails(event, wheel) {
    event.preventDefault();
    this.wheelDetailsMenu.innerHTML = ''; // Clear existing menu items

    const details = document.createElement('div');
    details.innerHTML = `
      <div>ID: ${wheel.wheelId}</div>
      <div>Size: ${wheel.wheelSize}</div>
      <div>Batch: ${wheel.wheelBatch}</div>
      <button class="context-menu-option" id="extraActionButton">Extra Action</button>
    `;
    this.wheelDetailsMenu.appendChild(details);

    this.adjustMenuPosition(this.wheelDetailsMenu, event.clientX, event.clientY);
    this.wheelDetailsMenu.style.display = 'block';

    // Add event listener for the extra action button
    document.getElementById('extraActionButton').addEventListener('click', () => {
      this.extraAction(wheel);
    });
  }

  extraAction(wheel) {
    console.log('Extra action for', wheel);
    // Implement the extra action logic here
  }

  hideWheelDetails() {
    this.wheelDetailsMenu.style.display = 'none';
  }

  hideContextMenu() {
    this.contextMenu.style.display = 'none';
    this.hideWheelDetails();
  }
}
