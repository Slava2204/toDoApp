//Selectors
const todoInput = document.querySelector('.todo-input');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');
let user = document.body.querySelector('#user');
user.textContent = localStorage.getItem("1");
let btnLogOut = document.body.querySelector('#logOut');
let noCompleteScore = document.body.querySelector('.noCompleteScore');
let completedScore = document.body.querySelector('.completedScore');
let deletedScore = document.body.querySelector('.deletedScore');
let score1 = 0;
let score2 = 0;
let score3 = 0;

//Event Listener
filterOption.addEventListener('change', filterTodo);
todoList.addEventListener('click', updateResult);
btnLogOut.addEventListener('click', function () {
    document.location = '../ToDoProject/index.html';
    localStorage.clear();
})

//indexedDB
let db;
let dbReq = indexedDB.open('todoNotes', 1);
dbReq.onupgradeneeded = (event) => {
    // Зададим переменной db ссылку на базу данных
    db = event.target.result;
    // Создадим хранилище объектов с именем notes.
    let notes = db.createObjectStore('notes', {autoIncrement: true});
    let users = db.createObjectStore('users', {autoIncrement: true});
}
dbReq.onerror = (event) => {
    alert('error opening database ' + event.target.errorCode);
}
dbReq.onsuccess = (event) => {
    db = event.target.result;
    getAndDisplayNotes(db);

}

// functions

const addStickyNote = (db, message, message2, userName, createDate, deadline) => {
    // Запустим транзакцию базы данных и получим хранилище объектов Notes
    let tx = db.transaction(['notes'], 'readwrite');
    let store = tx.objectStore('notes');
    let tx1 = db.transaction(['users'], 'readwrite');
    let store1 = tx1.objectStore('users');
    // Добавляем заметку в хранилище объектов
    let note = {
        id: Date.now(),
        todoInfo: message,
        status: message2,
        userID: userName,
        createDate: createDate,
        deadline: deadline,
        completeToDo: "Not complete"
    };
    store.add(note);
    // Ожидаем завершения транзакции базы данных
    tx.oncomplete = () => {
        getAndDisplayNotes(db);
    }
    tx.onerror = (event) => {
        alert('error storing note ' + event.target.errorCode);
    }
    tx1.oncomplete = () => {

    }
    tx1.onerror = (event) => {
        alert('error storing note ' + event.target.errorCode);
    }
}

const submitNote = (event) => {
    const days = document.body.querySelector('#days input');
    if (todoInput.value !== '' && Number(days.value) < 31) {

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        mm = Number(mm);
        today = dd + '/' + mm + '/' + yyyy;

        let daysValue = days.value;
        let deadline = new Date();
        let dd1 = String(deadline.getDate()).padStart(2, '0');
        dd1 = Number(daysValue) + Number(dd1);
        let mm1 = String(deadline.getMonth() + 1).padStart(2, '0');
        mm1 = Number(mm1);
        let yyyy1 = deadline.getFullYear();
        if (dd1 > Number(30)) {
            dd1 -= Number(30);
            mm1 += 1;
            if (mm1 > Number(12)) {
                mm1 -= 12;
                yyyy1 = Number(yyyy1) + Number(1);
            }
        }
        deadline = dd1 + '/' + mm1 + '/' + yyyy1;
        addStickyNote(db, todoInput.value, 'uncompleted', user.textContent, today, deadline);
        todoInput.value = '';


    } else {
        if(Number(days.value) > 31)
        alert("не больше 30 дней на выполнение");
        event.preventDefault();

    }

}

const getAndDisplayNotes = (db) => {

    let tx = db.transaction(['notes'], 'readonly');
    let store = tx.objectStore('notes');
    let req = store.openCursor();
    let allNotes = [];
    req.onsuccess = (event) => {
        // Результатом req.onsuccess в запросах openCursor является
        // IDBCursor
        let cursor = event.target.result;
        if (cursor != null) {
            // Если курсор не нулевой, мы получили элемент.
            if (cursor.value.status === "uncompleted" && cursor.value.userID === user.textContent.toLowerCase())
                score1 += 1;
            if (cursor.value.status === "completed" && cursor.value.userID === user.textContent.toLowerCase())
                score2 += 1;
            if (cursor.value.status === "trash" && cursor.value.userID === user.textContent.toLowerCase())
                score3 += 1;
            if (cursor.value.status !== "trash" && cursor.value.userID === user.textContent.toLowerCase()) {
                allNotes.push(cursor.value);
            }

            cursor.continue();
        } else {
            // Если у нас нулевой курсор, это означает, что мы получили
            // все данные, потому отображаем заметки, которые мы получили.
            displayNotes(allNotes);
            noCompleteScore.textContent = "No complete: " + score1;
            completedScore.textContent = "Completed: " + score2;
            deletedScore.textContent = "Deleted: " + score3;
        }

    }
    req.onerror = (event) => {
        alert('error in cursor request ' + event.target.errorCode);
    }
}

