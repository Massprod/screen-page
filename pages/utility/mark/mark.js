

export default class AttributeMark{
    constructor(
        markClass = 'basic-mark',
    ) {
        this.markClass = markClass;
        this.allMarked = new Set();
    }

    async setRules(targetName, targetValue, ignoredElements = null) {
        this.targetName = targetName;
        this.targetValue = targetValue;
        this.ignoredElements = ignoredElements;
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
                    if (attribute.value === this.targetValue) {
                        
                        return;
                    } 
                }
            }
            target.classList.remove(this.markClass);
            this.allMarked.delete(target);
        })
    }
 
    async markTargets(setUpdate = false) {
        this.curTargets = document.querySelectorAll(`[${this.targetName}=${CSS.escape(this.targetValue)}]`);
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