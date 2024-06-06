export default class HoverDisplayManager {
    constructor(
      hoverClass,
      displayClass,
    ) {
      this.hoverClass = hoverClass;
      this.displayClass = displayClass;
      this.element = document.createElement('div');
      this.element.className = displayClass;
      document.body.appendChild(this.element);
    }
  
    showHoverDisplay(event) {
      const target = event.target;
      if (target.classList.contains(this.hoverClass)) {
        this.element.style.display = 'block';
        this.updateHoverDisplayPosition(event);
      }
    }
  
    hideHoverDisplay(event) {
      const target = event.target;
      if (target.classList.contains(this.hoverClass)) {
        this.element.style.display = 'none';
      }
    }
  
    updateHoverDisplayPosition(event) {
        if (this.element.style.display === 'block') {
            const { clientX: mouseX, clientY: mouseY } = event;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const elementWidth = this.element.offsetWidth;
            const elementHeight = this.element.offsetHeight;
        
            let positionX = mouseX + 10; // Default position
            let positionY = mouseY + 10; // Default position
        
            // Adjust position if the hover display goes out of the viewport
            if (positionX + elementWidth > viewportWidth) {
                positionX = mouseX - elementWidth - 10;
            }
            if (positionY + elementHeight > viewportHeight) {
                positionY = mouseY - elementHeight - 10;
            }
        
            this.element.style.top = `${positionY}px`;
            this.element.style.left = `${positionX}px`;
            }
        
    }
  }
  