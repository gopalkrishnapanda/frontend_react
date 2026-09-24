import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import fetchContacts, { getCachedContacts } from '../services/contactService';
import { deleteGroup, fetchGroup, removeContactFromGroup, updateCachedGroup, updateGroup } from '../services/groupService';

const GroupShow = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const initialGroup = location.state?.group;
  const [group, setGroup] = useState(initialGroup || null);
  const [contacts, setContacts] = useState(() => getCachedContacts(userId));
  const [error, setError] = useState('');
  const [showAddContacts, setShowAddContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [isSavingContacts, setIsSavingContacts] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isRemovingContact, setIsRemovingContact] = useState(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError('Please log in again.');
      return;
    }

    fetchGroup(userId, id)
      .then(freshGroup => {
        setGroup(freshGroup);
        updateCachedGroup(userId, freshGroup);
      })
      .catch(loadError => setError(loadError.message));

    fetchContacts(userId)
      .then(setContacts)
      .catch(loadError => setError(loadError.message));
  }, [id, userId]);

  useEffect(() => {
    if (group) {
      setGroupName(group.name || '');
      setSelectedContactIds(
        group.contact_ids || group.contacts?.map(contact => contact.id) || []
      );
    }
  }, [group]);

  const handleContactToggle = (contactId) => {
    setSelectedContactIds(currentIds => (
      currentIds.includes(contactId)
        ? currentIds.filter(currentId => currentId !== contactId)
        : [...currentIds, contactId]
    ));
  };

  const handleRenameGroup = async (event) => {
    event.preventDefault();
    setIsSavingRename(true);
    setError('');

    try {
      const updatedGroup = await updateGroup(userId, id, {
        name: groupName,
        contact_ids: selectedContactIds
      });
      setGroup(updatedGroup);
      setIsRenaming(false);
    } catch (renameError) {
      setError(renameError.message);
    } finally {
      setIsSavingRename(false);
    }
  };

  const handleRemoveContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to remove this contact from the group?')) {
      return;
    }

    setIsRemovingContact(contactId);
    setError('');

    try {
      await removeContactFromGroup(userId, id, contactId);
      setSelectedContactIds(currentIds => currentIds.filter(currentId => currentId !== contactId));
      setGroup(currentGroup => {
        const updatedGroup = {
        ...currentGroup,
        contact_ids: (currentGroup.contact_ids || []).filter(currentId => currentId !== contactId),
        contacts: currentGroup.contacts?.filter(contact => contact.id !== contactId)
        };
        updateCachedGroup(userId, updatedGroup);
        return updatedGroup;
      });
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setIsRemovingContact(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
      return;
    }

    setIsDeletingGroup(true);
    setError('');

    try {
      await deleteGroup(userId, id);
      navigate('/groups');
    } catch (deleteError) {
      setError(deleteError.message);
      setIsDeletingGroup(false);
    }
  };

  const handleSaveContacts = async (event) => {
    event.preventDefault();
    setIsSavingContacts(true);
    setError('');

    try {
      const updatedGroup = await updateGroup(userId, id, {
        name: group.name,
        contact_ids: selectedContactIds
      });
      setGroup(updatedGroup);
      setShowAddContacts(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSavingContacts(false);
    }
  };

  if (error) {
    return (
      <div className="container mt-5">
        <p className="text-danger">{error}</p>
        <button type="button" className="btn btn-link px-0" onClick={() => navigate('/groups')}>
          Back to Groups
        </button>
      </div>
    );
  }

  if (!group && !error) {
    return <div className="container mt-5">Loading group...</div>;
  }

  const assignedContacts = group.contacts || (group.contact_ids || [])
    .map(contactId => contacts.find(contact => contact.id === contactId))
    .filter(Boolean);

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '42rem' }}>
        <div className="card-body">
          <Link to="/groups" className="btn btn-link px-0">Back to Groups</Link>
          <div className="d-flex align-items-center justify-content-between mt-2">
            <div className="d-flex align-items-center">
              <h1 className="h3 mb-0">{group.name}</h1>
              <button
                type="button"
                className="group-rename-button"
                aria-label={isRenaming ? 'Cancel renaming group' : 'Rename group'}
                title={isRenaming ? 'Cancel renaming' : 'Rename group'}
                onClick={() => {
                  setGroupName(group.name);
                  setIsRenaming(currentValue => !currentValue);
                  setError('');
                }}
              >
                &#9998;
              </button>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm ms-2"
              onClick={handleDeleteGroup}
              disabled={isDeletingGroup}
            >
              {isDeletingGroup ? 'Deleting...' : 'Delete Group'}
            </button>
          </div>
          <p className="text-muted">{assignedContacts.length} contacts</p>

          {isRenaming && (
            <form className="input-group mb-3" onSubmit={handleRenameGroup}>
              <input
                type="text"
                className="form-control"
                value={groupName}
                onChange={event => setGroupName(event.target.value)}
                aria-label="Group name"
                required
              />
              <button type="submit" className="btn btn-success" disabled={isSavingRename}>
                {isSavingRename ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          <button
            type="button"
            className="btn btn-primary mb-3"
            onClick={() => {
              setShowAddContacts(currentValue => !currentValue);
              setError('');
            }}
          >
            {showAddContacts ? 'Cancel' : 'Add Contacts'}
          </button>

          {showAddContacts && (
            <form className="card card-body mb-3" onSubmit={handleSaveContacts}>
              <label htmlFor="group-contact-search" className="form-label">Search contacts</label>
              <input
                id="group-contact-search"
                type="search"
                className="form-control mb-2"
                placeholder="Search by name or phone number"
                value={contactSearch}
                onChange={event => setContactSearch(event.target.value)}
              />
              <div className="group-contact-options mb-2">
                {contacts
                  .filter(contact => contact.name?.toLowerCase().includes(contactSearch.trim().toLowerCase()) ||
                    String(contact.phno || '').includes(contactSearch.trim()))
                  .map(contact => (
                    <div className="form-check" key={contact.id}>
                      <input
                        id={`show-group-contact-${contact.id}`}
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                      />
                      <label className="form-check-label" htmlFor={`show-group-contact-${contact.id}`}>
                        {contact.name} {contact.phno && `(${contact.phno})`}
                      </label>
                    </div>
                  ))}
              </div>
              <button type="submit" className="btn btn-success align-self-start" disabled={isSavingContacts}>
                {isSavingContacts ? 'Saving...' : 'Save Contacts'}
              </button>
            </form>
          )}

          {assignedContacts.length === 0 ? (
            <p className="text-muted mb-0">No contacts in this group.</p>
          ) : (
            <div className="list-group">
              {assignedContacts.map(contact => (
                <div
                  key={contact.id}
                  className="list-group-item d-flex align-items-center justify-content-between"
                >
                  <Link to={`/contact/${contact.id}`} className="text-decoration-none">
                    <strong>{contact.name}</strong>
                    {contact.phno && <span className="text-muted ms-2">{contact.phno}</span>}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm ms-2"
                    onClick={() => handleRemoveContact(contact.id)}
                    disabled={isRemovingContact === contact.id}
                  >
                    {isRemovingContact === contact.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupShow;