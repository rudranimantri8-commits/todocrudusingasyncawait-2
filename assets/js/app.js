
const cl = console.log;


// cl("JavaScript file loaded");


const todoForm = document.getElementById('todoForm');
const todoItem = document.getElementById('todoItem');
const todoDescription = document.getElementById('todoDescription');
const isCompleted = document.getElementById('isCompleted');

const addTodoBtn = document.getElementById('addTodoBtn');
const updateTodoBtn = document.getElementById('updateTodoBtn');

const todoContainer = document.getElementById('todoContainer');

const spinner = document.getElementById('spinner');

const base_url = `https://todocrud2-705b3-default-rtdb.firebaseio.com`;
const todo_url = `${base_url}/todocrud2.json`;


//local state
let state = {
    todosArr: [],
    editId: null
}

function snackBar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2000,
        confirmButtonColor: '#212529'
    })
}

//to expand/collapse
function toggleDescription(ele) {

    let description = ele.querySelector('.collapse');
    // cl(description)
    let open = description.classList.contains('show');
    let allDescription = ele.closest("#todoContainer").querySelectorAll(".collapse");
    allDescription.forEach(ele => ele.classList.remove('show'));
    if (!open) {
        description.classList.add('show');
    }

}

//spinner
function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove('d-none');
    }
    else {
        spinner.classList.add('d-none');
    }
}

//objToArr
function objToArr(obj) {
    state.todosArr = [];
    for (const key in obj) {
        obj[key].id = key;
        state.todosArr.unshift(obj[key]);
    }
}

//create

async function ontodoSubmit(eve) {
    eve.preventDefault();
    cl('add todo button clicked');
    try {
        handleSpinner(true);
        let todoObj = {
            todoItem: todoItem.value,
            description: todoDescription.value,
            isCompleted: isCompleted.value === "yes" ? true : false,
        }

        let res = await fetch(todo_url, {
            method: "POST",
            body: JSON.stringify(todoObj),
            headers: {
                "Content-Type": "Application/json",
            }
        })
        if (!res.ok) {
            throw new Error("Error:" + res.status);
        }
        let data = await res.json();

        todoObj.id = data.name;
        state.todosArr.unshift(todoObj);

        let li = document.createElement('li');
        li.id = todoObj.id;
        li.className = "list-group-item";
        li.setAttribute('onclick', 'toggleDescription(this)');
        li.innerHTML = `
        <div class="d-flex justify-content-between">
                                    <div>
                                        <input type="checkbox" onclick="event.stopPropagation();onCheck(this)" ${todoObj.isCompleted ? 'checked' : ''}>
                                        <strong>${todoObj.todoItem}</strong>
                                    </div>
                                    <div>
                                        <button onclick="event.stopPropagation();onTodoEdit(this)"
                                            class="btn btn-info btn-sm">Edit</button>
                                        <button onclick="event.stopPropagation();onTodoRemove(this)"
                                            class="btn btn-sm btn-danger">Remove</button>
                                    </div>
                                     </div>

                                <div class="collapse">
                                    <div class="card-body">
                                       ${todoObj.description}
                                    </div>
                                </div>
        `;

        todoContainer.prepend(li);
        todoForm.reset();
        snackBar("Todo added successfully", 'success');
    }
    catch (err) {
        snackBar(err.message, 'error');
    }
    finally {
        handleSpinner(false);
    }

}

// cl(todoForm);

//read
async function fetchTodo() {
    handleSpinner(true)
    try {
        let res = await fetch(todo_url)
        if (!res.ok) {
            throw new Error('Error')
        }
        let data = await res.json();
        state.todosArr = [];
        objToArr(data)
        // cl(state)
        createTodo(state.todosArr);

    }
    catch (err) {
        snackBar(err.message, 'error');
    }
    finally {
        handleSpinner(false)
    }
}
fetchTodo();


function createTodo(arr) {
    let res = ``;
    arr.forEach(todo => {
        res += `
        <li class="list-group-item" id="${todo.id}" onclick="toggleDescription(this)">
        <div class="d-flex justify-content-between">
                                    <div>
                                        <input type="checkbox" onclick="event.stopPropagation();onCheck(this)" ${todo.isCompleted ? 'checked' : ''}>
                                        <strong>${todo.todoItem}</strong>
                                    </div>
                                    <div>
                                        <button onclick="event.stopPropagation();onTodoEdit(this)"
                                            class="btn btn-info btn-sm">Edit</button>
                                        <button onclick="event.stopPropagation();onTodoRemove(this)"
                                            class="btn btn-sm btn-danger">Remove</button>
                                    </div>
                                     </div>

                                <div class="collapse">
                                    <div class="card-body">
                                       ${todo.description}
                                    </div>
                                </div>
                                </li>`
    })
    todoContainer.innerHTML = res;
}


