// src/components/FilterSidebar.tsx
"use client"; // This is a Client Component because it uses interactive state

import { useState } from 'react';

// A reusable component for each collapsible section
function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false); // Default to closed

  return (
    <div className="py-6 border-b border-gray-200">
      <h3 className="-my-3 flow-root">
        <button
          type="button"
          className="flex w-full items-center justify-between bg-white py-3 text-sm text-black hover:text-gray-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-bold text-lg text-black">{title}</span>
          <span className="ml-6 flex items-center">
            {isOpen ? (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 10z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
            )}
          </span>
        </button>
      </h3>
      {isOpen && <div className="pt-6">{children}</div>}
    </div>
  );
}

// A reusable component for the checkbox items
const CheckboxItem = ({ label, count }: { label: string; count: number }) => (
    <div className="flex items-center">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
        <label className="ml-3 text-base text-gray-600">{label} <span className="text-xs text-gray-400">({count})</span></label>
    </div>
)

export default function FilterSidebar() {
  return (
    <aside className="w-full lg:w-48 lg:flex-shrink-0">
        <h2 className="sr-only">Filters</h2>

        <AccordionSection title="Sort By">
            <div className="space-y-2">
                <CheckboxItem label="Featured" count={10}/>
                <CheckboxItem label="Name" count={25}/>
                <CheckboxItem label="Recently Added" count={18}/>
                <CheckboxItem label="Price (Low to High)" count={44}/>
            </div>
        </AccordionSection>

        <AccordionSection title="Product Size">
            <div className="space-y-4">
                <CheckboxItem label="S" count={20}/>
                <CheckboxItem label="M" count={10}/>
                <CheckboxItem label="L" count={14}/>
                <CheckboxItem label="XL" count={16}/>
            </div>
        </AccordionSection>

        <AccordionSection title="Gender">
            <div className="space-y-4">
                <CheckboxItem label="Male" count={52}/>
                <CheckboxItem label="Female" count={28}/>
            </div>
        </AccordionSection>

        <AccordionSection title="Price">
            {/* This is a visual placeholder for the price slider */}
            <div className="space-y-4">
                <div className="flex justify-between space-x-2">
                    <input type="text" defaultValue="Rp 800.000" className="w-full rounded-md border-gray-300 text-center text-sm text-black"/>
                    <input type="text" defaultValue="Rp 5.000.000" className="w-full rounded-md border-gray-300 text-center text-sm text-black"/>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full">
                    <div className="absolute h-2 bg-red-600 rounded-full" style={{ left: '10%', right: '20%' }}></div>
                    <div className="absolute -top-1 w-4 h-4 bg-white border-2 border-red-600 rounded-full" style={{ left: '10%' }}></div>
                    <div className="absolute -top-1 w-4 h-4 bg-white border-2 border-red-600 rounded-full" style={{ right: '20%' }}></div>
                </div>
                <button className="w-full bg-black text-white py-2 rounded-md font-semibold">OK</button>
            </div>
        </AccordionSection>

        <AccordionSection title="Brand">
            <div className="space-y-4">
                <CheckboxItem label="Adidas" count={15}/>
                <CheckboxItem label="Lotto" count={31}/>
                <CheckboxItem label="Puma" count={28}/>
            </div>
        </AccordionSection>

        <AccordionSection title="Condition">
            <div className="space-y-4">
                <CheckboxItem label="Brand New" count={10}/>
                <CheckboxItem label="Used - Excellent" count={32}/>
                <CheckboxItem label="Match Worn" count={15}/>
            </div>
        </AccordionSection>

    </aside>
  );
}