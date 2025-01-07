// src/services/contactService.js
const API_URL = 'http://localhost:3001/contacts';
const AUTHORIZATION_KEY = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI2MTM2NGJjZS1lMTM3LTRjODYtYThjMi0zZjg3MTk3NTZhOTciLCJzdWIiOiI5Iiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNzM2MTg5NTQyLCJleHAiOjE3MzYxOTY3NDJ9.DszIa3uh_sJZ-Xqi6Biltd5zoWUNk93SSpU-191-5J4'
const fetchContacts = async () => {
  try {
    const response = await fetch(API_URL, { headers: { 'Authorization': `${AUTHORIZATION_KEY}`,},});
    if (!response.ok) {
      console.log(response.json())
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
