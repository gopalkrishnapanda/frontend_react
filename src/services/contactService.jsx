// src/services/contactService.js
const API_URL = 'http://localhost:3001/contacts';

const fetchContacts = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
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
