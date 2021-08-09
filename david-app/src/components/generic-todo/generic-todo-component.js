import { Component } from 'react';

export class GenericTodoComponent extends Component {
    store = null;
    listConfig = null;
    

    componentDidMount() {
        this.store = this.props.store;
        this.listConfig = this.store.listConfig;
        this.store.refreshCb = () => this.forceUpdate();
        this.forceUpdate();

    }

    renderList = () => {
        const rows = this.store.getItems().map( (item, index) => this.renderLi(item, index));
        const list = (<ul {...this.listConfig.attributes}> {[rows]} </ul>);
        return (<div className = 'list-container'> {[list]} </div>);
    }

    renderLi = (item, index) => {
        const liAttributes = {};
        const spans = this.listConfig.components.map(component => {
            if(component.id === 'dueDate' && new Date(component.getCellValue(item)) < new Date()) {
                liAttributes.className = 'expired';
            } 
            component.attributes.className = component.id;
            const span = this.renderSpan(component.attributes, [component.getCellValue(item)]);
            return span;
        });

        const deleteAction = (
            <button 
                className = 'delete-btn'
                onClick = {() => this.store.delete(item)}
            > delete
            </button>);

        const actions = [deleteAction];
        const action = this.renderSpan({}, actions);
        return (<li {...liAttributes} key={index}> {[...spans, action]} </li>);
    }

    renderSpan = (attributes, children) => {
        return (<span {...attributes}> {[children]} </span>);
    }

    renderSortBy = () => {
        const options = this.listConfig.components.map(component => {
            // eslint-disable-next-line no-unused-vars
            const [currentid, ...rest] = this.store.currentSort;
            return (
                <option 
                    value={component.id}  
                    key={component.id}
                    id={component.id}
                > 
                    {component.id} 
                </option>);
        }); 

        const attributes = { className: 'sortable' };
        attributes.onChange = (evt) => {
            this.store.setSort(evt.target.value);
        }
        const select = (<select {...attributes}> {[options]} </select>);
        const label = (<label>sort by:</label>);
        return (<div className='sort-container'> {[label, select]} </div>);
    }

    renderForm = () => {
        //const item = this.store.currentItem;
        const { formFields } = this.listConfig;

        const children = [
            (<h2>Add Form</h2>)
        ];

        formFields.forEach(fieldAttributes => {
            let value = '';
            if (fieldAttributes.type === 'datetime-local' && typeof value === 'string') {
                value = value.substr(0, 16);
            }
            const inputCombo = [
                ( <input {...fieldAttributes} {...value} /> )
            ];

            if (fieldAttributes.type === 'checkbox') {
                inputCombo.push(<label>{fieldAttributes.name}</label>);
            } 
            children.push((<div className = 'input-container'>{inputCombo}</div>));
        });

        const buttons = [
            (<button 
                className = 'button'
                onClick = {() => this.store.setCurrentItem(null)}
            >Cancel</button>),
            (<input value = 'Save' type = 'submit' />)
        ]

        children.push((<div className = 'button-container'>{buttons}</div>));

        const form = (<form onSubmit = {this.store.onSubmit}>{children}</form>);

        return (<div className = 'add-edit-form'>{form}</div>);
    }

    render() {
        if (!this.store) { return null; }
        return (
            <div className = 'generic-todo'>
                {this.renderForm()}
                {this.renderSortBy()}
                {this.renderList()}
            </div>
        )
    }
}
