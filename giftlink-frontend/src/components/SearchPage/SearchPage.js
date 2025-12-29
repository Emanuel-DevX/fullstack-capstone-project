import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { urlConfig } from "../../config";
import "./SearchPage.css";

function SearchPage() {
  const navigate = useNavigate();

  // Task 1: Define state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [ageRange, setAgeRange] = useState(6);
  const [searchResults, setSearchResults] = useState([]);

  // Static dropdown values
  const categories = [
    "Living Room",
    "Living",
    "Kitchen",
    "Bedroom",
    "Bathroom",
    "Outdoor",
    "Office",
  ];

  const conditions = ["New", "Like New", "Older"];

  // Task 2: Fetch search results
  const handleSearch = async () => {
    const baseUrl = `${urlConfig.backendUrl}/api/gifts/search?`;
    const queryParams = new URLSearchParams({
      name: searchQuery,
      age_years: ageRange,
      category: document.getElementById("categorySelect").value,
      condition: document.getElementById("conditionSelect").value,
    }).toString();

    try {
      const response = await fetch(`${baseUrl}${queryParams}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    }
  };

  // Task 7: Navigate to details page
  const goToDetailsPage = (productId) => {
    navigate(`/app/product/${productId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Search Gifts</h2>

      {/* Search Input */}
      <div className="mb-3">
        <label htmlFor="searchQuery">Search</label>
        <input
          type="text"
          id="searchQuery"
          className="form-control"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Dropdown */}
      <div className="mb-3">
        <label htmlFor="categorySelect">Category</label>
        <select id="categorySelect" className="form-control">
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Dropdown */}
      <div className="mb-3">
        <label htmlFor="conditionSelect">Condition</label>
        <select id="conditionSelect" className="form-control">
          <option value="">All</option>
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>

      {/* Age Range Slider */}
      <div className="mb-4">
        <label htmlFor="ageRange">Less than {ageRange} years</label>
        <input
          type="range"
          className="form-control-range"
          id="ageRange"
          min="1"
          max="10"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
        />
      </div>

      {/* Search Button */}
      <button className="btn btn-primary mb-4" onClick={handleSearch}>
        Search
      </button>

      {/* Search Results */}
      <div className="search-results mt-4">
        {searchResults.length > 0 ? (
          searchResults.map((product) => (
            <div key={product.id} className="card mb-3">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="card-img-top"
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">
                  {product.description.slice(0, 100)}...
                </p>
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => goToDetailsPage(product.id)}
                >
                  View More
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="alert alert-info" role="alert">
            No products found. Please revise your filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;

