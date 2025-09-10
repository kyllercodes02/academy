import React, { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';

export default function NotificationsDropdown({ initialNotifications = [], adminId }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(initialNotifications.filter(n => !n.read_at).length);
    const dropdownRef = useRef(null);

    const toggle = () => setOpen(prev => !prev);

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/admin/notifications/fetch');
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Poll fallback (10s)
        const intv = setInterval(fetchNotifications, 10000);
        return () => clearInterval(intv);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Real-time subscription
    useEffect(() => {
        if (window.Echo) {
            try {
                // Prefer private user notifications channel if available
                if (adminId) {
                    const privateChannel = window.Echo.private(`App.Models.User.${adminId}`);
                    privateChannel.notification((notification) => {
                        const newItem = { id: Date.now().toString(), data: notification, read_at: null, created_at: new Date().toISOString() };
                        setNotifications(prev => [newItem, ...prev].slice(0, 20));
                        setUnreadCount(prev => prev + 1);
                    });
                }
                // Also listen to public broadcast channel as a fallback
                const publicChannel = window.Echo.channel('admin.notifications');
                publicChannel.listen('.AlertBroadcasted', (payload) => {
                    const newItem = { id: Date.now().toString(), data: payload, read_at: null, created_at: new Date().toISOString() };
                    setNotifications(prev => [newItem, ...prev].slice(0, 20));
                    setUnreadCount(prev => prev + 1);
                });
            } catch (e) {
                console.warn('Echo subscription failed', e);
            }
        }
    }, [adminId]);

    const markAsRead = async (id) => {
        try {
            await axios.post(`/admin/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error('Failed to mark as read', e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/admin/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (e) {
            console.error('Failed to mark all as read', e);
        }
    };

    const relativeTime = (iso) => {
        if (!iso) return '';
        const diff = (Date.now() - new Date(iso).getTime()) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
        return `${Math.floor(diff/86400)}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={toggle} className="group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-blue-50 transition-all duration-300 text-gray-600 hover:text-blue-600 relative">
                <Bell size={18} className="text-blue-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {unreadCount}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="p-3 flex items-center justify-between border-b">
                        <div className="font-semibold text-gray-700">Notifications</div>
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
                    </div>
                    <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                            <li className="p-4 text-gray-500">No notifications</li>
                        ) : notifications.map((n) => {
                            const title = n.data?.title || 'Alert';
                            const message = n.data?.message || '';
                            const createdAt = n.created_at || null;
                            const isUnread = !n.read_at;
                            return (
                                <li key={n.id} className={`p-3 hover:bg-gray-50 ${isUnread ? 'bg-blue-50' : ''}`}>
                                    <button onClick={() => markAsRead(n.id)} className="w-full text-left">
                                        <div className="flex items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium text-gray-800">{title}</div>
                                                    <div className="text-xs text-gray-400">{relativeTime(createdAt)}</div>
                                                </div>
                                                <div className="text-sm text-gray-600 line-clamp-2">{message}</div>
                                            </div>
                                            {isUnread && <span className="ml-2 mt-1 w-2 h-2 bg-blue-500 rounded-full" />}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}


