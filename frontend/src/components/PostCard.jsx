import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Box,
  TextField,
  Button,
  Collapse,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  MoreVert,
  Delete,
  Send,
  Edit,
  Close as CloseIcon,
  Check as CheckIcon,
  BookmarkBorder,
  Bookmark,
  Share as ShareIcon,
  Visibility,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { postAPI } from '../api/api';
import EditPost from './EditPost';
import { toast } from 'react-toastify';

function PostCard({ post, currentUser, onLike, onComment, onDelete, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isSaved, setIsSaved] = useState(
    post.savedBy?.includes(currentUser?.id) || 
    post.savedBy?.includes(currentUser?._id) ||
    post.savedBy?.some(id => id === currentUser?.id || id === currentUser?._id) ||
    false
  );
  const [viewCount, setViewCount] = useState(post.views || 0);
  const [viewIncremented, setViewIncremented] = useState(false);
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(currentUser?.id) || 
    post.likes?.includes(currentUser?._id) ||
    false
  );

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    onLike(post._id);
  };

  const handleSaveClick = async () => {
    try {
      const response = await postAPI.savePost(post._id);
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      console.log('Save response:', response.data);
      
      // Update the parent component
      if (onUpdate) {
        const updatedPost = { 
          ...post, 
          savedBy: response.data.savedBy || []
        };
        console.log('Updated post savedBy:', updatedPost.savedBy);
        onUpdate(updatedPost);
      }
      
      // Show toast notification
      if (newSavedState) {
        toast.success('📌 Post saved!');
      } else {
        toast.info('Post unsaved');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Social Post',
      text: post.text || 'Check out this post!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  React.useEffect(() => {
    // Increment view count when post is viewed (only once per user)
    if (!viewIncremented) {
      const incrementView = async () => {
        try {
          const response = await postAPI.viewPost(post._id);
          setViewCount(response.data.views);
          setViewIncremented(true);
        } catch (error) {
          // Silently fail if already viewed
          if (error.response?.status !== 400) {
            console.error('Error incrementing view:', error);
          }
        }
      };
      incrementView();
    }
  }, [post._id, viewIncremented]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const handleDelete = async () => {
    try {
      await postAPI.deletePost(post._id);
      onDelete(post._id);
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleEdit = () => {
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handlePostUpdated = (updatedPost) => {
    onUpdate(updatedPost);
    setOpenEditDialog(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.text);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      const response = await postAPI.updateComment(post._id, commentId, editCommentText);
      
      const updatedPost = {
        ...post,
        comments: post.comments.map(c => 
          c._id === commentId ? { ...c, text: editCommentText, updatedAt: new Date() } : c
        )
      };
      onUpdate(updatedPost);
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postAPI.deleteComment(post._id, commentId);
      
      const updatedPost = {
        ...post,
        comments: post.comments.filter(c => c._id !== commentId),
        commentsCount: post.commentsCount - 1
      };
      onUpdate(updatedPost);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const isOwner = post.user?._id === currentUser?.id || post.user === currentUser?.id;

  return (
    <Card 
      sx={{ 
        borderRadius: 2,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            src={post.user?.profilePicture || post.profilePicture}
            sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              fontWeight: 600,
            }}
          >
            {!post.user?.profilePicture && !post.profilePicture && (post.username?.charAt(0).toUpperCase() || 'U')}
          </Avatar>
        }
        action={
          isOwner && (
            <>
              <IconButton onClick={handleMenuClick} size="small">
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEdit}>
                  <Edit fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <Delete fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              </Menu>
            </>
          )
        }
        title={
          <Typography variant="subtitle2" fontWeight="600">
            {post.username}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ pt: 0, pb: 1.5 }}>
        {post.text && (
          <Typography variant="body2" sx={{ mb: post.image ? 2 : 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {post.text}
          </Typography>
        )}

        {post.image && (
          <Box
            component="img"
            src={post.image}
            alt="Post"
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 1.5,
            }}
          />
        )}
      </CardContent>

      <Divider />

      <CardActions 
        disableSpacing 
        sx={{ 
          px: 2, 
          py: 1,
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button
            size="small"
            startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
            onClick={handleLikeClick}
            sx={{ 
              textTransform: 'none',
              minWidth: 'auto',
              color: isLiked ? 'error.main' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 1.5,
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            Like {post.likesCount > 0 && `· ${post.likesCount}`}
          </Button>

          <Button
            size="small"
            startIcon={<ChatBubbleOutline />}
            onClick={() => setShowComments(!showComments)}
            sx={{ 
              textTransform: 'none',
              minWidth: 'auto',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 1.5,
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            Comment {post.commentsCount > 0 && `· ${post.commentsCount}`}
          </Button>

          <Button
            size="small"
            startIcon={isSaved ? <Bookmark /> : <BookmarkBorder />}
            onClick={handleSaveClick}
            sx={{ 
              textTransform: 'none',
              minWidth: 'auto',
              color: isSaved ? 'primary.main' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 1.5,
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            Save
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <Visibility sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight="500" fontSize="0.7rem">
              {viewCount}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={handleShare}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: 'action.hover' }
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>

      <Collapse in={showComments} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
            Comments ({post.commentsCount || 0})
          </Typography>

          {/* Comment Form */}
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    type="submit" 
                    disabled={!commentText.trim()}
                    size="small"
                    color="primary"
                  >
                    <Send fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </Box>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {post.comments.map((comment, index) => {
                const isCommentOwner = comment.user?._id === currentUser?.id || comment.user === currentUser?.id;
                const isEditing = editingCommentId === comment._id;

                return (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Avatar 
                        src={comment.user?.profilePicture}
                        sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}
                      >
                        {!comment.user?.profilePicture && (comment.username?.charAt(0).toUpperCase() || 'U')}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        {isEditing ? (
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              autoFocus
                              multiline
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1.5,
                                }
                              }}
                            />
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleUpdateComment(comment._id)}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={handleCancelEdit}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              bgcolor: 'grey.100',
                              borderRadius: 1.5,
                              px: 1.5,
                              py: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                              <Typography variant="caption" fontWeight="600" color="text.primary">
                                {comment.username}
                              </Typography>
                              {isCommentOwner && (
                                <Box sx={{ ml: 1 }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEditComment(comment)}
                                    sx={{ padding: '2px' }}
                                  >
                                    <Edit sx={{ fontSize: 14 }} />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteComment(comment._id)}
                                    sx={{ padding: '2px' }}
                                  >
                                    <Delete sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                              {comment.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              {comment.updatedAt && new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && ' (edited)'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'grey.50', borderRadius: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                No comments yet. Be the first to comment!
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* Edit Post Dialog */}
      <EditPost
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        post={post}
        onPostUpdated={handlePostUpdated}
      />
    </Card>
  );
}

export default PostCard;
