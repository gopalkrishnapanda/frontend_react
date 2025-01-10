// src/components/ContactList.js
import React, { useEffect, useState } from 'react';
import fetchContacts from '../services/contactService';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts()
      .then(data => {
        setContacts(data);
      })
      .catch(error => {
        console.error('Error fetching contacts:', error);
      });
  }, []);

  return (
    <div>
      <h1>Contacts</h1>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id}>{contact.name}: {contact.phno}</li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
