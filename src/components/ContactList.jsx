import React, { useEffect, useState } from 'react';
import fetchContacts, { addFavourite, createContact, deleteContact, getCachedContacts, removeFavourite, setCachedContacts, updateContact } from '../services/contactService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const getPhotoUrl = (contact) => {
  const photo = contact.photo;
  const attachment = contact.photo_attachment || contact.photoAttachment;
  const blob = photo?.blob || attachment?.blob;
  const directUrl = contact.photo_url || contact.photoUrl || contact.image_url || contact.imageUrl ||
    (typeof photo === 'string' ? photo : photo?.url || photo?.href) ||
    attachment?.url || attachment?.href || blob?.url;

  if (directUrl) {
    return directUrl;
  }

  const signedId = photo?.signed_id || photo?.signedId || attachment?.signed_id ||
    attachment?.signedId || blob?.signed_id || blob?.signedId;
  const filename = photo?.filename || attachment?.filename || blob?.filename || 'contact-photo';

  if (signedId) {
    return `http://127.0.0.1:3001/rails/active_storage/blobs/redirect/${signedId}/${encodeURIComponent(filename)}`;
  }

  return null;
};

const getDisplayPhotoUrl = (contact) => {
  const photoUrl = getPhotoUrl(contact);

  if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.startsWith('http')) {
    return photoUrl;
  }

  return `http://127.0.0.1:3001${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
};

const getInitials = (name) => name
  .split(' ')
  .map(part => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

const isFavourite = contact => Boolean(contact.is_favourite);

const ContactAvatar = ({ contact }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = getDisplayPhotoUrl(contact);

  return (
    <div className="contact-avatar" aria-label={`${contact.name} photo`}>
      {photoUrl && !imageFailed ? (
        <img
          src={photoUrl}
          alt={`${contact.name}`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        getInitials(contact.name)
      )}
    </div>
  );
};

const ContactList = ({ favoritesOnly = false }) => {
  const userId = localStorage.getItem('userId');
  const [contacts, setContacts] = useState(() => getCachedContacts(userId));
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phno, setPhno] = useState('');
  const [photo, setPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletingContactId, setDeletingContactId] = useState(null);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingPhno, setEditingPhno] = useState('');
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');
  const [favouriteContactId, setFavouriteContactId] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (userId) {
      fetchContacts(userId)
        .then(data => {
          setContacts(data);
        })
        .catch(error => {
          console.error('Error fetching contacts:', error);
        });
    }
  }, [userId]);

  const handleCardClick = (contactId) =>{
    const selectedContact = contacts.find(contact => contact.id === contactId);
    navigate(`/contact/${contactId}`, { state: { contact: selectedContact } });
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
    setEditingPhoto(null);
    setEditError('');
    setOpenMenuId(null);
  };

  const handleFavouriteToggle = async (event, contact) => {
    event.stopPropagation();
    const nextFavourite = !isFavourite(contact);
    setFavouriteContactId(contact.id);
    setContacts(currentContacts => {
      const updatedContacts = currentContacts.map(currentContact => (
      currentContact.id === contact.id
        ? { ...currentContact, is_favourite: nextFavourite }
        : currentContact
      ));
      setCachedContacts(userId, updatedContacts);
      return updatedContacts;
    });

    try {
      if (nextFavourite) {
        await addFavourite(userId, contact.id);
      } else {
        await removeFavourite(userId, contact.id);
      }
      const updatedContacts = await fetchContacts(userId);
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error updating favourite contact:', error);
      setContacts(currentContacts => {
        const revertedContacts = currentContacts.map(currentContact => (
        currentContact.id === contact.id
          ? { ...currentContact, is_favourite: contact.is_favourite }
          : currentContact
        ));
        setCachedContacts(userId, revertedContacts);
        return revertedContacts;
      });
    } finally {
      setFavouriteContactId(null);
    }
  };

  const handleUpdateContact = async (event, contactId) => {
    event.preventDefault();
    event.stopPropagation();
    const userId = localStorage.getItem('userId');
    setIsUpdating(true);
    setEditError('');

    try {
      await updateContact(userId, contactId, {
        name: editingName,
        phno: editingPhno,
        photo: editingPhoto
      });
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
      await createContact(userId, { name, phno, photo });
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
      setPhoto(null);
      setAddError('');
    }
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visibleContacts = favoritesOnly
    ? contacts.filter(isFavourite)
    : contacts;
  const sortedContacts = [...visibleContacts].sort((firstContact, secondContact) => (
    String(firstContact.name || '').localeCompare(
      String(secondContact.name || ''),
      'en',
      { sensitivity: 'base' }
    )
  ));
  const filteredContacts = sortedContacts.filter(contact => (
    contact.name?.toLowerCase().includes(normalizedSearchTerm) ||
    String(contact.phno || '').toLowerCase().includes(normalizedSearchTerm)
  ));

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
        <h1 className="mb-0">{favoritesOnly ? 'Favourites' : 'Contacts'}</h1>
        {!favoritesOnly && <button
          type="button"
          className="btn btn-primary contact-add-button"
          aria-label={showAddForm ? 'Close add contact form' : 'Add contact'}
          onClick={() => {
            setShowAddForm(currentValue => !currentValue);
            setAddError('');
          }}
        >
          <span className="contact-add-button-label">{showAddForm ? 'Cancel' : 'Add Contact'}</span>
          <span className="contact-add-button-icon" aria-hidden="true">{showAddForm ? '×' : '+'}</span>
        </button>}
      </div>

      {showAddForm && (
        <form className="card card-body mb-4" onSubmit={handleAddContact}>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
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
            <div className="col-md-4">
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
            <div className="col-md-3">
              <label htmlFor="contact-photo" className="form-label">Photo</label>
              <input
                id="contact-photo"
                type="file"
                accept="image/*"
                className="form-control"
                onChange={event => setPhoto(event.target.files[0] || null)}
              />
            </div>
            <div className="col-md-1">
              <button type="submit" className="btn btn-success w-100" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
          {addError && <div className="text-danger mt-3">{addError}</div>}
        </form>
      )}

      <div className="mb-4">
        <label htmlFor="contact-search" className="form-label">Search contacts</label>
        <input
          id="contact-search"
          type="search"
          className="form-control"
          placeholder="Search by name or phone number"
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="row">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="col-md-4 mb-3">
            <div className="card contact-card" onClick={() => handleCardClick(contact.id)}>
              <div className="card-body contact-card-body position-relative">
                <button
                  type="button"
                  className={`contact-favourite-button ${isFavourite(contact) ? 'is-favourite' : ''}`}
                  aria-label={isFavourite(contact) ? `Remove ${contact.name} from favourites` : `Add ${contact.name} to favourites`}
                  aria-pressed={isFavourite(contact)}
                  disabled={favouriteContactId === contact.id}
                  onClick={event => handleFavouriteToggle(event, contact)}
                >
                  {isFavourite(contact) ? '★' : '☆'}
                </button>
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
                      <label htmlFor={`edit-photo-${contact.id}`} className="form-label">Photo</label>
                      <input
                        id={`edit-photo-${contact.id}`}
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={event => setEditingPhoto(event.target.files[0] || null)}
                        onClick={event => event.stopPropagation()}
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
                    <ContactAvatar contact={contact} />
                    <div className="contact-details">
                      <h5 className="card-title mb-1">{contact.name}</h5>
                      <p className="card-text contact-phone mb-0">{contact.phno}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredContacts.length === 0 && (
        <p className="text-center text-muted">
          {normalizedSearchTerm
            ? 'No matching contacts found.'
            : favoritesOnly
              ? 'No favourite contacts yet.'
              : 'No contacts yet.'}
        </p>
      )}
    </div>
  );
};

export default ContactList;
