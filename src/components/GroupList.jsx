import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import fetchContacts, { getCachedContacts } from '../services/contactService';
import { createGroup, deleteGroup, fetchGroups, getCachedGroups, setCachedGroups, updateGroup } from '../services/groupService';
import { useNavigate } from 'react-router-dom';

const GroupList = () => {
  const userId = localStorage.getItem('userId');
  const [contacts, setContacts] = useState(() => getCachedContacts(userId));
  const [groups, setGroups] = useState(() => getCachedGroups(userId));
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [isLoadingGroups, setIsLoadingGroups] = useState(() => getCachedGroups(userId).length === 0);
  const [isCreating, setIsCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [busyGroupId, setBusyGroupId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadGroupsPage = async () => {
      fetchContacts(userId)
        .then(contactsData => {
          setContacts(contactsData);
        })
        .catch(loadError => {
          setError(loadError.message);
        });

      try {
        const groupsData = await fetchGroups(userId);
        setGroups(groupsData);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    if (userId) {
      loadGroupsPage();
    } else {
      setError('Please log in again.');
      setIsLoadingGroups(false);
    }
  }, [userId]);

  const handleContactToggle = (contactId) => {
    setSelectedContactIds(currentIds => (
      currentIds.includes(contactId)
        ? currentIds.filter(id => id !== contactId)
        : [...currentIds, contactId]
    ));
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const newGroup = await createGroup(userId, {
        name,
        contact_ids: selectedContactIds
      });
      setGroups(currentGroups => [...currentGroups, newGroup]);
      setName('');
      setSelectedContactIds([]);
      setContactSearch('');
      setShowCreateForm(false);
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameGroup = async (event, group) => {
    event.stopPropagation();
    setOpenMenuId(null);
    const nextName = window.prompt('Enter a new group name:', group.name);

    if (nextName === null || !nextName.trim() || nextName.trim() === group.name) {
      return;
    }

    setBusyGroupId(group.id);
    setError('');

    try {
      const updatedGroup = await updateGroup(userId, group.id, {
        name: nextName.trim(),
        contact_ids: group.contact_ids || group.contacts?.map(contact => contact.id) || []
      });
      setGroups(currentGroups => {
        const updatedGroups = currentGroups.map(currentGroup => (
          currentGroup.id === group.id ? updatedGroup : currentGroup
        ));
        setCachedGroups(userId, updatedGroups);
        return updatedGroups;
      });
    } catch (renameError) {
      setError(renameError.message);
    } finally {
      setBusyGroupId(null);
    }
  };

  const handleDeleteGroup = async (event, groupId) => {
    event.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this group?')) {
      setOpenMenuId(null);
      return;
    }

    setBusyGroupId(groupId);
    setOpenMenuId(null);
    setError('');

    try {
      await deleteGroup(userId, groupId);
      setGroups(currentGroups => {
        const updatedGroups = currentGroups.filter(group => group.id !== groupId);
        setCachedGroups(userId, updatedGroups);
        return updatedGroups;
      });
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusyGroupId(null);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const searchValue = contactSearch.trim().toLowerCase();
    return contact.name?.toLowerCase().includes(searchValue) ||
      String(contact.phno || '').includes(searchValue);
  });

  return (
    <div className="container mt-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <h1 className="mb-0">Groups</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowCreateForm(currentValue => !currentValue);
            setError('');
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Group'}
        </button>
      </div>

      {showCreateForm && (
        <form className="card card-body mb-4" onSubmit={handleCreateGroup}>
        <div className="mb-3">
          <label htmlFor="group-name" className="form-label">Group name</label>
          <input
            id="group-name"
            type="text"
            className="form-control"
            value={name}
            onChange={event => setName(event.target.value)}
            required
          />
        </div>

        <fieldset className="mb-3">
          <legend className="fs-6">Choose contacts</legend>
          {contacts.length === 0 ? (
            <p className="text-muted mb-0">No contacts available.</p>
          ) : (
            <div className="group-contact-picker">
              <input
                type="search"
                className="form-control mb-2"
                placeholder="Search contacts"
                value={contactSearch}
                onChange={event => setContactSearch(event.target.value)}
              />
              <div className="group-contact-options">
                {filteredContacts.length === 0 ? (
                  <p className="text-muted mb-0">No matching contacts.</p>
                ) : filteredContacts.map(contact => (
                  <div className="form-check" key={contact.id}>
                    <input
                      id={`group-contact-${contact.id}`}
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedContactIds.includes(contact.id)}
                      onChange={() => handleContactToggle(contact.id)}
                    />
                    <label className="form-check-label" htmlFor={`group-contact-${contact.id}`}>
                      {contact.name} {contact.phno && `(${contact.phno})`}
                    </label>
                  </div>
                ))}
              </div>
              <small className="text-muted">{selectedContactIds.length} contacts selected</small>
            </div>
          )}
        </fieldset>

        <button type="submit" className="btn btn-primary align-self-start" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Group'}
        </button>
        {error && <div className="text-danger mt-3">{error}</div>}
        </form>
      )}

      <div className="row">
        {isLoadingGroups && <p className="text-muted">Loading groups...</p>}
        {groups.map(group => (
          <div className="col-md-4 mb-3" key={group.id}>
            <div
              className="card h-100 group-card"
              role="button"
              tabIndex="0"
              onClick={() => navigate(`/group/${group.id}`, { state: { group } })}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  navigate(`/group/${group.id}`, { state: { group } });
                }
              }}
            >
              <div className="card-body position-relative">
                <button
                  type="button"
                  className="btn btn-light position-absolute top-0 end-0 mt-2 me-2"
                  aria-label={`Actions for ${group.name}`}
                  disabled={busyGroupId === group.id}
                  onClick={event => {
                    event.stopPropagation();
                    setOpenMenuId(currentId => currentId === group.id ? null : group.id);
                  }}
                >
                  &#8942;
                </button>
                {openMenuId === group.id && (
                  <div
                    className="dropdown-menu show position-absolute"
                    style={{ top: '0.5rem', right: '3.25rem' }}
                  >
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={event => handleRenameGroup(event, group)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={event => handleDeleteGroup(event, group.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
                <h2 className="h5">{group.name}</h2>
                <p className="text-muted mb-0">
                  {group.contacts?.length || group.contact_ids?.length || 0} contacts
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
