// Admin user ID — only this user can create/edit/delete blog posts
export const ADMIN_USER_ID = '8572637a-2109-4471-bcb4-3163d04094d0';

export function toSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
