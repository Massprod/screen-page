

export default class FocusMark{
    constructor(
        focusClass = 'focus-target',
        focusScale = 1,
    ) {
        this.focusClass = focusClass;
        this.basicScale = focusScale;
        this.focusElement = null; 
    }
    
    higlightElement(element, highlightTime = 5000) {
        if (!element) {
            return;
        }
        if (this.focusElement) {
            this.clearHighlight(this.focusElement);
        }
        this.focusElement = element;
        element.classList.add(this.focusClass);
        setTimeout(() => {
            if (element.classList.contains(this.focusClass)) {
                element.classList.remove(this.focusClass);
            }
        }, highlightTime);
    }

    clearHighlight(element) {
        element.classList.remove(this.focusClass);
    }

    // Function to get the current translate values (x, y)
    getTranslateValues(element) {
        const style = window.getComputedStyle(element);
        const matrix = new WebKitCSSMatrix(style.transform);

        // Extract translateX and translateY from the matrix
        return {
            x: matrix.m41,  // translateX
            y: matrix.m42,   // translateY
            scale: matrix.a // scaleX (assuming uniform scaling, matrix.a = matrix.d)
        };
    }

    // Function to update the translation and scale using transform
    #updateTranslationAndScale(element, offsetX, offsetY, highlightTimeout) {
        const currentTranslation = this.getTranslateValues(element);
        
        // Update the translation by adding the offsets
        const newX = currentTranslation.x + offsetX;
        const newY = currentTranslation.y + offsetY;
        const newScale = currentTranslation.scale ? currentTranslation.scale : this.basicScale;

        // Apply the updated translation and scale
        element.style.transform = `translate(${newX}px, ${newY}px) scale(${newScale})`;
        this.higlightElement(this.focusElement, highlightTimeout);
        return {
            newX: newX,
            newY: newY,
            newScale: newScale,
        }
    }

    // Example usage
    centerElementInContainer(innerContainer, parentContainer, targetElement, highlightTimeout = 5000) {
        if (!targetElement) {
            console.warn('`targetElement` cant be empty');
            return;
        }
        if (this.focusElement) {
            this.clearHighlight(this.focusElement);
        }
        this.focusElement = targetElement;
        const targetRect = targetElement.getBoundingClientRect();
        const parentRect = parentContainer.getBoundingClientRect();

        // Get the center of the target element
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        // Get the center of the parent container
        const parentCenterX = parentRect.width / 2;
        const parentCenterY = parentRect.height / 2;

        // Calculate how much to move the inner container to center the target element
        const offsetX = parentCenterX - (targetCenterX - parentRect.left);
        const offsetY = parentCenterY - (targetCenterY - parentRect.top);

        // Apply the new translation using the transform property
        return this.#updateTranslationAndScale(innerContainer, offsetX, offsetY, highlightTimeout);
    }
}
