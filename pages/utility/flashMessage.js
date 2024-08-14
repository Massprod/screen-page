class FlashMessage {
  constructor() {
    if (FlashMessage.instance) {
      return FlashMessage.instance;
    }

    this.flashMessagesContainer = document.createElement('div');
    this.flashMessagesContainer.classList.add('flash-messages-container');
    document.body.appendChild(this.flashMessagesContainer);

    this.messageQueue = [];  // Queue to store messages
    this.isDisplaying = false;  // Flag to check if messages are currently being displayed
    this.maxVisibleMessages = 7;  // Maximum number of messages to display at once

    FlashMessage.instance = this;
  }

  show({
    message,
    color = 'midnightblue',
    backgroundColor = 'whitesmoke',
    fontSize = '16px',
    fontFamily = 'Arial, sans-serif',
    duration = 3000,
    delayBetweenMessages = 500  // Delay between showing messages after the max visible messages are displayed
  }) {
    // Check for duplicate messages in the queue and remove them
    this.messageQueue = this.messageQueue.filter(msg => msg.message !== message);

    // Add the message to the queue
    this.messageQueue.push({
      message,
      color,
      backgroundColor,
      fontSize,
      fontFamily,
      duration,
      delayBetweenMessages
    });

    // Start displaying messages if not already doing so
    if (!this.isDisplaying) {
      this.displayNextMessages();
    }
  }

  async displayNextMessages() {
    this.isDisplaying = true;

    while (this.messageQueue.length > 0) {
      const visibleMessages = this.flashMessagesContainer.childElementCount;

      // If there are less than maxVisibleMessages being displayed, show the next message
      if (visibleMessages < this.maxVisibleMessages) {
        const { message, color, backgroundColor, fontSize, fontFamily, duration } = this.messageQueue.shift();
        this.displayMessage({ message, color, backgroundColor, fontSize, fontFamily, duration });
      }

      // Wait before checking again if more messages can be displayed
      await this.sleep(500);
    }

    this.isDisplaying = false;
  }

  displayMessage({ message, color, backgroundColor, fontSize, fontFamily, duration }) {
    const flashMessage = document.createElement('div');
    flashMessage.classList.add('flash-message');
    flashMessage.style.color = color;
    flashMessage.style.backgroundColor = backgroundColor;
    flashMessage.style.fontSize = fontSize;
    flashMessage.style.fontFamily = fontFamily;
    flashMessage.textContent = message;

    this.flashMessagesContainer.appendChild(flashMessage);

    // Show the message with a small delay to trigger CSS transitions
    setTimeout(() => {
      flashMessage.style.opacity = '1';
    }, 10);

    // Hide and remove the message after the specified duration
    setTimeout(() => {
      flashMessage.style.opacity = '0';
      flashMessage.addEventListener('transitionend', () => {
        if (flashMessage.parentNode) {
          flashMessage.parentNode.removeChild(flashMessage);
        }
      }, { once: true });
    }, duration);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
