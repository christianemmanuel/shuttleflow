'use client';

import React from 'react'
import FeeConfigCard from '@/components/fees/FeeConfigCard';
import FeeManagement from '@/components/fees/FeeManagement';

const page = () => {
  return (
    <div className='space-y-8 px-3 sm:px-4 max-w-[768px] m-auto'>
      <FeeConfigCard />
      <FeeManagement />
    </div>
  )
}

export default page
