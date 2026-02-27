// Admin user ID — only this user can create/edit/delete blog posts
export const ADMIN_USER_ID = '8572637a-2109-4471-bcb4-3163d04094d0';

// All admin user IDs (for analytics access etc.)
export const ADMIN_IDS = [
  '8572637a-2109-4471-bcb4-3163d04094d0',
  'cf5e37af-df59-44e3-a446-3f97e5e4c558',
];
export const isAdmin = (uid) => ADMIN_IDS.includes(uid);

export function toSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
