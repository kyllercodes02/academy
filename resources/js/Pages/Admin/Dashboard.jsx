import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    Users, 
    UserCheck, 
    UserX, 
    Percent,
    Calendar, 
    ArrowUp, 
    Clock, 
    X,
    TrendingUp,
    BarChart2
} from 'lucide-react';
import AtRiskStudentsWidget from '@/Components/AtRiskStudentsWidget';

const StatCard = ({ title, value, icon: Icon, color, trend = null }) => (
    <div className={`bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 border-l-4 border-${color}-600`}>
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-500">{title}</h4>
            <Icon size={20} className={`text-${color}-600`} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
            <div className="flex items-center mt-2 text-xs text-green-600">
                <ArrowUp size={14} />
                <span className="ml-1">{trend}</span>
            </div>
        )}
    </div>
);

export default function Dashboard({ stats, attendanceBySection, recentAttendance, attendanceTrend }) {
    const pieData = [
        { name: 'Present', value: stats.presentToday },
        { name: 'Late', value: stats.tardyToday },
        { name: 'Absent', value: stats.absentToday },
    ];

    const COLORS = ['#22c55e', '#eab308', '#ef4444'];

    return (
        <AdminLayout>
            <Head title="Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Title */}
                            <div className="flex items-center gap-2 text-2xl font-bold mb-6">
                                <BarChart2 size={24} className="text-blue-700" />
                                <span>Dashboard</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full bg-blue-100">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total Students</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full bg-green-100">
                                            <UserCheck className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Present Today</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.presentToday}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full bg-red-100">
                                            <UserX className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Absent Today</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.absentToday}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full bg-purple-100">
                                            <Percent className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.attendanceRate}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* At-Risk Students Widget */}
                            <div className="mb-6">
                                <AtRiskStudentsWidget />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Attendance by Section */}
                                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance by Section</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={attendanceBySection}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="section" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="present" name="Present" fill="#22c55e" stackId="a" />
                                                <Bar dataKey="absent" name="Absent" fill="#ef4444" stackId="a" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Weekly Attendance */}
                                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={attendanceTrend}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="present" name="Present" fill="#22c55e" />
                                                <Bar dataKey="absent" name="Absent" fill="#ef4444" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Attendance */}
                            <div className="mt-6 bg-white overflow-hidden shadow-sm rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Student
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Section
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Grade Level
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Check In
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Check Out
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {recentAttendance.map((record) => (
                                                    <tr key={record.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {record.student_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.section}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.grade_level}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                record.status === 'present'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.check_in_time}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.check_out_time || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}