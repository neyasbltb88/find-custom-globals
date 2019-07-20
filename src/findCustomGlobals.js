class FindCustomGlobals {
    srcScript;
    defaultGlobals;
    iframe;
    storageKey = "clearWindowProp";
    customGlobals;
    nextCounter = 0;

    constructor() {
        this.srcScript = /* javascript */ `
            let arr = [];
            for(let prop in window) {
                arr.push(prop)
            }
            let windowProp = JSON.stringify(arr);            
            localStorage.setItem('${this.storageKey}', windowProp);
        `;

        // Точка входа
        this.run();
    }

    // Возвращает имя глобальной переменной по индексу в собранном 
    // массиве кастомных глобальных переменных
    getGlobalName = (index = 0) => {
        index = this._validateIndex(index);

        return this.customGlobals[index];
    }

    // Возвращает значение глобальной переменной по индексу в собранном 
    // массиве кастомных глобальных переменных
    getGlobalValue = (index = 0) => {
        index = this._validateIndex(index);

        return window[this.customGlobals[index]];
    }

    getGlobal = (index = 0) => {
        index = this._validateIndex(index);

        let name = this.getGlobalName(index);
        let value = this.getGlobalValue(index);

        return {
            index,
            name,
            value
        };
    }

    // Валидация устанавливаемого индекса
    _validateIndex = index => {
        if (typeof index !== 'number') return false;
        if (index < 0) index = 0;
        if (index >= this.customGlobals.length) index = 0;

        return index;
    }

    // Устанавливает индекс счетчика для дальнейших вызовов showNextGlobal
    setNextGlobalCounter = index => {
        index = this._validateIndex(index);

        this.nextCounter = index;

        return index;
    }

    // Сбрасывает счетчик для showNextGlobal
    resetNextGlobalCounter = () => {
        this.setNextGlobalCounter(0);

        return 0;
    }

    // Выводит по порядку по одной глобальной переменной за вызов.
    // Возвращает объект (имя_переменной: значение)
    showNextGlobal = () => {
        let index = this.nextCounter++;
        if (this.nextCounter >= this.customGlobals.length) this.resetNextGlobalCounter();

        return this.getGlobal(index);
    }

    // Выводит объект(имя_переменной: значение) всех кастомных переменных
    showCustomGlobals = (log = false) => {
        let result = {};

        this.customGlobals.forEach(prop => {
            result[prop] = window[prop];
        });

        if (log) console.log(`CustomGlobals[${Object.keys(result).length}]: `, result);
        return result;
    };

    // Выводит массив имен кастомных переменных
    showCustomGlobalsNames = (log = false) => {
        let result = this.customGlobals;

        if (log) console.log(`CustomGlobalsNames[${result.length}]: `, result);
        return result;
    };

    // Собирает коллекцию только кастомных глобальных переменных
    filterCustomGlobals = () => {
        this.customGlobals = new Set();

        for (let prop in window) {
            if (!this.defaultGlobals.has(prop)) {
                this.customGlobals.add(prop);
            }
        }

        this.customGlobals = [...this.customGlobals];

        // Выводит в консоль массив имен найденных кастомных шлобальных переменных
        this.showCustomGlobalsNames(true);
    };

    // Обработчик события изменения localStorage
    storageHandler = event => {
        // Если изменение по нужномы нам ключу
        if (event.key === this.storageKey) {
            try {
                // Запоминаем в коллекцию имена дефолтных глобальных переменных
                this.defaultGlobals = new Set(JSON.parse(event.newValue));
            } catch (err) {
                console.log("Ошибка при JSON.parse(event.newValue): ", err);
                return false;
            } finally {
                // Очистка от своих действий
                window.removeEventListener("storage", this.storageHandler);
                localStorage.removeItem(this.storageKey);
                this.iframe.remove();
            }

            // Получив коллекцию дефолтных переменных, надо по ней отфильтровать все свойства window
            this.filterCustomGlobals();
        }
    };

    // Добавление на страницу iframe, в адресе которого будет js-выражение, которое он выполнит
    insertIframe = () => {
        // Будем ждать пока айфрейм добавит в localStorage запись с дефолтными глобальными переменными
        window.addEventListener("storage", this.storageHandler, false);

        this.iframe = document.createElement("iframe");
        this.iframe.width = "1";
        this.iframe.height = "1";
        this.iframe.style.border = 'none';
        this.iframe.style.opacity = '0';
        this.iframe.style.position = 'absolute';

        document.head.appendChild(this.iframe);
        this.iframe.src = `javascript:${this.srcScript}`;
    };

    run = () => {
        this.defaultGlobals = undefined;
        this.customGlobals = undefined;
        this.nextCounter = 0;

        this.insertIframe();
    };
}

window.FindCustomGlobals = FindCustomGlobals;