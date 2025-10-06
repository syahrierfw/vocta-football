// src/app/page.tsx
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import { products } from "../data/products";

// A simple, non-functional Pagination component for the demo
function Pagination() {
    return (
        <nav className="flex items-center justify-center mt-12 space-x-4">
            {/* Previous Button */}
            <a href="#" className="font-semibold text-black hover:text-red-600 transition-colors">
                Prev
            </a>

            {/* Page Numbers */}
            <div className="flex items-center space-x-2">
                <a href="#" className="flex items-center justify-center w-10 h-10 bg-red-600 text-white font-bold rounded-md">
                    1
                </a>
                <a href="#" className="flex items-center justify-center w-10 h-10 bg-white text-gray-700 font-bold rounded-md border border-gray-300 hover:bg-gray-100">
                    2
                </a>
                <span className="flex items-center justify-center w-10 h-10 text-gray-500">...</span>
                <a href="#" className="flex items-center justify-center w-10 h-10 bg-white text-gray-700 font-bold rounded-md border border-gray-300 hover:bg-gray-100">
                    10
                </a>
            </div>
            
            {/* Next Button */}
            <a href="#" className="font-semibold text-black hover:text-red-600 transition-colors">
                Next
            </a>
        </nav>
    )
}


export default function HomePage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-4xl font-heading uppercase font-bold tracking-tight text-black">
                AC Milan Football Shirts
            </h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar />

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <p className="text-base text-gray-600">
              Showing <strong className="font-bold text-gray-900">1-24</strong> of <strong className="font-bold text-gray-900">{products.length}</strong> products
            </p>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="show" className="text-sm font-medium text-gray-700">Show:</label>
                        <select id="show" name="show" className="border-gray-300 rounded-md text-base font-semibold text-black">
                            <option>24</option>
                            <option>48</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                        <select id="sort" name="sort" className="border-gray-300 rounded-md text-sm font-semibold text-black">
                            <option>Newest Entry</option>
                            <option>Price: Low to High</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Component Added Here */}
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
}