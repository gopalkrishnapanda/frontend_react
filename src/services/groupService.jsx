import { API_BASE_URL } from '../config';

const groupsCache = {};

export const getCachedGroups = (userId) => groupsCache[userId] || [];

export const setCachedGroups = (userId, groups) => {
  groupsCache[userId] = groups;
};

export const updateCachedGroup = (userId, updatedGroup) => {
  groupsCache[userId] = getCachedGroups(userId).map(group => (
    group.id === updatedGroup.id ? updatedGroup : group
  ));
};

const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Cache-Control': 'no-cache'
});

export const fetchGroups = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/groups`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Unable to load groups');
  }

  const groups = await response.json();
  setCachedGroups(userId, groups);
  return groups;
};

export const fetchGroup = async (userId, groupId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/groups/${groupId}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Unable to load group');
  }

  const group = await response.json();
  updateCachedGroup(userId, group);
  return group;
};

export const updateGroup = async (userId, groupId, group) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/groups/${groupId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ group })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to update group');
  }

  return response.json();
};

export const deleteGroup = async (userId, groupId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/groups/${groupId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to delete group');
  }
};

export const removeContactFromGroup = async (userId, groupId, contactId) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/groups/${groupId}/contacts/${contactId}`,
    {
      method: 'DELETE',
      headers: getHeaders()
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to remove contact from group');
  }
};

export const createGroup = async (userId, group) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/groups`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ group })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Unable to create group');
  }

  const newGroup = await response.json();
  groupsCache[userId] = [...getCachedGroups(userId), newGroup];
  return newGroup;
};
