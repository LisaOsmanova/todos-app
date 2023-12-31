const inputElement = document.querySelector(".input");
let btnActive = document.querySelector(".footer-button-active");
let btnCompleted = document.querySelector(".footer-button-completed");
let btnAll = document.querySelector(".footer-button-all")
const ul = document.querySelector('ul');
let btnClearCmpl = document.querySelector(".footer-button-clear");
const mainButton = document.querySelector(".button-main")

// storage. create object which includes methods for working with storage. Public interface (API). read data from local storage and return it.
const storage = {
    saveData(property, value) {
        if (value !== undefined){
            localStorage.setItem(property, JSON.stringify(value))
        }
    },
    getData(property) {
        // const data = JSON.parse(localStorage.getItem("safeTodos"))
        let a = localStorage.getItem(property);
        if (a === null) {
            return null;
        } else {
            return JSON.parse(a);
        }
    }
}

const dom = {
    createTodo(id, completed, value) {
        let liElement = document.createElement('li');
        liElement.setAttribute('id',id);
        liElement.completed = completed;
        liElement.classList.add("li-style");

        /* checkbox */
        const checkboxElement = document.createElement('input');
        checkboxElement.setAttribute("type", "checkbox");
        checkboxElement.classList.add("check");
        liElement.appendChild(checkboxElement);
        checkboxElement.checked = completed; // set the actual state of  todo item
        
        /* text */
        const text = document.createTextNode(value);
        liElement.appendChild(text);


        if(completed === true){
            liElement.classList.add("cross-out");
        } else {
            liElement.classList.remove("cross-out");
        }

        const clearButton = document.createElement('button');
        clearButton.classList.add("button-style");
        liElement.appendChild(clearButton);

        clearButton.addEventListener("click", function(event){
            state.removeTodo(+liElement.id);
            liElement.remove();
            updateCounter();
            storage.saveData("saveTodos",state.todos);
        })

        checkboxElement.addEventListener('input', function(event){
            for (let i = 0; i < state.todos.length; i++ ) {
                    if (liElement.id == state.todos[i].id) {
                        state.todos[i].completed = !state.todos[i].completed;

                        if(state.todos[i].completed === true){
                            liElement.classList.add("cross-out");
                        } else {
                            liElement.classList.remove("cross-out");
                        }
                        break;
                    }
            }
            updateCounter();
            clearCompleted();
            storage.saveData("saveTodos", state.todos);
        })

        return liElement;
    },
    renderElements(todos) {
        for (let i = 0; i < todos.length; i++){
            const li = this.createTodo(todos[i].id, todos[i].completed, todos[i].value);
            ul.appendChild(li);
            updateCounter();
            clearCompleted();
        }
    },
    setActiveFilter(button) {
        let borderRemove = document.querySelector(".btn-click");
        if (borderRemove) {
            borderRemove.classList.remove('btn-click');
        }
        button.classList.add('btn-click');
    },
    toggleElement(element, className, is) {
        if (is) {
            element.classList.remove(className);
        } else {
            element.classList.add(className);
        }
    },
    highlightFilter(btnId){
        const correspondingBtn = document.getElementById(btnId);
        dom.setActiveFilter(correspondingBtn);
    },
    removeTodo(elementId){
        const liToRemove = document.getElementById(elementId);
        liToRemove.remove();
    },
    updateCount(n){
        const count = document.querySelector(".span");
        let span = `${n} item${n !== 1 ? 's' : ''} left`; // $ - outputting expression into the string. Ternary operator.
        count.textContent = span;
    },
    toggleByLiId(ids){
        let liElements = document.querySelectorAll('.li-style');
        for (let i = 0; i < liElements.length; i++){
        dom.toggleElement(liElements[i], 'hidden', ids.includes(+liElements[i].id));
    }
    },
    removeClasses(className){
        let liElements = document.querySelectorAll('li');
        for (let i = 0; i < liElements.length; i++){
            liElements[i].classList.remove(className);
        }
    }
}


