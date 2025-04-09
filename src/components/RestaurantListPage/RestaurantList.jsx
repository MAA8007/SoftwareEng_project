import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RestaurantList.css";

// Importing images
import pizzaImage from "./pizza.jpg";
import burgerImage from "./burger.jpg";
import nachosImage from "./jamin.jpg";
import curryImage from "./curry.jpg";
import tacosImage from "./taco.jpg";
import sushiImage from "./sushi.jpg";
import pastaImage from "./pasta.jpg";
import grillImage from "./grilled.jpg";
import biryaniImage from "./biryani.jpg";

const restaurants = [
  { name: "Jammin Java", image: nachosImage },
  { name: "Burger Shack", image: burgerImage },
  { name: "Pizza Plaza", image: pizzaImage },
  { name: "Curry Corner", image: curryImage },
  { name: "Taco Town", image: tacosImage },
  { name: "Sushi Central", image: sushiImage },
  { name: "Pasta Point", image: pastaImage },
  { name: "Grill House", image: grillImage },
  { name: "Biryani Bowl", image: biryaniImage },
];

export default function RestaurantListPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const handleClick = (restaurantName) => {
    navigate("/customer-dashboard", { state: { restaurantName } });
  };

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="restaurant-page">
      <div className="top-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search restaurants..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="profile-icon">👤</div>
      </div>

      <div className="welcome-text">
        <h1>WELCOME!</h1>
        <p>YOUR CAMPUS, YOUR DELIVERY, YOUR WAY</p>
      </div>

      <div className="restaurant-list">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant, idx) => (
            <div
              key={idx}
              className="restaurant-card"
              onClick={() => handleClick(restaurant.name)}
            >
              <div className="image-container">
                <img src={restaurant.image} alt={restaurant.name} />
              </div>
              <div className="restaurant-name">{restaurant.name}</div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            No restaurants found.
          </p>
        )}
      </div>
    </div>
  );
}
