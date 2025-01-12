import React, { useEffect, useState } from 'react';
import fetchContacts from '../services/contactService';
import 'bootstrap/dist/css/bootstrap.min.css';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage

    if (userId) {
      fetchContacts(userId)
        .then(data => {
          setContacts(data);
        })
        .catch(error => {
          console.error('Error fetching contacts:', error);
        });
    }
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Contacts</h1>
      <div className="row">
        {contacts.map(contact => (
          <div key={contact.id} className="col-md-4 mb-3">
            <div className="card bg-light">
              <div className="card-body">
                <h5 className="card-title">{contact.name}</h5>
                <p className="card-text">{contact.phno}</p> {/* Reverted to contact.phno as per your code */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
