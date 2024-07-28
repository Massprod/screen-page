class FlashMessage {
  constructor() {
    if (FlashMessage.instance) {
      return FlashMessage.instance;
    }

    this.flashMessagesContainer = document.createElement('div');
    this.flashMessagesContainer.classList.add('flash-messages-container');
    document.body.appendChild(this.flashMessagesContainer);
    FlashMessage.instance = this;
  }

  show({
    message,
    color = 'midnightblue',
    backgroundColor = 'whitesmoke',
    fontSize = '16px',
    fontFamily = 'Arial, sans-serif',
    duration = 3000
  }) {
    const flashMessage = document.createElement('div');
    flashMessage.classList.add('flash-message');
    flashMessage.style.color = color;
    flashMessage.style.backgroundColor = backgroundColor;
    flashMessage.style.fontSize = fontSize;
    flashMessage.style.fontFamily = fontFamily;
    flashMessage.textContent = message;

    this.flashMessagesContainer.appendChild(flashMessage);

    // Show the message
    setTimeout(() => {
      flashMessage.style.opacity = '1';
    }, 10); // Small delay to ensure transition works

    // Hide and remove the message after the specified duration
    setTimeout(() => {
      flashMessage.style.opacity = '0'; // Start the fade-out
      flashMessage.addEventListener('transitionend', () => {
        if (flashMessage.parentNode) {
          flashMessage.parentNode.removeChild(flashMessage);
        }
      }, { once: true });
    }, duration);
  }

  static getInstance() {
    if (!FlashMessage.instance) {
      FlashMessage.instance = new FlashMessage();
    }
    return FlashMessage.instance;
  }
}

// Export the singleton instance
export default FlashMessage.getInstance();
