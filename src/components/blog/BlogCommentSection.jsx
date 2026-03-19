'use client';

import { useEffect } from 'react';
import { useBlogStore } from '@/stores/blogStore';
import BlogCommentList from './BlogCommentList';
import BlogCommentForm from './BlogCommentForm';

export default function BlogCommentSection({ blogPostId }) {
  const commentData = useBlogStore((s) => s.comments[blogPostId]);
  const commentsLoading = useBlogStore((s) => s.commentsLoading);
  const fetchComments = useBlogStore((s) => s.fetchComments);

  const comments = commentData?.items || [];
  const totalCount = commentData?.totalCount || 0;

  useEffect(() => {
    if (blogPostId) fetchComments(blogPostId);
  }, [blogPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        {commentsLoading ? 'Comments' : `${totalCount} ${totalCount === 1 ? 'Comment' : 'Comments'}`}
      </h2>

      {commentsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : (
        <BlogCommentList comments={comments} blogPostId={blogPostId} />
      )}

      <BlogCommentForm blogPostId={blogPostId} />
    </div>
  );
}
