import { Contacts } from '@capawesome-team/capacitor-contacts';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useContacts, useContactsPermissions } from '../../src/capawesome/contacts';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-contacts', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.countContacts = vi.fn(async () => ({ total: 2 }));
  fake.plugin.createContact = vi.fn(async () => ({ id: '1' }));
  fake.plugin.createGroup = vi.fn(async () => ({ id: 'group-1' }));
  fake.plugin.deleteContactById = vi.fn(async () => undefined);
  fake.plugin.deleteGroupById = vi.fn(async () => undefined);
  fake.plugin.displayContactById = vi.fn(async () => undefined);
  fake.plugin.displayCreateContact = vi.fn(async () => ({ contact: undefined }));
  fake.plugin.displayUpdateContactById = vi.fn(async () => undefined);
  fake.plugin.getAccounts = vi.fn(async () => ({ accounts: [] }));
  fake.plugin.getContactById = vi.fn(async () => ({ contact: { id: '1' } }));
  fake.plugin.getContacts = vi.fn(async () => ({ contacts: [{ id: '1' }] }));
  fake.plugin.getGroupById = vi.fn(async () => ({ group: { id: 'group-1', name: 'Family' } }));
  fake.plugin.getGroups = vi.fn(async () => ({ groups: [] }));
  fake.plugin.isAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.openSettings = vi.fn(async () => undefined);
  fake.plugin.pickContacts = vi.fn(async () => ({ contacts: [] }));
  fake.plugin.updateContactById = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ readContacts: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ readContacts: 'granted' }));
  return { Contacts: fake.plugin };
});

describe('capawesome/contacts', () => {
  it('useContacts exposes the plugin methods', async () => {
    const { result } = renderHook(() => useContacts(), { wrapper: StrictModeWrapper });
    await expect(result.current.countContacts()).resolves.toEqual({ total: 2 });
    await expect(result.current.getContacts()).resolves.toEqual({ contacts: [{ id: '1' }] });
    await expect(result.current.isAvailable()).resolves.toEqual({ isAvailable: true });
    await act(() => result.current.deleteContactById({ id: '1' }));
    expect(Contacts.deleteContactById).toHaveBeenCalledWith({ id: '1' });
    for (const method of [
      'createContact',
      'createGroup',
      'deleteGroupById',
      'displayContactById',
      'displayCreateContact',
      'displayUpdateContactById',
      'getAccounts',
      'getContactById',
      'getGroupById',
      'getGroups',
      'openSettings',
      'pickContacts',
      'updateContactById',
    ] as const) {
      expect(typeof result.current[method]).toBe('function');
    }
  });

  it('useContacts omits the deprecated methods', () => {
    const { result } = renderHook(() => useContacts(), { wrapper: StrictModeWrapper });
    expect(result.current).not.toHaveProperty('isSupported');
    expect(result.current).not.toHaveProperty('pickContact');
  });

  it('useContactsPermissions checks on mount and requests on demand', async () => {
    const { result } = renderHook(() => useContactsPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ readContacts: 'prompt' }));
    await act(() => result.current.request({ permissions: ['readContacts'] }));
    expect(Contacts.requestPermissions).toHaveBeenCalledWith({ permissions: ['readContacts'] });
    expect(result.current.status).toEqual({ readContacts: 'granted' });
  });
});
