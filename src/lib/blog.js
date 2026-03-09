// Primary admin user ID — used for DM routing and profile badge display
export const ADMIN_USER_ID = '8572637a-2109-4471-bcb4-3163d04094d0';

// Analytics admin IDs — can access the analytics dashboard
export const ADMIN_IDS = [
  '8572637a-2109-4471-bcb4-3163d04094d0',
  'cf5e37af-df59-44e3-a446-3f97e5e4c558',
  '63556920-4a64-496a-bf7f-2df871865da1',
];
export const isAdmin = (uid) => ADMIN_IDS.includes(uid);

// Moderator IDs — can edit/delete any thread/reply, pin threads, manage blog
export const MOD_IDS = [
  '8572637a-2109-4471-bcb4-3163d04094d0',
  'b2fb8e00-bbd0-489b-a762-945fa811861f',
];
export const isMod = (uid) => MOD_IDS.includes(uid);

export function toSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
