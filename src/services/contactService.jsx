// src/services/contactService.js
const API_URL = 'http://localhost:3001/contacts';

const fetchContacts = async () => {
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
