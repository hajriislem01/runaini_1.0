import React from 'react';
import { Outlet } from 'react-router-dom';
import AdministrationSidebar from '../components/AdministrationSidebar';


const AdministrationLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-black via-[#902bd1] to-[#00d0cb]">
      <AdministrationSidebar />
      <div className="flex-1 p-4 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdministrationLayout;
