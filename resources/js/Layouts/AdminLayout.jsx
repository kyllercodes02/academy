import React, { useEffect, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
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
    ChevronLeft,
    X,
    HelpCircle,
    Phone,
    Mail,
    MessageCircle,
    BookOpen,
    Search,
    ChevronRight as ChevronRightIcon
} from 'lucide-react';
import cn from 'classnames';
import NotificationsDropdown from '../Pages/Shared/NotificationsDropdown';


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
    const [showHelpCenter, setShowHelpCenter] = useState(false);
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
        // Listen to the authenticated admin's private notification channel
        let channel;
        if (window.Echo && auth?.user?.id) {
            channel = window.Echo.private(`App.Models.Admin.${auth.user.id}`);
            channel.notification((notification) => {
                if (notification?.type === 'security_alert') {
                    const notificationForState = { id: notification.id || Date.now(), data: notification, read_at: null };
                    setNotifications(prev => [notificationForState, ...prev]);
                    setNotificationCount(prev => prev + 1);
                    setShowNotifications(true);
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

    // Help Center Modal Component
    const HelpCenterModal = () => {
        const [activeSection, setActiveSection] = useState('getting-started');
        const [searchQuery, setSearchQuery] = useState('');

        const faqs = [
            {
                id: 1,
                question: "How do I add a new student to the system?",
                answer: "Navigate to Students > Add New Student. Fill in the required information including student details, guardian information, and select the appropriate grade level and section."
            },
            {
                id: 2,
                question: "How can I manage teacher assignments?",
                answer: "Go to Users > Teachers to view all teachers. Click on a teacher to edit their assignments, subjects, and sections they teach."
            },
            {
                id: 3,
                question: "What should I do if attendance is not being recorded?",
                answer: "Check the NFC reader connection, ensure students have registered their cards, and verify that schedules are properly configured. Contact IT support if issues persist."
            },
            {
                id: 4,
                question: "How do I create announcements?",
                answer: "Navigate to Announcements > Create New. Fill in the title, content, select target audience (all users, specific groups), and set the publication date."
            },
            {
                id: 5,
                question: "Can I export attendance reports?",
                answer: "Yes, go to Attendance > Reports. You can filter by date range, grade level, or section, then export the data in Excel format."
            },
            {
                id: 6,
                question: "How do I reset a student's password?",
                answer: "Go to Students, find the student, click Edit, and use the 'Reset Password' option. The new password will be sent to the guardian's registered email."
            }
        ];

        const gettingStartedSteps = [
            {
                title: "Set Up Grade Levels and Sections",
                description: "Configure your school's grade levels and create sections for each grade.",
                icon: GraduationCap
            },
            {
                title: "Add Teachers and Assign Subjects",
                description: "Create teacher accounts and assign them to specific subjects and sections.",
                icon: UserCheck
            },
            {
                title: "Register Students",
                description: "Add student information and link them to guardians and sections.",
                icon: Users
            },
            {
                title: "Configure Schedules",
                description: "Set up class schedules and time slots for attendance tracking.",
                icon: Clock
            },
            {
                title: "Set Up NFC Cards",
                description: "Register NFC cards for students to enable automated attendance.",
                icon: Shield
            }
        ];

        const filteredFaqs = faqs.filter(faq => 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <HelpCircle size={32} />
                                <div>
                                    <h2 className="text-2xl font-bold">Help Center</h2>
                                    <p className="text-blue-100">Get assistance and learn how to use the system</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHelpCenter(false)}
                                className="p-2 hover:bg-blue-800 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex h-[calc(90vh-120px)]">
                        {/* Sidebar */}
                        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveSection('getting-started')}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                                        activeSection === 'getting-started'
                                            ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                                            : "hover:bg-gray-100 text-gray-700"
                                    )}
                                >
                                    <BookOpen size={20} />
                                    <span>Getting Started</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('faqs')}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                                        activeSection === 'faqs'
                                            ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                                            : "hover:bg-gray-100 text-gray-700"
                                    )}
                                >
                                    <HelpCircle size={20} />
                                    <span>FAQs</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('contact')}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                                        activeSection === 'contact'
                                            ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                                            : "hover:bg-gray-100 text-gray-700"
                                    )}
                                >
                                    <MessageCircle size={20} />
                                    <span>Contact Support</span>
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeSection === 'getting-started' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Getting Started</h3>
                                        <p className="text-gray-600">Follow these steps to set up your academy management system:</p>
                                    </div>
                                    <div className="space-y-4">
                                        {gettingStartedSteps.map((step, index) => {
                                            const Icon = step.icon;
                                            return (
                                                <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Icon size={20} className="text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                                                        <p className="text-gray-600 text-sm">{step.description}</p>
                                                    </div>
                                                    <div className="flex-shrink-0 text-blue-600 font-bold">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'faqs' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h3>
                                        <div className="relative">
                                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search FAQs..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {filteredFaqs.map((faq) => (
                                            <div key={faq.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                                <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                                                <p className="text-gray-600 text-sm">{faq.answer}</p>
                                            </div>
                                        ))}
                                        {filteredFaqs.length === 0 && searchQuery && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                                                <p>No FAQs found matching your search.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'contact' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Contact Support</h3>
                                        <p className="text-gray-600">Get in touch with our support team for assistance.</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <Phone size={20} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">Phone Support</h4>
                                                    <p className="text-sm text-gray-600">Call us for immediate assistance</p>
                                                </div>
                                            </div>
                                            <p className="text-lg font-medium text-gray-800">+63 (2) 1234-5678</p>
                                            <p className="text-sm text-gray-600 mt-1">Monday - Friday, 8:00 AM - 5:00 PM</p>
                                        </div>

                                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Mail size={20} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">Email Support</h4>
                                                    <p className="text-sm text-gray-600">Send us an email anytime</p>
                                                </div>
                                            </div>
                                            <p className="text-lg font-medium text-gray-800">support@zionacademy.edu</p>
                                            <p className="text-sm text-gray-600 mt-1">We'll respond within 24 hours</p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                                        <h4 className="font-semibold text-gray-800 mb-3">Quick Support Form</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                                <input
                                                    type="text"
                                                    placeholder="Brief description of your issue"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Describe your issue in detail..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                                Send Message
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
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
                            <button 
                                onClick={() => setShowHelpCenter(true)}
                                className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center transition-colors"
                            >
                                <span className="underline">View Help Center</span>
                            </button>
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
                                    return '';
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
                        {/* Removed current page indicator per request */}
                        
                        {/* Notifications */}
                        <NotificationsDropdown initialNotifications={notifications} adminId={auth?.user?.id} />
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
                    {/* Debug panel removed per request */}
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
            
            {/* Help Center Modal */}
            {showHelpCenter && <HelpCenterModal />}
        </div>
    );
}