import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet, Navigate } from 'react-router-dom';

const AdminLayout = () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // Direct redirect to admin login if not authenticated or not an admin
    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 min-h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto pt-4 lg:pt-0">
                    {/* Page Content injected here */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