//EDIT
function onTodoEdit(ele) {
    let EDIT_ID = ele.closest('li').id;
    state.editId = EDIT_ID;
    let EDIT_OBJ = state.todosArr.find(t => t.id === EDIT_ID);
    todoItem.value = EDIT_OBJ.todoItem;
    todoDescription.value = EDIT_OBJ.description;
    isCompleted.value = EDIT_OBJ.isCompleted ? "yes" : "no";
    addTodoBtn.classList.add('d-none');
    updateTodoBtn.classList.remove('d-none');
}


//update
async function onupdateTodo() {
    try {
        handleSpinner(true);
        let update_id = state.editId;
        let update_url = `${base_url}/todocrud2/${update_id}.json`;
        let updated_obj = {
            todoItem: todoItem.value,
            description: todoDescription.value,
            isCompleted: isCompleted.value === "yes" ? true : false,
            id: update_id,
        }
        let res = await fetch(update_url, {
            method: "PATCH",
            body: JSON.stringify(updated_obj),
            headers: {
                "content-Type": "Application/json",
            }
        })
        if (!res.ok) {
            throw new Error("Update failed: " + res.status);
        }
        let data = await res.json();
        let getIndex = state.todosArr.findIndex(t => t.id === update_id);
        state.todosArr[getIndex] = updated_obj;
        let li = document.getElementById(update_id);
        li.innerHTML = `
        <div class="d-flex justify-content-between">
                                    <div>
                                        <input type="checkbox" onclick="event.stopPropagation();onCheck(this)" ${data.isCompleted ? 'checked' : ''}>
                                        <strong>${data.todoItem}</strong>
                                    </div>
                                    <div>
                                        <button onclick="event.stopPropagation();onTodoEdit(this)"
                                            class="btn btn-info btn-sm">Edit</button>
                                        <button onclick="event.stopPropagation();onTodoRemove(this)"
                                            class="btn btn-sm btn-danger">Remove</button>
                                    </div>
                                     </div>

                                <div class="collapse">
                                    <div class="card-body">
                                       ${data.description}
                                    </div>
                                </div>
        `
        todoForm.reset();
        state.editId = null;
        snackBar("Todo updated successfully", 'success');

        updateTodoBtn.classList.add('d-none');
        addTodoBtn.classList.remove('d-none');

    }
    catch (err) {
        snackBar(err.message, 'error');
    }
    finally {
        handleSpinner(false);
    }

}


async function onCheck(ele) {
    let li = ele.closest('li');
    let check_id = li.id;
    let check_url = `${base_url}/todocrud2/${check_id}.json`;
    let checkedValue = ele.checked;
    try {
        handleSpinner(true);
        let res = await fetch(check_url, {
            method: "PATCH",
            body: JSON.stringify({ isCompleted: checkedValue }),
            headers: {
                "Content-Type": "application/json"
            },
        })
        if (!res.ok) {
            throw new Error(err)
        }
        let todo = state.todosArr.find(t => t.id === check_id);
        if (todo) {
            todo.isCompleted = checkedValue;
        }
        snackBar("Todo status updated", "success");
    }
    catch (err) {
        snackBar(err.message, 'error');
    }
    finally {
        handleSpinner(false);
    }
}
//Delete
async function onTodoRemove(ele) {
    let remove_Id = ele.closest('li').id;
    let remove_url = `${base_url}/todocrud2/${remove_Id}.json`;
    let getConfirm = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    })
    if (getConfirm.isConfirmed) {
        try {
            handleSpinner(true)
            let res = await fetch(remove_url, {
                method: "DELETE",
            })
            if (!res.ok) {
                throw new Error(err);
            }
            // let data = await res.json();
            let getIndex = state.todosArr.findIndex(t => t.id === remove_Id);
            cl(getIndex);
            state.todosArr.splice(getIndex, 1);
            ele.closest('li').remove();
            snackBar("Todo deleted successfully", 'success');

        }
        catch (err) {
            snackBar(err.message, 'error');
        }
        finally {
            handleSpinner(false)
        }
    }
}


todoForm.addEventListener('submit', ontodoSubmit);
updateTodoBtn.addEventListener('click', onupdateTodo);