const state = {
    todos: [],
    addTodo(value) {
        const id = Date.now();
        const completed = false;
        this.todos.push({
            value,
            id: id,
            completed
        });
        return {id, completed}
    },
    clearCompleted(cb){
        let completedTodos = this.todos.filter((todo) => todo.completed === true);
    
        for (let i = 0; i < completedTodos.length; i++){
        const completedTodoId = completedTodos[i].id // get id of completedTodos's element
        const index = this.todos.findIndex((element) => element.id === completedTodoId); 
        //index for splice
        this.todos.splice(index, 1); // get rid from Todos
        cb(completedTodoId);
    }
    },
    getActiveTodos(){
        const activeTodos = this.todos.filter((todo) => todo.completed === false); 
        return activeTodos;
    },
    getCompletedTodos(){
        const completedTodos = this.todos.filter((todo) => todo.completed === true);
        return completedTodos;
    },
    updateTodo(i,is){
        this.todos[i].completed = is;
    },
    removeTodo(id){
        let filteredTodos = this.todos.filter((todo) => todo.id !== id);
        state.todos = filteredTodos;
    }
}

function updateCounter() {
    const activeTodos = state.getActiveTodos();
    dom.updateCount(activeTodos.length);
}
  
function clearCompleted() {
    const completedTodos = state.getCompletedTodos();
    const b = completedTodos.length !== 0; // const b = completed.length > 0
    dom.toggleElement(btnClearCmpl, 'hidden', b)
}

function filterAndToggleElements(filterCondition) {
    let filteredTodos = state.todos.filter(filterCondition);
    let ids = filteredTodos.map(todo => todo.id);
    dom.toggleByLiId(ids);
}


function init(){
    if (storage.getData('saveTodos') !== null) {
        state.todos = storage.getData("saveTodos");
    }
    dom.renderElements(state.todos);
    dom.highlightFilter(storage.getData("btnId") || "all-btn-id");
    
    
    if (storage.getData('btnId') === "completed-btn-id"){
        filterAndToggleElements(todo => todo.completed === true);
    } else if (storage.getData('btnId') === "active-btn-id") {
        filterAndToggleElements(todo => todo.completed === false);
    } 
    
    mainButton.addEventListener("click", function(event){
    
        const checkboxes = document.querySelectorAll('.check')
        const liItems = document.querySelectorAll('.li-style')
        if(state.todos.some((todo) => todo.completed === false)) {
            for (let i = 0; i < state.todos.length; i++) {
                state.updateTodo(i,true);
                checkboxes[i].checked = true;
            }
            liItems.forEach((item) => item.classList.add("cross-out"))
        } else if (state.todos.every((todo) => todo.completed === true)) {
            for (let i = 0; i < state.todos.length; i++) {
                state.updateTodo(i, false);
                checkboxes[i].checked = false;
            }
            liItems.forEach((item)=> item.classList.remove("cross-out"))
        }
        updateCounter();
    })
    
    inputElement.addEventListener("keydown", function(event){
        if (event.key === 'Enter') {
            const {id, completed} = state.addTodo(inputElement.value);
            const li = dom.createTodo(id, completed, inputElement.value);
            ul.appendChild(li);
    
            inputElement.value = "";
            updateCounter();
            storage.saveData("saveTodos",state.todos);
        }
    })
    
    btnClearCmpl.addEventListener('click', function(event){
        state.clearCompleted((id) => dom.removeTodo(id));
        clearCompleted();
        storage.saveData("saveTodos", state.todos);
    })
    
    btnAll.addEventListener("click", function(event) {
        let btnAllId = btnAll.getAttribute('id');
        storage.saveData("btnId", btnAllId);
        dom.removeClasses('hidden');
        dom.setActiveFilter(btnAll);
    })
    
    btnActive.addEventListener("click", function(event) {
        let btnActiveId = btnActive.getAttribute("id");
        filterAndToggleElements(todo => todo.completed === false);
        storage.saveData("btnId", btnActiveId);
        dom.setActiveFilter(btnActive);
    });
    
    btnCompleted.addEventListener("click", function(event) {
        filterAndToggleElements(todo => todo.completed === true);
        let btnCompletedId = btnCompleted.getAttribute("id");
        dom.setActiveFilter(btnCompleted);
        storage.saveData("btnId", btnCompletedId);
    });
}

document.addEventListener('DOMContentLoaded', init);