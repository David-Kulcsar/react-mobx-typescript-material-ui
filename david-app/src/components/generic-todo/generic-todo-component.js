import { BaseComponent } from '../../core/baseComponent.js';

export class GenericTodoComponent extends BaseComponent {
    listConfig = null;
    store = null;

    constructor(store) {
        super();
        this.store = store;
        this.store.refreshCb = this.refresh;
        this.listConfig = store.listConfig;
    }

    renderList = () => {
        const rows = this.store.getItems().map(item => this.renderLi(item));
        const list = { tagName: 'ul', attributes: this.listConfig.attributes, children: rows };
        return { tagName: 'div', attributes: { className: 'list-container' }, children: [list] };
    }

    renderLi = (item) => {

        const liAttributes = {};
        const spans = this.listConfig.components.map(component => {
            if(component.id === 'dueDate' && new Date(component.getCellValue(item)) < new Date()) {
                liAttributes.className = 'expired';
            } 
            component.attributes.className = component.id;
            const span = this.renderSpan(component.attributes, [component.getCellValue(item)]);
            return span;
        });

        const deleteAction = { tagName: 'button', attributes: { className: 'delete-btn', onclick: () => this.store.delete(item) }, children: ['delete'] };

        const actions = [deleteAction];
        const action = this.renderSpan({}, actions);
        return { tagName: 'li', attributes: liAttributes, children: [...spans, action] };
    }

    renderSpan = (attributes, children) => {
        return { tagName: 'span', attributes, children };
    }

    renderSortBy = () => {
        const options = this.listConfig.components.map(component => {
            const optionAttributes = {value: component.id};
            const [currentid, ...rest] = this.store.currentSort;
            if(currentid === component.id)
                optionAttributes.selected = true;
            return { tagName: 'option', attributes: optionAttributes, children: [component.id]}
        }); 

        const attributes = { className: 'sortable' };
        attributes.onchange = (evt) => {
            this.store.setSort(evt.target.value);
        }
        const select = { tagName: 'select', attributes: attributes, children: options};
        const label = { tagName: 'label', children: ["sort by:"]};

        return { 
            tagName: 'div', 
            attributes: { className: 'sort-container' }, 
            children: [label, select]
        };
    }

    renderForm = () => {
        //const item = this.store.currentItem;
        const { formFields } = this.listConfig;

        const children = [
            { tagName: 'h2', children: ['Add Form'] }
        ];

        formFields.forEach(fieldAttributes => {
            let value = '';
            if (fieldAttributes.type === 'datetime-local' && typeof value === 'string') {
                value = value.substr(0, 16);
            }
            const inputCombo = [
                { tagName: 'input', attributes: {...fieldAttributes, value: value } }
            ]

            if (fieldAttributes.type === 'checkbox') {
                inputCombo.push({ tagName: 'label', children: [fieldAttributes.name] });
            } 
            children.push({tagName: 'div', attributes: {className: 'input-container'}, children: inputCombo});
        });

        const buttons = [
            { 
                tagName: 'button', 
                attributes: { className: 'button', onclick: () => this.store.setCurrentItem(null) }, 
                children: ['Cancel'] 
            },
            { 
                tagName: 'input',  
                attributes: { value: 'Save', type: 'submit' } 
            }
        ]

        children.push(
            {tagName: 'div', attributes: {className: 'button-container'}, children: buttons}
        );

        const form = { 
            tagName: 'form', 
            attributes: { onsubmit: this.store.onSubmit }, 
            children
        };

        return { tagName: 'div', attributes: { className: 'add-edit-form' }, children: [form] }; 
    }

    render() {
        const children = [
            this.renderForm(),
            this.renderSortBy(),
            // this.renderAddButton(),
            this.renderList()
        ];
        return this.renderElement({ tagName: 'div', attributes: { className: 'generic-todo' }, children });
    }
}
