export default class FlashMessage {
  constructor() {
    this.flashMessage = document.createElement('div');
    this.flashMessage.style.position = 'fixed';
    this.flashMessage.style.zIndex = '1000';
    this.flashMessage.style.padding = '10px 20px';
    this.flashMessage.style.borderRadius = '5px';
    this.flashMessage.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
    this.flashMessage.style.transition = 'opacity 0.5s ease';
    this.flashMessage.style.opacity = '0'; // Initially hidden
    this.flashMessage.style.whiteSpace = 'pre'; // Line breaks with \r\n
    this.flashMessage.style.textAlign = 'center';
    this.timeoutId = null;
  }

  show({
    message,
    color = 'midnightblue',
    backgroundColor = 'whitesmoke',
    fontSize = '16px',
    fontFamily = 'Arial, sans-serif',
    position = 'top-center',
    duration = 2000
  }) {
    // Set message content and styles
    this.flashMessage.textContent = message;
    this.flashMessage.style.color = color;
    this.flashMessage.style.backgroundColor = backgroundColor;
    this.flashMessage.style.fontSize = fontSize;
    this.flashMessage.style.fontFamily = fontFamily;

    // Position the flash message
    this.setPosition(position);

    // Append to body if not already appended
    if (!document.body.contains(this.flashMessage)) {
      document.body.appendChild(this.flashMessage);
    }

    // Show the message
    setTimeout(() => {
      this.flashMessage.style.opacity = '1';
    }, 10); // Small delay to ensure transition works

    // Hide the message after the specified duration
    if (this.timeoutId) {
      clearTimeout(this.timeoutId); // Clear previous timeout if exists
    }
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, duration);
  }

  setPosition(position) {
    // Reset position styles
    this.flashMessage.style.top = '';
    this.flashMessage.style.bottom = '';
    this.flashMessage.style.left = '';
    this.flashMessage.style.right = '';
    this.flashMessage.style.transform = '';

    // Apply position styles based on the specified position
    switch (position) {
      case 'top-left':
        this.flashMessage.style.top = '20px';
        this.flashMessage.style.left = '20px';
        break;
      case 'top-center':
        this.flashMessage.style.top = '20px';
        this.flashMessage.style.left = '50%';
        this.flashMessage.style.transform = 'translateX(-50%)';
        break;
      case 'top-right':
        this.flashMessage.style.top = '20px';
        this.flashMessage.style.right = '20px';
        break;
      case 'bottom-left':
        this.flashMessage.style.bottom = '20px';
        this.flashMessage.style.left = '20px';
        break;
      case 'bottom-center':
        this.flashMessage.style.bottom = '20px';
        this.flashMessage.style.left = '50%';
        this.flashMessage.style.transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
        this.flashMessage.style.bottom = '20px';
        this.flashMessage.style.right = '20px';
        break;
      default:
        console.warn(`Unknown position: ${position}`);
        this.flashMessage.style.top = '20px';
        this.flashMessage.style.left = '50%';
        this.flashMessage.style.transform = 'translateX(-50%)';
    }
  }

  hide() {
    this.flashMessage.style.opacity = '0';
    this.flashMessage.addEventListener('transitionend', () => {
      if (this.flashMessage.parentNode) {
        this.flashMessage.parentNode.removeChild(this.flashMessage);
      }
    }, { once: true });
  }
}