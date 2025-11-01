import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { 
  Logout, 
  Add, 
  Search, 
  TrendingUp,
  SortByAlpha,
  Whatshot,
  AccessTime,
  ThumbUp,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../api/api';
import { toast } from 'react-toastify';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';

function Feed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [sortBy, setSortBy] = useState('none'); // none, latest, popular, oldest
  const [trendingTopics, setTrendingTopics] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Filter and sort posts
    let filtered = posts;
    
    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(post => 
        post.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort (only if sort is selected)
    if (sortBy !== 'none') {
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'latest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'popular') {
          return (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount);
        } else if (sortBy === 'oldest') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
      });
      setFilteredPosts(sorted);
    } else {
      // No sorting - show posts as they are from server
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts, sortBy]);

  // Track trending hashtags from all posts
  useEffect(() => {
    const hashtagMap = new Map();
    
    posts.forEach(post => {
      if (post.text) {
        // Extract hashtags from post text (words starting with #)
        const hashtags = post.text.match(/#\w+/g);
        if (hashtags) {
          hashtags.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            hashtagMap.set(
              normalizedTag, 
              (hashtagMap.get(normalizedTag) || 0) + 1
            );
          });
        }
      }
    });

    // Convert to array and sort by count
    const trending = Array.from(hashtagMap.entries())
      .map(([tag, count]) => ({
        tag: tag,
        displayTag: tag.charAt(0).toUpperCase() + tag.slice(1), // Capitalize first letter
        count: count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3

    setTrendingTopics(trending);
  }, [posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getAllPosts(page, 10);
      const { posts: newPosts, pagination } = response.data;
      
      setPosts(newPosts);
      setHasMore(pagination.page < pagination.pages);
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

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setOpenCreatePost(false);
    toast.success('🎉 Post created successfully!');
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
    toast.info('🗑️ Post deleted');
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
    toast.success('✏️ Post updated!');
    
    // Re-fetch posts to ensure saved state is updated
    fetchPosts();
  };

  const handleLike = async (postId) => {
    try {
      const response = await postAPI.likePost(postId);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likesCount: response.data.likesCount }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, commentText) => {
    try {
      const response = await postAPI.addComment(postId, commentText);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: [...post.comments, response.data.comment],
              commentsCount: response.data.commentsCount 
            }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

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
          <Typography variant="h6" component="div" sx={{ flexGrow: { xs: 0, sm: 1 }, fontWeight: 'bold', letterSpacing: '0.5px' }}>
            📱 Social Post
          </Typography>
          
          {/* Mobile Search */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexGrow: 1, mx: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'white', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1,
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
              {user?.username}
            </Typography>
            <Avatar 
              onClick={() => navigate('/profile')}
              src={user?.profilePicture}
              sx={{ 
                bgcolor: 'secondary.main', 
                width: 40, 
                height: 40,
                border: '2px solid white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              {!user?.profilePicture && user?.username?.charAt(0).toUpperCase()}
            </Avatar>
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left Sidebar - LinkedIn Style Profile Card */}
          <Box sx={{ flex: { lg: '0 0 280px' } }}>
            {/* Profile Card */}
            <Card 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Cover Image */}
              <Box 
                sx={{ 
                  height: 60, 
                  background: 'linear-gradient(135deg, #2962FF 0%, #667eea 100%)',
                  position: 'relative',
                }}
              />
              
              {/* Profile Picture */}
              <Box sx={{ px: 2, pb: 2, textAlign: 'center', position: 'relative', mt: -5 }}>
                <Avatar 
                  onClick={() => navigate('/profile')}
                  src={user?.profilePicture}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    margin: '0 auto',
                    background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #2962FF 0%, #667eea 100%)',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: '4px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.2s',
                  }}
                >
                  {!user?.profilePicture && user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  sx={{ mt: 1, mb: 0.5, cursor: 'pointer' }}
                  onClick={() => navigate('/profile')}
                >
                  {user?.username}
                </Typography>
                
                {user?.bio && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, px: 1 }}>
                    {user.bio.length > 60 ? user.bio.substring(0, 60) + '...' : user.bio}
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Profile Stats */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    📝 Total Posts
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight="600">
                    {posts.filter(p => p.user?._id === user?.id || p.user === user?.id).length}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ❤️ Likes Received
                  </Typography>
                  <Typography variant="body2" color="error.main" fontWeight="600">
                    {posts
                      .filter(p => p.user?._id === user?.id || p.user === user?.id)
                      .reduce((acc, post) => acc + (post.likesCount || 0), 0)}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Saved Items */}
              <Box 
                sx={{ 
                  px: 2, 
                  py: 1.5,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderRadius: 1,
                }}
                onClick={() => navigate('/profile')}
              >
                <Typography variant="body2" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📌</span> Saved items
                </Typography>
              </Box>
            </Card>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ flex: 1, maxWidth: { lg: 600 } }}>
            {/* Create Post Box - LinkedIn Style */}
            <Card 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Avatar 
                    src={user?.profilePicture}
                    sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                  >
                    {!user?.profilePicture && user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <TextField
                    fullWidth
                    placeholder="Start a post"
                    onClick={() => setOpenCreatePost(true)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      },
                      '& input': {
                        cursor: 'pointer',
                      }
                    }}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-around' }}>
                  <Button
                    startIcon={<Add sx={{ color: '#378fe9' }} />}
                    onClick={() => setOpenCreatePost(true)}
                    sx={{ 
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontWeight: 600,
                      flex: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    Photo
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Sort & Filter */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
              <Divider sx={{ flex: 1 }} />
              <Box sx={{ display: 'flex', gap: 0.5, mx: 2 }}>
                <Chip 
                  label="None" 
                  onClick={() => setSortBy('none')}
                  size="small"
                  variant={sortBy === 'none' ? 'filled' : 'outlined'}
                  sx={{ 
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    bgcolor: sortBy === 'none' ? 'grey.300' : 'transparent',
                  }}
                />
                <Chip 
                  icon={<AccessTime sx={{ fontSize: 16 }} />}
                  label="Latest" 
                  onClick={() => setSortBy('latest')}
                  color={sortBy === 'latest' ? 'primary' : 'default'}
                  variant={sortBy === 'latest' ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem' }}
                />
                <Chip 
                  icon={<Whatshot sx={{ fontSize: 16 }} />}
                  label="Popular" 
                  onClick={() => setSortBy('popular')}
                  color={sortBy === 'popular' ? 'secondary' : 'default'}
                  variant={sortBy === 'popular' ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem' }}
                />
              </Box>
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* Posts Section */}
            <Box>
              <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 2, px: 0.5 }}>
                {searchQuery ? `Search Results (${filteredPosts.length})` : 'Feed'}
              </Typography>
        {loading ? (
          <Box>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? '🔍 No posts found' : '📝 No posts yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Try a different search term' : 'Be the first to create a post!'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredPosts.map((post) => (
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
        )}
            </Box>
          </Box>

          {/* Right Sidebar - Search and Trending */}
          <Box sx={{ flex: { lg: '0 0 320px' }, display: { xs: 'none', lg: 'block' } }}>
            {/* Search Card */}
            <Card 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search posts or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 8,
                      bgcolor: 'background.default',
                    }
                  }}
                />
                {searchQuery && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Found {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card 
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="600">
                    Trending Topics
                  </Typography>
                </Box>
                {trendingTopics.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      No hashtags found yet
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      Use #hashtags in your posts!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {trendingTopics.map((topic, index) => (
                      <React.Fragment key={topic.tag}>
                        {index > 0 && <Divider />}
                        <Box
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            borderRadius: 1,
                            p: 1,
                            transition: 'background-color 0.2s',
                          }}
                          onClick={() => setSearchQuery(topic.tag)}
                        >
                          <Typography variant="caption" color="text.secondary">
                            #{index + 1} Trending
                          </Typography>
                          <Typography variant="body2" fontWeight="600" color="primary.main">
                            {topic.displayTag}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {topic.count} {topic.count === 1 ? 'post' : 'posts'}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* Create Post Dialog */}
      <CreatePost
        open={openCreatePost}
        onClose={() => setOpenCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
    </Box>
  );
}

export default Feed;
