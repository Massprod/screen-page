

export default async function updateMenuPosition(event, menuElement, navigation = false) {
    if (!menuElement) {
        return;
    }
    const touch = event.targetTouches ? event.targetTouches[0] : event;

    const { clientX: mouseX, clientY: mouseY } = touch;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = menuElement.offsetWidth;
    const elementHeight = menuElement.offsetHeight;

    let positionX = mouseX + 10; // Default position
    let positionY = mouseY + 10; // Default position

    // Adjust position if the hover display goes out of the viewport horizontally
    if (positionX + elementWidth > viewportWidth) {
        positionX = mouseX - elementWidth - 10;
    }
    // Adjust position if the hover display goes out of the viewport vertically
    if (positionY + elementHeight > viewportHeight) {
        positionY = viewportHeight - elementHeight - 10; // Position it at the bottom edge
    }
    // Ensure the menu does not go above the viewport
    if (positionY < 0) {
        positionY = 10; // Provide a small offset from the top
    }

    if (positionY + elementHeight > viewportHeight- 200) {
        if (!navigation) {
            positionY = viewportHeight - elementHeight - 125;
        } else {
            positionY = viewportHeight - elementHeight - 50;
        }
    }

    menuElement.style.top = `${positionY}px`;
    menuElement.style.left = `${positionX}px`;
}
