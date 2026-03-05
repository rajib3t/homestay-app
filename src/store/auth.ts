import { atom, getDefaultStore } from 'jotai';

export const userType = atom<string | null>('user');
export const userEmail = atom<string | null>(null);
export const userFirstName = atom<string | null>(null);
export const userLastName = atom<string | null>(null);
export const userMobile = atom<string | null>(null);

export const resetAppState = () => {
    const store = getDefaultStore();
    store.set(userType, 'user');
    store.set(userEmail, null);
    store.set(userFirstName, null);
    store.set(userLastName, null);
    store.set(userMobile, null);
};
