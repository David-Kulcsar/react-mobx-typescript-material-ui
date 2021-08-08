import { GenericTodoComponent } from "./generic-todo-component.js";
import { GenericTodoStore } from "./generic-todo-store.js";
import { Task } from "../../models/Task.js";

if (document.readyState === 'complete') {
    this.init();
} else {
    window.addEventListener('load', init);
}

function init() {
    // remove event listener, we not need anymore
    window.removeEventListener('load', init);

    // we create a table config
    const listConfig = {
        model: Task,
        endpoint: 'https://60fd9bcc1fa9e90017c70f18.mockapi.io/api/todos/',
        attributes: {},
        formFields: [
            { placeholder: 'title', name: 'title', type: 'text', required: true }, 
            { placeholder: 'Due Date', name: 'dueDate', type: 'datetime-local', required: true },
            { placeholder: 'isDone', name: 'isDone', type: 'checkbox', required: false }, 
        ],
        beforeFormSubmit: (data) => {
            data.createdAt = new Date();
            return data;
        },
        components: [
            {
                id: 'title',
                label: 'Title',
                getCellValue: (todo) => todo.title,
                attributes: {},
                sorter: (todo1, todo2) => todo1.title.localeCompare(todo2.title)
            },
            {
                id: 'dueDate',
                label: 'Due Date',
                getCellValue: (todo) => todo.dueDate instanceof Date ? todo.dueDate.toISOString().substr(0, 19).replace('T', ' ') : (todo.dueDate || '-'),
                attributes: {},
                sorter: (todo1, todo2) => new Date (todo1.dueDate).getTime() > new Date(todo2.dueDate).getTime() ? 1 : -1
            },
        ]
    };

    const parentElement = document.querySelector('#root');

    const todoStore = new GenericTodoStore(listConfig);

    const todoComonent = new GenericTodoComponent(todoStore);

    todoComonent.mount(parentElement);

}

export default init;