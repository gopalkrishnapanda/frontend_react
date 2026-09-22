// src/services/contactService.js
const contactsCache = {};

export const getCachedContacts = (userId) => contactsCache[userId] || [];

const fetchContacts = async (userId) => { // Accept userId as a parameter
  const API_URL = `http://127.0.0.1:3001/users/${userId}/contacts`; // Use userId in the URL

  try {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache' // forces fresh response
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized access, maybe redirect to login or show an error
        throw new Error('Unauthorized access, please log in again.');
      }
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
  contactsCache[userId] = data;
    return data;
  } catch (error) {
    // console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const createContact = async (userId, contact) => {
  const API_URL = `http://127.0.0.1:3001/users/${userId}/contacts`;
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No token found');
  }

  const formData = new FormData();
  formData.append('contact[name]', contact.name);
  formData.append('contact[phno]', contact.phno);
  if (contact.photo) {
    formData.append('contact[photo]', contact.photo);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to add contact');
  }
};

export const deleteContact = async (userId, contactId) => {
  const API_URL = `http://127.0.0.1:3001/users/${userId}/contacts/${contactId}`;
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Unable to delete contact');
  }
};

export const updateContact = async (userId, contactId, contact) => {
  const API_URL = `http://127.0.0.1:3001/users/${userId}/contacts/${contactId}`;
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No token found');
  }

  const formData = new FormData();
  formData.append('contact[name]', contact.name);
  formData.append('contact[phno]', contact.phno);
  if (contact.photo) {
    formData.append('contact[photo]', contact.photo);
  }

  const response = await fetch(API_URL, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to update contact');
  }
};

export default fetchContacts;
