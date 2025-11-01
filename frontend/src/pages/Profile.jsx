import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import { ArrowBack, Logout, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../api/api';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import EditProfile from '../components/EditProfile';

function Profile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openEditProfile, setOpenEditProfile] = useState(false);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getAllPosts(1, 100);
      const allPosts = response.data.posts;
      
      // Filter user's posts
      const userPosts = allPosts.filter(post => 
        post.user === user?.id || 
        post.user?._id === user?.id ||
        post.user === user?._id ||
        post.user?._id === user?._id
      );
      
      // Filter saved posts - check if current user's ID is in savedBy array
      const saved = allPosts.filter(post => 
        post.savedBy?.includes(user?.id) || 
        post.savedBy?.includes(user?._id) ||
        post.savedBy?.some(id => id === user?.id || id === user?._id)
      );
      
      console.log('User ID:', user?.id || user?._id);
      console.log('All posts:', allPosts.length);
      console.log('User posts:', userPosts.length);
      console.log('Saved posts:', saved.length);
      console.log('Saved posts data:', saved);
      
      setPosts(userPosts);
      setSavedPosts(saved);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    setOpenEditProfile(false);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
    setSavedPosts(savedPosts.filter(post => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
    setSavedPosts(savedPosts.map(post => post._id === updatedPost._id ? updatedPost : post));
    
    // Re-fetch to update saved posts list
    fetchAllPosts();
  };

  const handleLike = async (postId) => {
    try {
      const response = await postAPI.likePost(postId);
      const updatePosts = (postsList) => postsList.map(post => 
        post._id === postId ? { ...post, likesCount: response.data.likesCount } : post
      );
      setPosts(updatePosts);
      setSavedPosts(updatePosts);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, commentText) => {
    try {
      const response = await postAPI.addComment(postId, commentText);
      const updatePosts = (postsList) => postsList.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: [...post.comments, response.data.comment],
              commentsCount: response.data.commentsCount 
            }
          : post
      );
      setPosts(updatePosts);
      setSavedPosts(updatePosts);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const totalLikes = posts.reduce((acc, post) => acc + (post.likesCount || 0), 0);
  const totalComments = posts.reduce((acc, post) => acc + (post.commentsCount || 0), 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #2962FF 0%, #667eea 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/feed')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: '0.5px' }}>
            📱 My Profile
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={handleLogout} 
            title="Logout"
            sx={{
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={user?.profilePicture}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mr: 3,
                    background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #2962FF 0%, #667eea 100%)',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    border: '4px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  {!user?.profilePicture && user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700" gutterBottom>
                    {user?.username}
                  </Typography>
                  {user?.bio ? (
                    <Typography variant="body1" color="text.secondary">
                      {user.bio}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      No bio yet
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setOpenEditProfile(true)}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Edit Profile
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Statistics */}
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {posts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Posts
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {totalLikes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Likes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {totalComments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Comments
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            centered
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }
            }}
          >
            <Tab label={`My Posts (${posts.length})`} />
            <Tab label={`Saved Posts (${savedPosts.length})`} />
          </Tabs>
        </Card>

        {/* Content */}
        {loading ? (
          <Box>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </Box>
        ) : (
          <Box>
            {/* My Posts Tab */}
            {tabValue === 0 && (
              <Box>
                {posts.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUser={user}
                        onLike={handleLike}
                        onComment={handleComment}
                        onDelete={handlePostDeleted}
                        onUpdate={handlePostUpdated}
                      />
                    ))}
                  </Box>
                ) : (
                  <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        📝 No posts yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start sharing your thoughts!
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {/* Saved Posts Tab */}
            {tabValue === 1 && (
              <Box>
                {savedPosts.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {savedPosts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUser={user}
                        onLike={handleLike}
                        onComment={handleComment}
                        onDelete={handlePostDeleted}
                        onUpdate={handlePostUpdated}
                      />
                    ))}
                  </Box>
                ) : (
                  <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        🔖 No saved posts yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Save posts to view them here later!
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* Edit Profile Dialog */}
      <EditProfile
        open={openEditProfile}
        onClose={() => setOpenEditProfile(false)}
        user={user}
        onProfileUpdated={handleProfileUpdated}
      />
    </Box>
  );
}

export default Profile;
