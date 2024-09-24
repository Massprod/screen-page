

export default class AttributeMark{
    constructor(
        markClass = 'basic-mark',
    ) {
        this.markClass = markClass;
        this.allMarked = new Set();
        this.clearTimeout = null;
    }

    async setRules(targetName, targetValue, ignoredElements = null, attributeSeparator = ';') {
        this.targetName = targetName;
        this.targetValue = targetValue;
        this.ignoredElements = ignoredElements;
        this.attributeSeparator = attributeSeparator;
    }

    async clearMarking() {
        this.targetValue = null;
        if (this.markInterval) {
            clearInterval(this.markInterval);
            this.markInterval = null;
        }
        if (this.curTargets) {
            this.curTargets.forEach( element => {
                element.classList.remove(this.markClass);
            });   
        }
        this.allMarked = new Set();
    }

    async clearChanged() {
        this.allMarked.forEach( (target) => {
            if (target.isConnected) {
                for (let attribute of target.attributes) {
                    const attValues = attribute.value.split(this.attributeSeparator);
                    if (attValues.includes(this.targetValue)) {
                        return;
                    } 
                }
            }
            target.classList.remove(this.markClass);
            this.allMarked.delete(target);
        })
    }
 
    async markTargets(setUpdate = false, secondsLimit = 0) {
        if (0 !== secondsLimit) {
            if (this.clearTimeout) {
                clearTimeout(this.clearTimeout);
                this.clearTimeout = null;
            }
            this.clearTimeout = setTimeout( () => {
                this.clearMarking();
            }, secondsLimit * 1000);
        }
        this.curTargets = Array.from(document.querySelectorAll(`[${this.targetName}]`)).filter(element => {
            const attrValue = element.getAttribute(this.targetName);
            const valueList = attrValue.split(this.attributeSeparator);
            return valueList.includes(this.targetValue);
        });
        if (0 === this.curTargets.length) {
            this.clearMarking();
        }
        this.curTargets.forEach( element => {
            if (this.ignoredElements && this.ignoredElements.has(element)) {
                return;
            }
            element.classList.add(this.markClass);
            this.allMarked.add(element);
        });
        if (setUpdate) {
            this.keepMarking();
        }
    }

    async keepMarking() {
        if (this.markInterval) {
            return;
        }
        this.markInterval = setInterval(async () => {
            this.markTargets();
            this.clearChanged();
        }, 100);
    }

}