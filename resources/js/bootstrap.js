import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Only initialize Echo if Pusher credentials are available
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

if (pusherKey && pusherCluster) {
    window.Pusher = Pusher;

    // Try to grab CSRF token from meta tags if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: pusherCluster,
        forceTLS: true,
        withCredentials: true,
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}
        }
    });
} else {
    console.warn('Pusher configuration is missing. Real-time updates will not be available.');
}
