import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ThumbsUp, Trash2, Send } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: Timestamp;
  likes: string[];
}

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // We need to fetch comments even if user is not logged in
    // so everyone can see the comments
    
    const q = query(
      collection(db, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData: Comment[] = [];
      snapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(commentsData);
    }, (error) => {
      console.error("Error fetching comments:", error);
    });

    return () => unsubscribe();
  }, []); // Remove user dependency to show comments to all users

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || null,
        content: newComment.trim(),
        createdAt: Timestamp.now(),
        likes: []
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, likes: string[]) => {
    if (!user) return;

    try {
      const hasLiked = likes.includes(user.uid);
      const updatedLikes = hasLiked
        ? likes.filter(id => id !== user.uid)
        : [...likes, user.uid];

      await updateDoc(doc(db, 'comments', commentId), {
        likes: updatedLikes
      });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDelete = async (commentId: string, userId: string) => {
    if (!user || user.uid !== userId) return;
    
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-enhanced overflow-hidden border border-gray-200 mb-16">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Community Feedback
        </h2>
      </div>

      <div className="p-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your experience..." : "Login to share your experience"}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!user || isSubmitting}
            />
            <button
              type="submit"
              disabled={!user || isSubmitting || !newComment.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'A'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{comment.userName || 'Anonymous'}</h4>
                        <p className="text-sm text-gray-500">
                          {comment.createdAt && comment.createdAt.toDate ? 
                            comment.createdAt.toDate().toLocaleDateString() : 
                            'Just now'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLike(comment.id, comment.likes || [])}
                          className={`flex items-center space-x-1 px-2 py-1 rounded ${
                            user && comment.likes && comment.likes.includes(user.uid) 
                              ? 'text-purple-600 bg-purple-50' 
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                          disabled={!user}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{comment.likes ? comment.likes.length : 0}</span>
                        </button>
                        {user && user.uid === comment.userId && (
                          <button
                            onClick={() => handleDelete(comment.id, comment.userId)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;