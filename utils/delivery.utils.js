// utils/delivery.utils.js
/**
 * Calculate fare recommendation based on distance and demand
 * @param {string} pickupLocation - Pickup location name
 * @param {string} dropoffLocation - Dropoff location name
 * @param {Date} preferredTime - Preferred delivery time
 * @returns {number} - Recommended fare in PKR
 */
const calculateFareRecommendation = (pickupLocation, dropoffLocation, preferredTime) => {
    // This is a simplified version for demonstration
    // In a real application, you would use Google Maps Distance Matrix API or similar
    
    // Define campus locations with distances (in arbitrary units)
    const locations = {
      'SBASSE': { x: 0, y: 0 },
      'SDSB': { x: 0, y: 2 },
      'SSH': { x: 1, y: 1 },
      'Law School': { x: 2, y: 0 },
      'Male Hostel': { x: 3, y: 1 },
      'Female Hostel': { x: 3, y: 2 },
      'Faculty Housing': { x: 4, y: 2 },
      'Sports Complex': { x: 2, y: 3 },
      'Dining Center': { x: 1, y: 2 },
      'PDC': { x: 4, y: 0 }
    };
    
    // Calculate Euclidean distance between pickup and dropoff
    const pickup = locations[pickupLocation] || { x: 0, y: 0 };
    const dropoff = locations[dropoffLocation] || { x: 0, y: 0 };
    
    const distance = Math.sqrt(
      Math.pow(pickup.x - dropoff.x, 2) + 
      Math.pow(pickup.y - dropoff.y, 2)
    );
    
    // Base fare (30 PKR) + distance factor (20 PKR per unit)
    let fare = 30 + (distance * 20);
    
    // Apply time-based surge pricing (peak hours: 8-10 AM, 12-2 PM, 5-7 PM)
    const hour = preferredTime.getHours();
    if ((hour >= 8 && hour < 10) || 
        (hour >= 12 && hour < 14) || 
        (hour >= 17 && hour < 19)) {
      fare *= 1.2; // 20% surge during peak hours
    }
    
    // Apply urgency factor (if delivery is requested within the next hour)
    const currentTime = new Date();
    const timeDifference = (preferredTime - currentTime) / (1000 * 60); // in minutes
    
    if (timeDifference <= 60) {
      fare *= 1.3; // 30% surge for urgent deliveries
    }
    
    // Round to nearest 5 PKR
    return Math.ceil(fare / 5) * 5;
  };
  
  /**
   * Calculate ETA for delivery
   * @param {string} pickupLocation - Pickup location name
   * @param {string} dropoffLocation - Dropoff location name
   * @returns {number} - Estimated delivery time in minutes
   */
  const calculateETA = (pickupLocation, dropoffLocation) => {
    // This is a simplified version for demonstration
    
    // Define campus locations with distances (same as above)
    const locations = {
      'SBASSE': { x: 0, y: 0 },
      'SDSB': { x: 0, y: 2 },
      'SSH': { x: 1, y: 1 },
      'Law School': { x: 2, y: 0 },
      'Male Hostel': { x: 3, y: 1 },
      'Female Hostel': { x: 3, y: 2 },
      'Faculty Housing': { x: 4, y: 2 },
      'Sports Complex': { x: 2, y: 3 },
      'Dining Center': { x: 1, y: 2 },
      'PDC': { x: 4, y: 0 }
    };
    
    // Calculate Euclidean distance between pickup and dropoff
    const pickup = locations[pickupLocation] || { x: 0, y: 0 };
    const dropoff = locations[dropoffLocation] || { x: 0, y: 0 };
    
    const distance = Math.sqrt(
      Math.pow(pickup.x - dropoff.x, 2) + 
      Math.pow(pickup.y - dropoff.y, 2)
    );
    
    // Base time (5 minutes) + distance factor (3 minutes per unit)
    const eta = 5 + (distance * 3);
    
    // Add buffer time (2 minutes)
    return Math.ceil(eta) + 2;
  };
  
  module.exports = {
    calculateFareRecommendation,
    calculateETA
  };
  