export default class Identifier{
  constructor({
    identSymbol = '',
    identHeight = 75,
    identWidth = 75,
    identBgColor = 'whitesmoke',
  } = {}) {
    this.identSymbol = identSymbol;
    this.identHeight = identHeight;
    this.identWidth = identWidth;
    this.identBgColor = identBgColor;
    this.#init();
  }

  #init() {
    this.element = document.createElement('div');
    this.element.style.width = `${this.identWidth}px`;
    this.element.style.height = `${this.identHeight}px`;
    this.element.style.backgroundColor = this.identBgColor;
    this.element.style.border = '5px solid whitesmoke'
    this.element.style.margin = '5px';
    this.element.style.position = 'relative';
    this.identElement = document.createElement('span');
    this.identElement.style.position = 'absolute';
    this.identElement.style.top = '50%';
    this.identElement.style.left = '50%';
    this.identElement.style.transform = 'translate(-50%, -50%)';
    this.identElement.style.color = 'black';
    this.identElement.style.fontWeight = 'bold';
    this.identElement.style.fontSize = '30px';
    this.identElement.textContent = this.identSymbol;
    this.element.appendChild(this.identElement);
  }
}