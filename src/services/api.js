import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.DEV
        ? 'http://localhost:3000'
        : '/api',

    withCredentials: true,
})

export default api



// import axios from 'axios'

// const api = axios.create({
//     baseURL: 'http://localhost:3000',
//     withCredentials: true,

//     headers: {
//         'Cache-Control': 'no-cache',
//         'Pragma': 'no-cache'
//     }
// })

// export default api