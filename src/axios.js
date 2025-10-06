import axios from 'axios';


const instance = axios.create({
  baseURL: 'http://localhost:8080/api', // Đảm bảo .env có REACT_APP_API_URL+

});

instance.interceptors.request.use(
  function (config) {
    const localStorageData = window.localStorage.getItem('persist:men/user');
    if (localStorageData) {
      try {
        const userData = JSON.parse(localStorageData); // Parse JSON từ Redux Persist
        if (userData && userData.token) { // Giả sử token nằm trong userData.token
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Lỗi parse localStorage:', error);
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    return response.data; // Trả về data trực tiếp
  },
  function (error) {
    return Promise.reject(error?.response?.data || error); // Xử lý lỗi chi tiết
  }
);

export default instance;