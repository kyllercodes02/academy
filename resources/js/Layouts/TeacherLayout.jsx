import React, { useState, useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
    Home,
    Calendar,
    BookOpen,
    Bell,
    LogOut,
    Users,
    Menu,
    ChevronLeft,
    ChevronRight,
    User,
    FileText,
    Settings
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Toaster } from 'react-hot-toast';

export default function TeacherLayout({ children }) {
    const { auth, url } = usePage().props;
    const today = format(new Date(), 'eeee, MMMM d, yyyy');
    const [notificationCount, setNotificationCount] = useState(3);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

    const navigation = [
        { name: 'Dashboard', href: route('teacher.dashboard'), routeName: 'teacher.dashboard', icon: Home },
        { name: 'Students', href: route('teacher.students.index'), routeName: 'teacher.students.index', icon: Users },
        { name: 'Attendance', href: route('teacher.attendance.index'), routeName: 'teacher.attendance.index', icon: Calendar },
        { name: 'SF2 Reports', href: route('teacher.sf2.index'), routeName: 'teacher.sf2.index', icon: FileText },
        { name: 'Settings', href: route('teacher.settings.index'), routeName: 'teacher.settings.index', icon: Settings },
    ];

    // Enhanced isActive function with multiple matching strategies
    const isActive = (routeName, href) => {
        if (!routeName && !href) return false;
        
        // Strategy 1: Check if current route matches the route name
        if (routeName) {
            try {
                const routePath = route(routeName);
                const currentPath = window.location.pathname;
                
                const cleanRoutePath = routePath.split('?')[0].replace(/\/$/, '');
                const cleanCurrentPath = currentPath.replace(/\/$/, '');
                
                if (cleanCurrentPath === cleanRoutePath) {
                    return true;
                }
                
                if (cleanCurrentPath.startsWith(cleanRoutePath + '/')) {
                    return true;
                }
            } catch (error) {
                console.warn(`Route ${routeName} not found:`, error);
            }
        }
        
        // Strategy 2: Check if current URL starts with the href
        if (href) {
            const currentPath = window.location.pathname;
            const cleanCurrentPath = currentPath.replace(/\/$/, '');
            const cleanHref = href.replace(/\/$/, '');
            
            if (cleanCurrentPath === cleanHref) {
                return true;
            }
            
            if (cleanCurrentPath.startsWith(cleanHref + '/')) {
                return true;
            }
        }
        
        return false;
    };

    // Navigation item component with enhanced active state
    const NavItem = ({ href, routeName, icon, children }) => {
        const active = isActive(routeName, href);
        
        const Icon = icon;
        
        return (
            <Link
                href={href}
                className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group",
                    active
                        ? 'bg-blue-600 text-white shadow-lg border-l-4 border-blue-800' 
                        : 'hover:bg-blue-50 text-gray-700 hover:text-blue-700 hover:border-l-4 hover:border-blue-200'
                )}
            >
                <Icon 
                    size={18} 
                    className={cn(
                        "transition-colors duration-200",
                        active 
                            ? "text-white" 
                            : "text-blue-600 group-hover:text-blue-700"
                    )} 
                />
                {!isSidebarCollapsed && (
                    <>
                        <span className={active ? "font-semibold" : ""}>{children}</span>
                        {active && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
                        )}
                    </>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen flex bg-[#f5f9ff] text-gray-800">
            {/* Sidebar */}
            <aside 
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-white shadow-lg flex flex-col justify-between border-r transition-all duration-300 ease-in-out",
                    isSidebarCollapsed ? "w-20" : "w-72",
                    "lg:relative lg:translate-x-0",
                    !isSidebarCollapsed && "translate-x-0",
                    isSidebarCollapsed && "-translate-x-0"
                )}
            >
                {/* Profile Section */}
                <div className="flex-grow">
                    <div className={cn(
                        "flex items-center space-x-4 p-5 border-b bg-gradient-to-r from-blue-50 to-white",
                        isSidebarCollapsed && "justify-center"
                    )}>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div>
                                <h2 className="font-semibold text-gray-800">{auth?.user?.name || 'Teacher'}</h2>
                                <p className="text-sm text-gray-500">Teacher</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="px-4 space-y-2 mt-6">
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
                    <div className="p-5 text-sm border-t bg-gray-50">
                        <p className="font-semibold text-gray-700 mb-1">Need Help?</p>
                        <p className="text-gray-500 mb-3">Contact IT support for assistance.</p>
                        <a href="#" className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center transition-colors">
                            <span className="underline">View Help Center</span>
                        </a>
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

            {/* Overlay for mobile */}
            {!isSidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarCollapsed(true)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Header */}
                <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <img 
                                src="/images/logo.png" 
                                alt="Zion Academy Logo" 
                                className="h-8 w-8 object-contain"
                            />
                            <h1 className="font-bold text-xl text-blue-800">Zion Academy</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                            <Calendar size={18} className="text-blue-600" />
                            <span className="text-gray-600 text-sm font-medium">{today}</span>
                        </div>
                        <div className="relative">
                            <button className="group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-blue-50 transition-all duration-300 text-gray-600 hover:text-blue-600 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                <div className="relative transform transition-transform duration-300 group-hover:scale-110">
                                    <Bell size={20} className="text-blue-600" />
                                </div>
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-pulse">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                        </div>
                        <Link
                            href={route('teacher.logout')}
                            method="post"
                            as="button"
                            className="group flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-300 text-red-600 hover:text-red-700"
                        >
                            <LogOut size={18} className="transform transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-medium">Logout</span>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-[#f5f9ff]">
                    {children}
                </main>
            </div>

            {/* Add Toaster component */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        theme: {
                            primary: '#4aed88',
                        },
                    },
                }}
            />
        </div>
    );
} 