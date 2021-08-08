function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0; 
      let v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

export const SORT_DIRECTION = ['ASC', 'DESC'];

export class GenericTodoStore {
    refreshCb = null;
    listConfig = null;
    currentItem = null;
    currentSort = '';
    items = [];

    constructor(listConfig) {
        this.listConfig = listConfig;
        this.init();
    }

    init() {
        const sortByFirstComponent = this.listConfig.components.find(x => x.sorter);
        if (sortByFirstComponent) {
            this.setSort(sortByFirstComponent.id);
        }
        this.getList();
        
    }

    getList = async () => {
        const Model = this.listConfig.model;
        const request = await fetch(this.listConfig.endpoint);
        const items = await request.json();
        const mappedItems = items.map(x => new Model(x));
        this.setItems(mappedItems);
        return mappedItems;
    }

    delete = async (deletedItem) => {
        await fetch(this.listConfig.endpoint + deletedItem.id, { method: 'DELETE' });
        this.setItems(this.items.filter(item => item.id !== deletedItem.id));
    }

    getItems() {
        if (!this.searchTerm) { return this.items; }
        return this.items.filter(item => this.listConfig.searchFilter(this.searchTerm, item));
    }

    // set item + refresh the component
    setItems(items) {
        this.items = items;
        if (this.refreshCb) {
            this.refreshCb();
        }
    }

    setCurrentItem(currentItem) {
        if (typeof currentItem === 'undefined') {
            const Model = this.listConfig.model;
            currentItem = new Model();
        }
        this.currentItem = currentItem;
        if (this.refreshCb) {
            this.refreshCb();
        }
    }

    create = async (data) => {
        data.id = guid();
        const Model = this.listConfig.model;
        const item = new Model(data);
        const request = await fetch(this.listConfig.endpoint, { 
            method: 'POST', 
            body: JSON.stringify(item),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        const savedItem = await request.json();
        const mappedItem = new Model(savedItem);
        this.setItems([mappedItem, ...this.items]);
        return mappedItem;
    }

    setSort = (id) => {
        const [ASC, DESC] = SORT_DIRECTION;
        const [currentId, direction] = this.currentSort;
        this.currentSort = [id, id === currentId && direction === ASC ? DESC : ASC];
        const component = this.listConfig.components.find(c => c.id === id);
        const sortedItems = this.items.sort((todo1, todo2) => component.sorter(todo1, todo2) * (this.currentSort[1] === DESC ? -1 : 1))
        this.setItems(sortedItems);
    }

    onSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const inputList = Array.from(event.target.querySelectorAll(`input[name]`));
        const formData = inputList.reduce((data, inputElem) => {
            let value = inputElem.value;
            if (inputElem.type === 'checkbox') {
                value = inputElem.checked;
            } else if (inputElem.type === 'datetime-local') {
                value = new Date(value).toISOString();
            }
            data[inputElem.name] = value;
            return data;
        }, {});
        const data = this.listConfig.beforeFormSubmit(formData);
        event.target.reset();
        if (data.id) {
            this.update(data);
        } else {
            this.create(data);
        }
        this.setCurrentItem(null);
        return false;
    }
}