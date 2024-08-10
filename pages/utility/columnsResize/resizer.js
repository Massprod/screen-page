export default class ColumnResizer {
    constructor(targetTable, headerElements, minWidth = 75, maxWidth = 250) {
        this.targetTable = targetTable;
        this.headerElements = headerElements;
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.onMouseMove = null;
        this.onMouseUp = this.onMouseUp.bind(this);
        this.init();
    }

    init() {
        this.loadColumnSizes();

        this.headerElements.forEach((th, index) => {
            th.style.position = 'relative';

            const resizer = document.createElement('div');
            resizer.classList.add('resizer');
            th.appendChild(resizer);

            resizer.addEventListener('mousedown', (e) => this.onMouseDown(e, th, index));

            th.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                this.resetColumnSize(th, index);
                this.saveColumnSizes();
            });
        });
    }

    saveColumnSizes() {
        const sizes = [];
        this.headerElements.forEach(th => {
            sizes.push(th.style.width || 'auto');
        });
        document.cookie = `columnSizes=${sizes.join(',')}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }

    loadColumnSizes() {
        const cookies = document.cookie.split('; ');
        const columnSizesCookie = cookies.find(cookie => cookie.startsWith('columnSizes='));
        if (columnSizesCookie) {
            const columnSizes = columnSizesCookie.split('=')[1].split(',');
            this.headerElements.forEach((th, index) => {
                const newWidth = columnSizes[index];
                if (newWidth && newWidth !== 'auto') {
                    this.setColumnWidth(th, index, newWidth);
                }
            });
        }
    }

    setColumnWidth(th, index, width) {
        th.style.width = width;
        const cells = this.targetTable.querySelectorAll(`tr td:nth-child(${index + 1})`);
        cells.forEach(cell => {
            cell.style.width = width;
        });
    }

    resetColumnSize(th, index) {
        th.style.width = ''; // Default width
        const cells = this.targetTable.querySelectorAll(`tr td:nth-child(${index + 1})`);
        cells.forEach(cell => {
            cell.style.width = ''; // Reset to default width
        });
    }

    onMouseDown(e, th, index) {
        document.addEventListener('mousemove', this.onMouseMove = (e) => this.onMouseMoveHandler(e, th, index));
        document.addEventListener('mouseup', this.onMouseUp);

        this.startX = e.pageX;
        this.startWidth = th.offsetWidth;
    }

    onMouseMoveHandler(e, th, index) {
        const newWidth = Math.min(this.maxWidth, Math.max(this.minWidth, this.startWidth + (e.pageX - this.startX)));
        this.setColumnWidth(th, index, `${newWidth}px`);
    }

    onMouseUp() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        this.saveColumnSizes();
    }

    applyColumnSizesToNewRow(row) {
        this.headerElements.forEach((th, index) => {
            const newWidth = th.style.width;
            if (newWidth) {
                const cell = row.querySelector(`td:nth-child(${index + 1})`);
                if (cell) {
                    cell.style.width = newWidth;
                }
            }
        });
    }
}
