import axios from 'axios';

const api = axios.create({
  baseURL: '/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

let isRefreshing = false

let failedQueue = []

const processQueue = (error, token= null) => {
    failedQueue.forEach(({resolve, reject}) => {
        if(error){
            reject(error)
        }
        else{
            resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          '/api/auth/token/refresh/',
          { refresh: refreshToken }
        )

        const { access, refresh } = response.data

        localStorage.setItem('access_token', access)
        if (refresh) {
          localStorage.setItem('refresh_token', refresh)
        }

        originalRequest.headers.Authorization = `Bearer ${access}`

        processQueue(null, access)

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api