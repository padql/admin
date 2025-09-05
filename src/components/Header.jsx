import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
export default function Header({ }){
  return (
    <header className="mt-16 mb-6 flex items-center justify-between">
      <div>
        {/* <Sidebar /> */}
        <h1 className="text-2xl font-bold">Input Data Pembayaran</h1>
        <p className="text-sm text-gray-600">Memudahkanmu mencatat pembayaran kapanpun & di manapun.</p>
      </div>
    </header>
  );
}
