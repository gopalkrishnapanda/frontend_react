// src/services/contactService.js
const API_URL = 'http://localhost:3001/contacts';
const AUTHORIZATION_KEY = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI2M2IzYmEwZi02MmJjLTRhMmQtYWVmZC0zYzE0MTAzYTFhMmYiLCJzdWIiOiI5Iiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNzM2MzY3NzAyLCJleHAiOjE3MzYzNzQ5MDJ9.-dZ5s2oH3JkTvDKkXr7BL8MpkMgdpYPJkemFakyvtBc'
const fetchContacts = async () => {
  try {
    const response = await fetch(API_URL, {
       headers: { 'Authorization': `${AUTHORIZATION_KEY}`,},
    });
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
