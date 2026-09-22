import React, { useEffect, useState } from 'react';
import fetchContacts, { createContact, deleteContact, updateContact } from '../services/contactService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phno, setPhno] = useState('');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletingContactId, setDeletingContactId] = useState(null);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingPhno, setEditingPhno] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();
  
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

  const handleCardClick = (contactId) =>{
    navigate(`/contact/${contactId}`);
  };

  const handleDeleteContact = async (event, contactId) => {
    event.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this contact?')) {
      setOpenMenuId(null);
      return;
    }

    const userId = localStorage.getItem('userId');
    setDeletingContactId(contactId);

    try {
      await deleteContact(userId, contactId);
      setContacts(currentContacts => currentContacts.filter(contact => contact.id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setDeletingContactId(null);
      setOpenMenuId(null);
    }
  };

  const handleEditContact = (event, contact) => {
    event.stopPropagation();
    setEditingContactId(contact.id);
    setEditingName(contact.name);
    setEditingPhno(contact.phno);
    setEditError('');
    setOpenMenuId(null);
  };

  const handleUpdateContact = async (event, contactId) => {
    event.preventDefault();
    event.stopPropagation();
    const userId = localStorage.getItem('userId');
    setIsUpdating(true);
    setEditError('');

    try {
      await updateContact(userId, contactId, { name: editingName, phno: editingPhno });
      const updatedContacts = await fetchContacts(userId);
      setContacts(updatedContacts);
      setEditingContactId(null);
    } catch (error) {
      setEditError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddContact = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem('userId');

    if (!userId) {
      setAddError('Please log in again before adding a contact.');
      return;
    }

    setAddError('');
    setIsAdding(true);

    try {
      await createContact(userId, { name, phno });
    } catch (error) {
      console.error('Error adding contact:', error);
    } finally {
      try {
        const updatedContacts = await fetchContacts(userId);
        setContacts(updatedContacts);
      } catch (error) {
        console.error('Error refreshing contacts:', error);
      }
      setIsAdding(false);
      setShowAddForm(false);
      setName('');
      setPhno('');
      setAddError('');
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
        <h1 className="mb-0">Contacts</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(currentValue => !currentValue);
            setAddError('');
          }}
        >
          {showAddForm ? 'Cancel' : 'Add Contact'}
        </button>
      </div>

      {showAddForm && (
        <form className="card card-body mb-4" onSubmit={handleAddContact}>
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label htmlFor="contact-name" className="form-label">Name</label>
              <input
                id="contact-name"
                type="text"
                className="form-control"
                value={name}
                onChange={event => setName(event.target.value)}
                required
              />
            </div>
            <div className="col-md-5">
              <label htmlFor="contact-phone" className="form-label">Phone number</label>
              <input
                id="contact-phone"
                type="tel"
                className="form-control"
                value={phno}
                onChange={event => setPhno(event.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
          {addError && <div className="text-danger mt-3">{addError}</div>}
        </form>
      )}

      <div className="row">
        {contacts.map(contact => (
          <div key={contact.id} className="col-md-4 mb-3">
            <div className="card bg-light" onClick={() => handleCardClick(contact.id)}>
              <div className="card-body position-relative">
                <button
                  type="button"
                  className="btn btn-light position-absolute top-0 end-0 mt-2 me-2"
                  aria-label={`Actions for ${contact.name}`}
                  onClick={event => {
                    event.stopPropagation();
                    setOpenMenuId(currentId => currentId === contact.id ? null : contact.id);
                  }}
                >
                  &#8942;
                </button>
                {openMenuId === contact.id && (
                  <div
                    className="dropdown-menu show position-absolute"
                    style={{ top: '0.5rem', right: '3.25rem' }}
                  >
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={event => handleEditContact(event, contact)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      disabled={deletingContactId === contact.id}
                      onClick={event => handleDeleteContact(event, contact.id)}
                    >
                      {deletingContactId === contact.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
                {editingContactId === contact.id ? (
                  <form onSubmit={event => handleUpdateContact(event, contact.id)}>
                    <div className="mb-2">
                      <label htmlFor={`edit-name-${contact.id}`} className="form-label">Name</label>
                      <input
                        id={`edit-name-${contact.id}`}
                        type="text"
                        className="form-control"
                        value={editingName}
                        onChange={event => setEditingName(event.target.value)}
                        onClick={event => event.stopPropagation()}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label htmlFor={`edit-phone-${contact.id}`} className="form-label">Phone number</label>
                      <input
                        id={`edit-phone-${contact.id}`}
                        type="tel"
                        className="form-control"
                        value={editingPhno}
                        onChange={event => setEditingPhno(event.target.value)}
                        onClick={event => event.stopPropagation()}
                        required
                      />
                    </div>
                    {editError && <div className="text-danger mb-2">{editError}</div>}
                    <button type="submit" className="btn btn-success btn-sm me-2" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={event => {
                        event.stopPropagation();
                        setEditingContactId(null);
                        setEditError('');
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h5 className="card-title">{contact.name}</h5>
                    <p className="card-text">{contact.phno}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
