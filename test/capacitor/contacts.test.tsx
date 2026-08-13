import type { Contact } from '@capacitor/contacts';
import { renderHook } from '@testing-library/react';

import { useContacts } from '../../src/capacitor/contacts';
import { StrictModeWrapper } from '../strict-mode';

const ada: Contact = { id: '1', displayName: 'Ada Lovelace' };

vi.mock('@capacitor/contacts', () => ({
  Contacts: {
    find: vi.fn(async () => ({ contacts: [{ id: '1', displayName: 'Ada Lovelace' }] })),
    save: vi.fn(async () => ({ id: '1', displayName: 'Ada Lovelace' })),
    remove: vi.fn(async () => undefined),
    pickContact: vi.fn(async () => ({ id: '1', displayName: 'Ada Lovelace' })),
  },
}));

describe('capacitor/contacts', () => {
  it('useContacts exposes the plugin methods', async () => {
    const { result } = renderHook(() => useContacts(), { wrapper: StrictModeWrapper });
    await expect(result.current.find({ fields: ['displayName'] })).resolves.toEqual({
      contacts: [ada],
    });
    await expect(result.current.pickContact()).resolves.toEqual(ada);
    await expect(result.current.save({ contact: ada })).resolves.toEqual(ada);
    await expect(result.current.remove({ id: '1' })).resolves.toBeUndefined();
  });
});
