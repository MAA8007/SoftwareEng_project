
  // utils/notification.utils.js
  /**
   * Send push notification
   * @param {string} userId - User ID to send notification to
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data to send
   */
  const sendPushNotification = async (userId, title, body, data = {}) => {
    // In a real application, you would use Firebase Cloud Messaging or similar
    // This is a placeholder implementation
    
    console.log(`Push notification sent to user ${userId}:`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    console.log(`Data:`, data);
    
    // Return success status
    return true;
  };
  
  module.exports = {
    sendPushNotification
  };