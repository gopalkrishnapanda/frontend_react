// src/services/contactService.js
const fetchContacts = async (userId) => { // Accept userId as a parameter
  const API_URL = `http://127.0.0.1:3001/users/${userId}/contacts`; // Use userId in the URL

  try {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(API_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized access, maybe redirect to login or show an error
        throw new Error('Unauthorized access, please log in again.');
      }
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export default fetchContacts;
