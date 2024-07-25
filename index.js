"use strict"

window.onload = async function() {
    App()
}

async function App() {
    let users = [];
    let backup = []
    let searchRes = []
    let hidden = []
    let currPage = 1;
    const rate = document.querySelector('.sort__option--rate')
    const date = document.querySelector('.sort__option--date')
    const clear = document.querySelector('.clear')
    const search = document.querySelector('.search__input')
    const modal = document.querySelector('.modal')
    const confirm = document.querySelector('.confirm')
    const decline = document.querySelector('.decline')
    const back = document.querySelector('.page__back')
    const forward = document.querySelector('.page__forward')


    let sortRate = false
    let sortDate = false
    search.value = ''

    await getData()    
    sortByDate()
    sortByRate()
    hideUser()
    searchUser()
    clearFilter()
    navigateBtns()
    renderPage()

    
    async function getData() {
        try {
            const response = await fetch('https://5ebbb8e5f2cfeb001697d05c.mockapi.io/users');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            backup = await response.json();
            users = [...backup]
            renderUsers(users)
        } catch(err) {
            console.error(err);
        }
    }

    function lastPage() {
        let result
        if (searchRes.length > 0) { 
            result = searchRes.length / 5
        } else {
            result = users.length / 5
        }
        return Math.ceil(result)
    }

    function searchUser() {
        search.addEventListener('input', () => {
            clear.classList.add('visible')
            if(!search.value) {
                if (!rate.classList.contains('active') && !date.classList.contains('active')) clear.classList.remove('visible')
                searchRes = []
                renderUsers(users);
                return;
            };
            const searchReg = new RegExp('.*' + search.value.toLowerCase() + '.*')
            searchRes = users.filter((user) => searchReg.test(user.email.toLowerCase()) || searchReg.test(user.username.toLowerCase()))
            currPage = 1;
            renderPage()
            renderUsers(searchRes)
        })

    }

    function clearFilter() {
        clear.addEventListener('click', async () => {
            clear.classList.remove('visible')
            date.classList.remove('active')
            rate.classList.remove('active')
            searchRes = []
            search.value = ''
            sortRate = false
            sortDate = false
            users = [...backup].filter((user) => !hidden.includes(user.id))
            renderUsers(users)
        })
    }
    
    function hideUser() {
        const close = document.querySelectorAll('.user__delete')
        close.forEach((btn) => {
            btn.addEventListener('click', () => {
                deleteConfirm(btn.id)
            })
        })
    }

    function deleteConfirm(id) {
        modal.classList.remove('hidden')
        confirm.addEventListener('click', () => {
            hidden.push(id)
            if (searchRes.length > 0) {
                searchRes = searchRes.filter((user) => user.id != id)
                users = users.filter((user) => user.id != id)
                renderUsers(searchRes)
                modal.classList.add('hidden')
                return;
            }
            users = users.filter((user) => user.id != id)
            renderUsers(users)
            modal.classList.add('hidden')
        })
        decline.addEventListener('click', () => modal.classList.add('hidden'))
    }
    
    function sortRating(array) {
        let result
        if (sortRate) {
            result = array.sort((a,b) => {
                return a.rating - b.rating
            })
            sortRate = false
        } else {
            result = array.sort((a,b) => {
                return b.rating - a.rating
            })
            sortRate = true
        }
        sortDate = false;
        return result
    }

    function sortByRate() {
        rate.addEventListener('click', () => {
            clear.classList.add('visible')
            date.classList.remove('active')
            rate.classList.add('active')
            let result 
            if(searchRes.length > 0) {
                result = sortRating(searchRes)
            } else {
                search.value = ''
                result = sortRating(users)
            }
            renderUsers(result)
        })
    }
    
    function sortRegistration(array) {
        let result;
        if(sortDate) {
            result = array.sort((a, b) => {
                return new Date(a.registration_date) - new Date(b.registration_date)
            })
            sortDate = false
        } else {
            result = array.sort((a, b) => {
                return new Date(b.registration_date) - new Date(a.registration_date)
            })
            sortDate = true
        } 
        sortRate = false;
        return result;

    }

    function sortByDate() {
        date.addEventListener('click', () => {
            clear.classList.add('visible')
            rate.classList.remove('active')
            date.classList.add('active')
            let result 
            if(searchRes.length > 0) {
                result = sortRegistration(searchRes)
            } else {
                search.value = ''
                result = sortRegistration(users)
            }
            renderUsers(result)
        })
    }

    function pagination(usersArray) {
        return usersArray.slice((currPage-1) * 5, currPage * 5)
    }

    function renderPage() {
        const pageNumber = document.querySelector('.page__number')
        pageNumber.remove()
        back.insertAdjacentHTML('afterend', `
        <p class="page__number">${currPage}</p>
        `)
    }

    function navigateBtns() {
        back.addEventListener('click', () => {
            if (currPage > 1) {
                currPage--;
                renderPage()
                renderUsers(searchRes.length > 0 ? searchRes : users)
            } else {
                return
            }
            
        })

        forward.addEventListener('click', () => {
            if (currPage < lastPage()) {
                currPage++;
                renderPage()
                renderUsers(searchRes.length > 0 ? searchRes : users)
            } else {
                return
            }
        })

    }
    
    function renderUsers(renderUsers) {
        const existingUsers = document.querySelectorAll('.user')
        if (existingUsers){
            existingUsers.forEach((user) => {
                user.remove()
            })
        }
        let pageOfUsers = pagination(renderUsers)
        for (let user of pageOfUsers) {
            let date = new Date(user.registration_date)
            document.querySelector('.list__table').insertAdjacentHTML('beforeend', `
            <div class="table__item user">
                <p class="user__name">${user.username}</p>
                <p class="user_email">${user.email}</p>
                <p class="user__date">${date.toLocaleTimeString() + ' / ' + date.toLocaleDateString()}</p>
                <p class="user__rate">${user.rating}</p>
                <span class="user__delete" id="${user.id}"></span>
            </div>
            `)
        }
        hideUser()
    }
    
}

