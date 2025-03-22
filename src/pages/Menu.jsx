import React from 'react';

const Menu = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Menu</h1>
      
      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="category">
          <h2 className="text-2xl font-semibold mb-2">Starters</h2>
          <div className="menu-item mb-4">
            <img src="starter.jpg" alt="Starter" className="w-full h-32 object-cover mb-2 rounded" />
            <h3 className="text-xl font-medium">Starter Name</h3>
            <p className="text-gray-600">Description of the starter.</p>
            <p className="text-lg font-bold">$10</p>
          </div>
          {/* Add more starters */}
        </div>
        
        <div className="category">
          <h2 className="text-2xl font-semibold mb-2">Main Course</h2>
          <div className="menu-item mb-4">
            <img src="maincourse.jpg" alt="Main Course" className="w-full h-32 object-cover mb-2 rounded" />
            <h3 className="text-xl font-medium">Main Course Name</h3>
            <p className="text-gray-600">Description of the main course.</p>
            <p className="text-lg font-bold">$20</p>
          </div>
          {/* Add more main courses */}
        </div>
        
        <div className="category">
          <h2 className="text-2xl font-semibold mb-2">Desserts</h2>
          <div className="menu-item mb-4">
            <img src="dessert.jpg" alt="Dessert" className="w-full h-32 object-cover mb-2 rounded" />
            <h3 className="text-xl font-medium">Dessert Name</h3>
            <p className="text-gray-600">Description of the dessert.</p>
            <p className="text-lg font-bold">$8</p>
          </div>
          {/* Add more desserts */}
        </div>
        
        <div className="category">
          <h2 className="text-2xl font-semibold mb-2">Drinks</h2>
          <div className="menu-item mb-4">
            <img src="drink.jpg" alt="Drink" className="w-full h-32 object-cover mb-2 rounded" />
            <h3 className="text-xl font-medium">Drink Name</h3>
            <p className="text-gray-600">Description of the drink.</p>
            <p className="text-lg font-bold">$5</p>
          </div>
          {/* Add more drinks */}
        </div>
      </div>
      
      {/* Search & Filter Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Search & Filter</h2>
        <input 
          type="text" 
          placeholder="Search for dishes..." 
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-green-500 text-white rounded">Vegetarian</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded">Vegan</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded">Gluten-Free</button>
        </div>
      </div>
      
      {/* Special Offers Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Special Offers</h2>
        <div className="offer-item mb-4">
          <h3 className="text-xl font-medium">Special Offer Name</h3>
          <p className="text-gray-600">Description of the special offer.</p>
          <p className="text-lg font-bold">$15</p>
          <p className="text-red-500">Expires in 2 hours</p>
        </div>
        {/* Add more special offers */}
      </div>
      
      {/* Exit or Continued Navigation */}
      <div className="mt-8">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Order at the Counter</button>
      </div>
    </div>
  );
};

export default Menu;