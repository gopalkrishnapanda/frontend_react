import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';

const Contact = () => {
  const [contact, setContact] = useState('');
  const {id} = useParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage
    const authToken = localStorage.getItem('authToken');
    const fetchContact = async() =>{
        try{
          const response = await fetch(`http://127.0.0.1:3001/users/${userId}/contacts/${id}`, {
           headers: { 'Authorization': `Bearer ${authToken}`, // Add auth token to request headers
            'Content-Type': 'application/json' } });
            if (!response.ok){
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data)
            setContact(data);
        } catch (error){
            setError(error.message);
        }
    };
    fetchContact();
  },);
  if (error) return <div>Error: {error}</div>;
  if (!contact) return <div>Loading...</div>;
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="card shadow-sm mb-3" style={{ width: '36rem' }}>
    <div className="card-body"> 
      <h5 className="card-title">{contact.name}</h5> 
      <p className="card-text">Phone: {contact.phno}</p> 
    </div> 
  </div>
  </div>
  ); 

};


export default Contact;
