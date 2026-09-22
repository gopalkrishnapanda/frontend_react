import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { deleteContact, updateContact } from '../services/contactService';

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

const Contact = () => {
  const location = useLocation();
  const initialContact = location.state?.contact;
  const [contact, setContact] = useState(initialContact || null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialContact?.name || '');
  const [phno, setPhno] = useState(initialContact?.phno || '');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isPhotoUploaded, setIsPhotoUploaded] = useState(Boolean(initialContact && getDisplayPhotoUrl(initialContact)));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return undefined;
    }

    const previewUrl = URL.createObjectURL(photo);
    setPhotoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [photo]);

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
            setContact(data);
            setName(data.name);
            setPhno(data.phno);
            setIsPhotoUploaded(Boolean(getDisplayPhotoUrl(data)));
        } catch (error){
            setError(error.message);
        }
    };
    fetchContact();
  }, [id]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem('userId');
    setIsSaving(true);
    setError(null);

    try {
      await updateContact(userId, id, { name, phno, photo });
      navigate('/contacts');
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo) {
      setError('Choose a photo before uploading.');
      return;
    }

    const userId = localStorage.getItem('userId');
    setIsSaving(true);
    setIsPhotoUploaded(false);
    setError(null);

    try {
      await updateContact(userId, id, { name: contact.name, phno: contact.phno, photo });
      setContact(currentContact => ({
        ...currentContact,
        photo_url: photoPreview
      }));
      setIsPhotoUploaded(true);
      setIsEditing(false);
    } catch (uploadError) {
      setError(uploadError.message);
      setIsPhotoUploaded(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    const userId = localStorage.getItem('userId');
    setIsDeleting(true);
    setError(null);

    try {
      await deleteContact(userId, id);
      navigate('/contacts');
    } catch (deleteError) {
      setError(deleteError.message);
      setIsDeleting(false);
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!contact) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card contact-detail-card shadow-sm mx-auto">
        <div className="card-body">
          <div className="contact-show-photo-section mb-4">
            <div className="contact-detail-photo-wrap">
            {photoPreview || getDisplayPhotoUrl(contact) ? (
              <img
                src={photoPreview || getDisplayPhotoUrl(contact)}
                alt={contact.name}
                className="contact-detail-photo"
              />
            ) : (
              <div className="contact-photo-placeholder">No photo</div>
            )}
            <label
              htmlFor="show-contact-photo"
              className="contact-photo-edit-button"
              title="Upload contact photo"
              aria-label="Upload contact photo"
            >
              &#9998;
            </label>
            <input
              id="show-contact-photo"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={event => {
                setPhoto(event.target.files[0] || null);
                setIsPhotoUploaded(false);
              }}
            />
            </div>
            {photoPreview && !isPhotoUploaded && (
              <button
                type="button"
                className="btn btn-success ms-2"
                onClick={handlePhotoUpload}
                disabled={isSaving}
              >
                {isSaving ? 'Uploading...' : 'Upload Photo'}
              </button>
            )}
          </div>
          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="mb-3">
                <label htmlFor="contact-photo" className="form-label">Photo</label>
                <input
                  id="contact-photo"
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={event => setPhoto(event.target.files[0] || null)}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Selected contact preview"
                    className="contact-photo-preview mt-3"
                  />
                )}
              </div>
              <button type="submit" className="btn btn-success me-2" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setName(contact.name);
                  setPhno(contact.phno);
                  setPhoto(null);
                  setError(null);
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <h5 className="card-title contact-detail-name">{contact.name}</h5>
              <p className="card-text contact-phone">{contact.phno}</p>
              <button type="button" className="btn btn-primary me-2" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
          {error && <div className="text-danger mt-3">{error}</div>}
          <button type="button" className="btn btn-link px-0 mt-3 d-block" onClick={() => navigate('/contacts')}>
            Back to Contacts
          </button>
        </div>
      </div>
    </div>
  );

};


export default Contact;
