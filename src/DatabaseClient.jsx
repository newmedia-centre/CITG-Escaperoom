export const auth = async () => {

    // get the token from the api server, log in using the project specific account
    const response = await fetch(import.meta.env.VITE_DB_SITE + '/auth/login', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: import.meta.env.VITE_DB_USERNAME,
            password: import.meta.env.VITE_DB_PASSWORD,
        }),
    })

    // return the token used to authenticate with the server
    const data = await response.json()
    return data.token
}

export const read = async (user, token) => {
    const response = await fetch(import.meta.env.VITE_DB_SITE + '/project/citg-er/data?' + new URLSearchParams({
        filter: JSON.stringify({
            id: user
        }),
    }), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })

    // return the data
    const data = response.json()
    return data[0]
}

export const add = async (user, data, token) => { // user = unique id, data = serializable object, token = bearer token from auth()
    const response = await fetch(import.meta.env.VITE_DB_SITE + '/project/citg-er/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            data: {
                id: user,
                ...data
            }
        }),
    })

    return response.status === 200
} // returns bool

export const update = async (user, data, token) => { // user = unique id, data = serializable object, token = bearer token from auth()
    const response = await fetch(import.meta.env.VITE_DB_SITE + '/project/citg-er/data', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            filter: {
                id: user
            },
            data: {
                id: user,
                ...data
            }
        }),
    })

    return response.status === 200
} // returns bool

export const remove = async (user, token) => { // user = unique id, data = serializable object, token = bearer token from auth()
    const response = await fetch(import.meta.env.VITE_DB_SITE + '/project/citg-er/data', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            filter: {
                id: user
            }
        }),
    })

    return response.status === 200
} // returns bool

export default {
    auth,
    read,
    add,
    update,
    remove
}