const displayNotes = (notes) => {

    for (let i = 0; i < notes.length; i++) {
        const todoDiv = document.createElement('div');
        const todoLi = document.createElement('li');

        //complete button
        const completeButton = document.createElement('button');

        //trash button
        const trashButton = document.createElement('button');


        todoDiv.classList.add('todo');
        todoDiv.classList.add(notes[i].status);
        todoDiv.id = notes[i].id;
        todoLi.innerText = notes[i].todoInfo + "\n Created: " + notes[i].createDate +
            "\n DeadLine: " + notes[i].deadline + "\n Completed: " + notes[i].completeToDo;
        todoLi.classList.add('todo-item');

        //complete button
        completeButton.innerHTML = '<i class="check"></i>';
        completeButton.classList.add("complete-btn");

        //trash button
        trashButton.innerHTML = '<i class="trash"></i>';
        trashButton.classList.add("trash-btn");

        if (notes[i].status !== "trash") {
            todoDiv.classList.add(notes[i].status)
        }
        todoDiv.appendChild(todoLi);
        todoDiv.appendChild(completeButton);
        todoDiv.appendChild(trashButton);

        //append case
        todoList.appendChild(todoDiv);
        let date = notes[i].createDate.split('/');
        let date2 = notes[i].deadline.split('/');
        for (let i = 0; i < date.length; i++) {
            date[i] = Number(date[i]);
            date2[i] = Number(date2[i]);
        }
        if (date2[1] === date[1]) {
            if (date2[0] - date[0] < 2) {
                todoDiv.style.backgroundColor = "#b60303";
            } else if (date2[0] - date[0] < 5) {
                todoDiv.style.backgroundColor = "#b26d0d";
            } else {
                todoDiv.style.backgroundColor = "#81b75b";
            }
        } else {
            if (date2[0] + 30 - date[0] < 2) {
                todoDiv.style.backgroundColor = "#b60303";
            } else if (date2[0] + 30 - date[0] < 5) {
                todoDiv.style.backgroundColor = "#b26d0d";
            } else {
                todoDiv.style.backgroundColor = "#81b75b";
            }
        }

        noCompleteScore.textContent = "No complete: " + score1;
        completedScore.textContent = "Completed: " + score2;
        deletedScore.textContent = "Deleted: " + score3;
    }
}

function updateResult(e) {
    const item = e.target;
    const transaction = db.transaction(['notes'], 'readwrite');
    const objectStore = transaction.objectStore('notes');
    const todo = item.parentElement;


    objectStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            let note = todo.childNodes[0];
            let completeDay = new Date();
            let dd = String(completeDay.getDate()).padStart(2, '0');
            let mm = String(completeDay.getMonth() + 1).padStart(2, '0');
            let yyyy = completeDay.getFullYear();
            if (cursor.value.id === Number(todo.id)) {
                const updateData = cursor.value;
                if (item.classList[0] === "complete-btn") {
                    if (todo.className === 'todo uncompleted') {
                        updateData.status = 'completed';
                        completeDay = mm + '/' + dd + '/' + yyyy;
                        updateData.completeToDo = completeDay;
                        todo.className = "todo completed";
                        note.innerText = updateData.todoInfo + "\n Created: " + updateData.createDate +
                            "\n DeadLine: " + updateData.deadline + "\n Completed: " + updateData.completeToDo;
                        score2 += 1;
                        score1 -= 1;
                    } else {
                        todo.className = "todo uncompleted";
                        updateData.completeToDo = "Not Complete";
                        updateData.status = 'uncompleted';
                        note.innerText = updateData.todoInfo + "\n Created: " + updateData.createDate +
                            "\n DeadLine: " + updateData.deadline + "\n Completed: Not complete";
                        score1 += 1;
                        score2 -= 1;
                    }

                }
                //delete case
                if (item.classList[0] === "trash-btn") {
                    if (updateData.status === "completed") {
                        score2 -= 1;
                        score3 += 1;
                    }
                    if (updateData.status === "uncompleted") {
                        score1 -= 1;
                        score3 += 1;
                    }
                    updateData.status = 'trash';

                    //animation
                    todo.classList.add("fall");
                    todo.addEventListener('transitionend', function () {
                        todo.remove();
                    })

                }
                cursor.update(updateData);

            }

            cursor.continue();
        }
        noCompleteScore.textContent = "No complete: " + score1;
        completedScore.textContent = "Completed: " + score2;
        deletedScore.textContent = "Deleted: " + score3;

    };
}

function filterTodo(e) {
    const todos = todoList.childNodes;
    todos.forEach(function (filterNotes) {
        switch (e.target.value) {
            case "all":
                if (filterNotes.classList.contains("todo"))
                    filterNotes.style.display = "flex";
                break;
            case "completed":
                if (filterNotes.classList.contains("completed")) {
                    filterNotes.style.display = "flex";
                } else {
                    filterNotes.style.display = "none";
                }
                break;
            case "uncompleted":
                if (!filterNotes.classList.contains("completed")) {
                    filterNotes.style.display = "flex";
                } else {
                    filterNotes.style.display = "none";
                }
                break;
        }
    })
}