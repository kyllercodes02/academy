import React, { useState, useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Link, usePage, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import toast, { Toaster } from 'react-hot-toast';
import {
    Home,
    Users,
    Calendar,
    Clock,
    Settings,
    ChevronUp,
    ChevronDown,
    User,
    PanelLeftOpen,
    PanelLeftClose,
    Bell,
    LogOut,
    ChevronRight,
    ChevronLeft,
    FileText
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

export default function TeacherLayout({ children }) {
    const { auth, url, notifications: initialNotifications = [] } = usePage().props;
    const today = format(new Date(), 'eeee, MMMM d, yyyy');
    const [notifications, setNotifications] = useState(initialNotifications);
    const [notificationCount, setNotificationCount] = useState(initialNotifications.filter(n => !n.read_at).length);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [showNotifications, setShowNotifications] = useState(false);
    const pusherRef = React.useRef(null);
    const channelRef = React.useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.Pusher = Pusher;
            window.Echo = new Echo({
                broadcaster: 'pusher',
                key: import.meta.env.VITE_PUSHER_APP_KEY,
                cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
                forceTLS: true,
                authEndpoint: '/broadcasting/auth',
            });
        }
    }, []);

    // Enhanced navigation structure
    const navigation = [
        { 
            name: 'Dashboard', 
            href: route('teacher.dashboard'), 
            routeName: 'teacher.dashboard', 
            icon: Home,
            type: 'single'
        },
        { 
            name: 'My Students', 
            href: route('teacher.students.index'), 
            routeName: 'teacher.students.index', 
            icon: Users,
            type: 'single'
        },
        { 
            name: 'Attendance', 
            href: route('teacher.attendance.index'), 
            routeName: 'teacher.attendance.index', 
            icon: Calendar,
            type: 'single'
        },
        { 
            name: 'SF2 Reports', 
            href: route('teacher.sf2.index'), 
            routeName: 'teacher.sf2.index', 
            icon: FileText,
            type: 'single'
        },
        { 
            name: 'Settings', 
            href: route('teacher.settings.index'), 
            routeName: 'teacher.settings.index', 
            icon: Settings,
            type: 'single'
        },
    ];

    // Simplified and more reliable isActive function
    const isActive = (routeName, href) => {
        if (!routeName && !href) return false;
        
        const currentPath = window.location.pathname;
        const cleanCurrentPath = currentPath.replace(/\/$/, '');
        
        // Try route name matching first
        if (routeName) {
            try {
                const routePath = route(routeName);
                const cleanRoutePath = routePath.split('?')[0].replace(/\/$/, '');
                
                // Exact match
                if (cleanCurrentPath === cleanRoutePath) {
                    return true;
                }
                
                // For dashboard, also check if we're at the root teacher path
                if (routeName === 'teacher.dashboard' && (cleanCurrentPath === '/teacher' || cleanCurrentPath === '/teacher/')) {
                    return true;
                }
                
                // Starts with match (for nested routes like edit, show, etc.)
                if (cleanCurrentPath.startsWith(cleanRoutePath + '/')) {
                    return true;
                }
            } catch (error) {
                // If route() fails, fall back to href matching
            }
        }
        
        // Fallback to href matching
        if (href) {
            const cleanHref = href.replace(/\/$/, '');
            
            // Exact match
            if (cleanCurrentPath === cleanHref) {
                return true;
            }
            
            // Starts with match (for nested routes)
            if (cleanCurrentPath.startsWith(cleanHref + '/')) {
                return true;
            }
        }
        
        return false;
    };

    const NavItem = ({ href, routeName, icon, children, isChild = false }) => {
        const active = isActive(routeName, href);
        const Icon = icon;
        return (
            <Link
                href={href}
                className={cn(
                    "flex items-center space-x-3 rounded-lg font-medium transition-all duration-200 group relative",
                    isChild ? "px-6 py-2 ml-6" : "px-4 py-3",
                    isSidebarCollapsed && !isChild ? "justify-center px-2" : "",
                    active
                        ? 'bg-blue-700 text-white shadow-lg border-2 border-blue-800' 
                        : 'hover:bg-blue-50 text-gray-700 hover:text-blue-700'
                )}
            >
                {/* Active state indicator */}
                {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-400 rounded-r-full"></div>
                )}
                
                <Icon 
                    size={isSidebarCollapsed && !isChild ? 20 : 18} 
                    className={cn(
                        "transition-colors duration-200 flex-shrink-0",
                        active 
                            ? "text-white" 
                            : "text-blue-600 group-hover:text-blue-700"
                    )} 
                />
                {(!isSidebarCollapsed || isChild) && (
                    <>
                        <span className={cn(
                            "transition-all duration-200",
                            active ? "font-bold" : "",
                            isChild ? "text-sm" : ""
                        )}>
                            {children}
                        </span>
                        {active && (
                            <div className="ml-auto w-3 h-3 bg-yellow-400 rounded-full"></div>
                        )}
                    </>
                )}
            </Link>
        );
    };

    const handleNotificationClick = () => {
        setShowNotifications(prev => !prev);
        if (!showNotifications && notificationCount > 0) {
            router.post('/teacher/notifications/mark-read', {}, {
                onSuccess: () => {
                    setNotificationCount(0);
                    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
                },
                onError: (error) => {
                    console.error('Failed to mark notifications as read:', error);
                }
            });
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white shadow-xl flex flex-col justify-between border-r border-gray-200 transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "w-16" : "w-72"
            )}>
                {/* Header Section */}
                <div className="flex-grow">
                    {/* Profile Section */}
                    {!isSidebarCollapsed && (
                        <div className="flex items-center space-x-3 p-4 border-b border-gray-100 bg-gray-50">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-gray-800 truncate">
                                    {auth?.user?.name || 'Teacher'}
                                </h2>
                                <p className="text-xs text-gray-500">Teacher</p>
                            </div>
                        </div>
                    )}
                    {/* Navigation */}
                    <nav className={cn(
                        "space-y-2 transition-all duration-300",
                        isSidebarCollapsed ? "px-2 py-4" : "px-4 py-6"
                    )}>
                        {navigation.map((item) => (
                            <NavItem
                                key={item.name}
                                href={item.href}
                                routeName={item.routeName}
                                icon={item.icon}
                            >
                                {item.name}
                            </NavItem>
                        ))}
                    </nav>
                </div>
                {/* Help Section */}
                {!isSidebarCollapsed && (
                    <div className="p-4 text-sm border-t border-gray-100 bg-gray-50">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="font-semibold text-gray-700 mb-1">Need Help?</p>
                            <p className="text-gray-500 mb-3 text-xs">Contact IT support for assistance.</p>
                            <a href="#" className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center transition-colors">
                                <span className="underline">View Help Center</span>
                            </a>
                        </div>
                    </div>
                )}

                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1.5 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-50"
                >
                    {isSidebarCollapsed ? (
                        <ChevronRight size={16} className="text-gray-600" />
                    ) : (
                        <ChevronLeft size={16} className="text-gray-600" />
                    )}
                </button>
            </aside>
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <img 
                                src="/images/logo.png" 
                                alt="Zion Academy Logo" 
                                className="h-8 w-8 object-contain"
                            />
                            <span className="text-lg font-bold text-blue-800">Zion Academy</span>
                        </div>
                        
                        {/* Current Page Indicator */}
                        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                            <span>•</span>
                            <span className="font-medium text-gray-700">
                                {(() => {
                                    const currentItem = navigation.find(item => isActive(item.routeName, item.href));
                                    return currentItem ? currentItem.name : 'Dashboard';
                                })()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Date Display */}
                        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                            <Calendar size={16} className="text-blue-600" />
                            <span className="text-gray-600 text-sm font-medium">{today}</span>
                        </div>
                        
                        {/* Notifications */}
                        <div className="relative flex items-center">
                            <button onClick={handleNotificationClick} className="group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-blue-50 transition-all duration-300 text-gray-600 hover:text-blue-600 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                <div className="relative transform transition-transform duration-300 group-hover:scale-110">
                                    <Bell size={18} className="text-blue-600" />
                                </div>
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-pulse">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                    <div className="p-4 border-b font-bold text-gray-700">Notifications</div>
                                    <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                                        {notifications.length === 0 ? (
                                            <li className="p-4 text-gray-500">No notifications</li>
                                        ) : notifications.map((n) => (
                                            <li key={n.id} className="p-4 hover:bg-gray-50">
                                                <div className="text-sm text-gray-700">{n.message || 'New notification'}</div>
                                                <div className="text-gray-500 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* Logout Button */}
                        <Link
                            href={route('teacher.logout')}
                            method="post"
                            as="button"
                            className="group flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-300 text-red-600 hover:text-red-700"
                        >
                            <LogOut size={16} className="transform transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-medium text-sm">Logout</span>
                        </Link>
                    </div>
                </header>
                {/* Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '16px',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#059669',
                        },
                    },
                    error: {
                        style: {
                            background: '#DC2626',
                        },
                    },
                }}
            />
        </div>
    );
} 