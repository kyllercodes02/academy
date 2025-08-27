import React, { useEffect, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import toast, { Toaster } from 'react-hot-toast';
import {
    Home,
    Users,
    UserCheck,
    Shield,
    GraduationCap,
    Megaphone,
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
    ChevronLeft
} from 'lucide-react';
import cn from 'classnames';

// Initialize Pusher and Echo (if needed elsewhere)
if (typeof window !== 'undefined' && !window.Pusher) {
    window.Pusher = Pusher;
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        },
    });
}

export default function AdminLayout({ children }) {
    const { auth, url, notifications: initialNotifications = [] } = usePage().props;
    const today = format(new Date(), 'eeee, MMMM d, yyyy');
    const [notifications, setNotifications] = useState(initialNotifications);
    const [notificationCount, setNotificationCount] = useState(initialNotifications.filter(n => !n.read_at).length);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({ users: false });
    const [showNotifications, setShowNotifications] = useState(false);
    const [debugMode, setDebugMode] = useState(false); // Debug mode for route testing
    const pusherRef = React.useRef(null);
    const channelRef = React.useRef(null);

    // Enhanced navigation structure with grouping
    const navigation = [
        { 
            name: 'Dashboard', 
            href: route('admin.dashboard'), 
            routeName: 'admin.dashboard', 
            icon: Home,
            type: 'single'
        },
        {
            name: 'Users',
            icon: Users,
            type: 'group',
            key: 'users',
            children: [
                { name: 'All Users', href: route('admin.users.index'), routeName: 'admin.users.index', icon: Users },
                { name: 'Teachers', href: route('admin.teachers.index'), routeName: 'admin.teachers.index', icon: UserCheck },
                { name: 'Guardians', href: route('admin.guardians.index'), routeName: 'admin.guardians.index', icon: Shield },
            ]
        },
        { 
            name: 'Students', 
            href: route('admin.students.index'), 
            routeName: 'admin.students.index', 
            icon: GraduationCap,
            type: 'single'
        },
        { 
            name: 'Announcements', 
            href: route('admin.announcements.index'), 
            routeName: 'admin.announcements.index', 
            icon: Megaphone,
            type: 'single'
        },
        { 
            name: 'Attendance', 
            href: route('admin.attendance.index'), 
            routeName: 'admin.attendance.index', 
            icon: Calendar,
            type: 'single'
        },
        { 
            name: 'Schedules', 
            href: route('admin.schedules.index'), 
            routeName: 'admin.schedules.index', 
            icon: Clock,
            type: 'single'
        },
        { 
            name: 'Settings', 
            href: route('admin.settings.index'), 
            routeName: 'admin.settings.index', 
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
                
                // For dashboard, also check if we're at the root admin path
                if (routeName === 'admin.dashboard' && (cleanCurrentPath === '/admin' || cleanCurrentPath === '/admin/')) {
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

    const isGroupActive = (group) => {
        if (!group.children) return false;
        return group.children.some(child => isActive(child.routeName, child.href));
    };

    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: !prev[groupKey]
        }));
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

    const NavGroup = ({ group }) => {
        const isExpanded = expandedGroups[group.key];
        const groupActive = isGroupActive(group);
        const Icon = group.icon;
        
        // Auto-expand group if any child is active
        React.useEffect(() => {
            if (groupActive && !isExpanded) {
                setExpandedGroups(prev => ({
                    ...prev,
                    [group.key]: true
                }));
            }
        }, [groupActive, isExpanded, group.key]);
        
        return (
            <div className="space-y-1">
                <button
                    onClick={() => toggleGroup(group.key)}
                    className={cn(
                        "w-full flex items-center space-x-3 rounded-lg font-medium transition-all duration-200 group",
                        isSidebarCollapsed ? "justify-center px-2 py-3" : "px-4 py-3",
                        groupActive
                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                            : 'hover:bg-blue-50 text-gray-700 hover:text-blue-700'
                    )}
                >
                    <Icon 
                        size={isSidebarCollapsed ? 20 : 18} 
                        className={cn(
                            "transition-colors duration-200 flex-shrink-0",
                            groupActive 
                                ? "text-blue-700" 
                                : "text-blue-600 group-hover:text-blue-700"
                        )} 
                    />
                    {!isSidebarCollapsed && (
                        <>
                            <span className={cn(
                                "flex-1 text-left transition-all duration-200",
                                groupActive ? "font-semibold" : ""
                            )}>
                                {group.name}
                            </span>
                            <div className="transition-transform duration-200">
                                {isExpanded ? (
                                    <ChevronUp size={16} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={16} className="text-gray-400" />
                                )}
                            </div>
                        </>
                    )}
                </button>
                {!isSidebarCollapsed && (
                    <div className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                        <div className="space-y-1 pt-1">
                            {group.children.map((child) => (
                                <NavItem
                                    key={child.name}
                                    href={child.href}
                                    routeName={child.routeName}
                                    icon={child.icon}
                                    isChild={true}
                                >
                                    {child.name}
                                </NavItem>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const formatTime = (time) => {
        if (!time) return '-';
        const timeString = `2000-01-01T${time}`;
        const zonedDate = utcToZonedTime(new Date(timeString), 'Asia/Manila');
        return format(zonedDate, 'h:mm a', { timeZone: 'Asia/Manila' });
    };

    // Auto-expand groups with active children on mount
    useEffect(() => {
        const newExpandedGroups = { ...expandedGroups };
        navigation.forEach((item) => {
            if (item.type === 'group' && item.children) {
                const hasActiveChild = item.children.some(child => isActive(child.routeName, child.href));
                if (hasActiveChild) {
                    newExpandedGroups[item.key] = true;
                }
            }
        });
        setExpandedGroups(newExpandedGroups);
    }, []); // Only run on mount

    useEffect(() => {
        // Clean up previous listeners
        let channel;
        if (window.Echo && auth?.user?.id) {
            channel = window.Echo.private(`App.Models.Admin.${auth.user.id}`);
            channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (newNotification) => {
                const type = newNotification.type || (newNotification.data && newNotification.data.type);
                if (type === 'security_alert') {
                    const notificationForState = newNotification.data ? newNotification : { ...newNotification, data: newNotification };
                    setNotifications(prevNotifications => [notificationForState, ...prevNotifications]);
                    setNotificationCount(prevCount => prevCount + 1);
                    setShowNotifications(true); // Open the dropdown on real-time alert
                    toast.error('Security Alert: Possible fake student detected!');
                }
            });
        }
        return () => {
            if (window.Echo && auth?.user?.id) {
                window.Echo.leave(`private-App.Models.Admin.${auth.user.id}`);
            }
        };
    }, [auth?.user?.id]);

    const handleNotificationClick = () => {
        setShowNotifications(prev => !prev);
        if (!showNotifications && notificationCount > 0) {
            router.post('/admin/notifications/mark-read', {}, {
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

    // Fetch notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/admin/notifications/fetch');
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications || []);
                    setNotificationCount(data.unread_count || 0);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        // Fetch notifications on mount
        fetchNotifications();

        // Set up interval to fetch notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-gray-800 truncate">
                                    {auth?.user?.name || 'John Doe'}
                                </h2>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                        </div>
                    )}
                    {/* Navigation */}
                    <nav className={cn(
                        "space-y-2 transition-all duration-300",
                        isSidebarCollapsed ? "px-2 py-4" : "px-4 py-6"
                    )}>
                        {navigation.map((item) => (
                            item.type === 'group' ? (
                                <NavGroup key={item.key} group={item} />
                            ) : (
                                <NavItem
                                    key={item.name}
                                    href={item.href}
                                    routeName={item.routeName}
                                    icon={item.icon}
                                >
                                    {item.name}
                                </NavItem>
                            )
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
                                    const currentItem = navigation.find(item => {
                                        if (item.type === 'group' && item.children) {
                                            return item.children.some(child => isActive(child.routeName, child.href));
                                        }
                                        return isActive(item.routeName, item.href);
                                    });
                                    
                                    if (currentItem) {
                                        if (currentItem.type === 'group') {
                                            const activeChild = currentItem.children.find(child => 
                                                isActive(child.routeName, child.href)
                                            );
                                            return activeChild ? activeChild.name : currentItem.name;
                                        }
                                        return currentItem.name;
                                    }
                                    return 'Dashboard';
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
                        
                        {/* Debug Toggle - Only show in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <button
                                onClick={() => setDebugMode(!debugMode)}
                                className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-xs font-medium transition-colors"
                                title="Toggle Route Debug"
                            >
                                {debugMode ? 'Hide Debug' : 'Show Debug'}
                            </button>
                        )}
                        
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
                            {/* Force dropdown to always render for debugging */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                    <div className="p-4 border-b font-bold text-gray-700">Notifications</div>
                                    <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                                        {notifications.length === 0 ? (
                                            <li className="p-4 text-gray-500">No notifications</li>
                                        ) : notifications.map((n) => (
                                            <li key={n.id} className="p-4 hover:bg-gray-50">
                                                {n.data?.type === 'security_alert' && (
                                                    <div>
                                                        <div className="font-semibold text-red-600">Security Alert: Possible Fake Student</div>
                                                        <div className="text-gray-700 text-sm mt-1">Student: <span className="font-bold">{n.data.name}</span></div>
                                                        <div className="text-gray-700 text-sm">Grade: {n.data.grade_level}, Section: {n.data.student_section}</div>
                                                        <div className="text-gray-500 text-xs mt-1">{new Date(n.data.time).toLocaleString()}</div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* Logout Button */}
                        <Link
                            href={route('admin.logout')}
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
                    {/* Debug Panel - Only show in development */}
                    {debugMode && process.env.NODE_ENV === 'development' && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-yellow-800">Route Debug Info</h3>
                                <button
                                    onClick={() => setDebugMode(false)}
                                    className="text-yellow-600 hover:text-yellow-800"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="text-sm text-yellow-700 space-y-1">
                                <div><strong>Current Path:</strong> {window.location.pathname}</div>
                                <div><strong>Current Route:</strong> {window.location.pathname}</div>
                                <div><strong>Navigation Items:</strong></div>
                                <ul className="ml-4 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name} className="text-xs">
                                            {item.name}: {isActive(item.routeName, item.href) ? '✅ Active' : '❌ Inactive'}
                                            {item.type === 'group' && item.children && (
                                                <ul className="ml-4">
                                                    {item.children.map((child) => (
                                                        <li key={child.name} className="text-xs">
                                                            └ {child.name}: {isActive(child.routeName, child.href) ? '✅ Active' : '❌ Inactive'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 space-x-2">
                                    <button
                                        onClick={() => window.location.href = route('admin.dashboard')}
                                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                    >
                                        Test Dashboard
                                    </button>
                                    <button
                                        onClick={() => window.location.href = route('admin.students.index')}
                                        className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                    >
                                        Test Students
                                    </button>
                                    <button
                                        onClick={() => window.location.href = route('admin.users.index')}
                                        className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
                                    >
                                        Test Users
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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