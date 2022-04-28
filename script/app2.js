let btnEnter = document.body.querySelector('.enter');
let btnReg = document.body.querySelector('.reg');
let btnExit = document.body.querySelector('#exit');
let newForm = document.body.querySelector('.newForm');
let form = document.body.querySelector('.newForm form');
let form2 = document.body.querySelector('.registration form');
let userName = document.body.querySelector('#username');
let password = document.body.querySelector('#password');
let inputLogin = document.body.querySelector('#regLogin input');
let inputPassword = document.body.querySelector('#regPassword input');

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

}

btnEnter.addEventListener('click', function (event) {
    if (userName.value !== "" && password.value !== "") {
        event.preventDefault();
        checkUser(db);
    }

});

btnReg.addEventListener('click', function (event) {
    event.preventDefault();
    newForm.removeAttribute('id');
    form.classList.add('animateIn');
    form2.classList.add('animateOut');
});
btnExit.addEventListener('click', function (event) {
    event.preventDefault();
    newForm.id = "vision";
    form2.classList.remove('animateOut');
    form2.classList.add('animateIn');
})



let btnCreate = document.body.querySelector('#createAccount');
let btnClear = document.body.querySelector('#clearForm');

btnCreate.addEventListener('click', function (event) {
    if (inputLogin.value !== "" && inputPassword.value !== "") {
        event.preventDefault();
        checkCorrect(db);

    }

})

const addUser = (db, newUser, passwordUser) => {
    // Запустим транзакцию базы данных и получим хранилище объектов Notes
    let tx = db.transaction(['users'], 'readwrite');
    let users = tx.objectStore('users');
    // Добавляем заметку в хранилище объектов
    let user = {id: Date.now(), userName: newUser.toLowerCase(), password: passwordUser};
    users.add(user);
    newForm.id = "vision";
    form2.classList.remove('animateOut');
    form2.classList.add('animateIn');
    // Ожидаем завершения транзакции базы данных
    tx.oncomplete = () => {

    }
    tx.onerror = (event) => {
        alert('error storing note ' + event.target.errorCode);
    }

}
const checkCorrect = (db) => {

    let tx = db.transaction(['users'], 'readonly');
    let store = tx.objectStore('users');
    let request = store.openCursor();
    let res = "false";
    request.onsuccess = (event) => {
        // Результатом req.onsuccess в запросах openCursor является
        // IDBCursor
        let cursor = event.target.result;
        if (cursor != null) {
            // Если курсор не нулевой, мы получили элемент.
            if (cursor.value.userName.toLowerCase() === inputLogin.value.toLowerCase()) {
                res = "true";
                let err = document.body.querySelector('.newForm .checkUser');
                err.style.opacity = "1";
                setTimeout(function () {
                    err.style.opacity = "0";
                }, 1000);
            }
            cursor.continue();
        } else {
            // Если у нас нулевой курсор, это означает, что мы получили все данные
            if (res === "false") {
                addUser(db, inputLogin.value, inputPassword.value);

            }
        }

    }
    request.onerror = (event) => {
        alert('error in cursor request ' + event.target.errorCode);
    }
}

const checkUser = (db) => {

    let tx = db.transaction(['users'], 'readonly');
    let store = tx.objectStore('users');
    let request = store.openCursor();
    let res = "false";
    request.onsuccess = (event) => {
        // Результатом req.onsuccess в запросах openCursor является
        // IDBCursor
        let cursor = event.target.result;
        if (cursor != null) {
            // Если курсор не нулевой, мы получили элемент.
            if (cursor.value.userName === userName.value.toLowerCase() && cursor.value.password === password.value) {
                updateStatusUser(userName.value);
                document.location = '../ToDoProject/toDo.html';
                res = "true";
            }
            cursor.continue();
        } else {
            // Если у нас нулевой курсор, это означает, что мы получили все данные
            if (res === "false") {
                let err = document.body.querySelector('.registration .checkUser');
                err.style.opacity = "1";
                setTimeout(function () {
                    err.style.opacity = "0";
                }, 1000);

            }
        }

    }
    request.onerror = (event) => {
        alert('error in cursor request ' + event.target.errorCode);
    }
}

function updateStatusUser(login) {

    localStorage.setItem("1", login.toLowerCase());

}

btnClear.addEventListener('click', function (event) {
    event.preventDefault();
    inputLogin.value = "";
    inputPassword.value = "";

})



