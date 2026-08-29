import axios from 'axios'

const api = axios.create({
    // baseURL: import.meta.env.DEV
    //     ? 'http://localhost:3000'
    //     : '/api',

    baseURL: import.meta.env.DEV
        ? 'http://localhost:3000'
        : 'https://day02-leetcode-auth-backend.onrender.com',

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