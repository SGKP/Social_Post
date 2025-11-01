import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import { Close, Image as ImageIcon } from '@mui/icons-material';
import { postAPI } from '../api/api';

function CreatePost({ open, onClose, onPostCreated }) {
  const [formData, setFormData] = useState({
    text: '',
    image: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should not exceed 2MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result,
        });
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.text.trim() && !formData.image) {
      setError('Post must contain either text or image');
      return;
    }

    setLoading(true);

    try {
      const response = await postAPI.createPost(formData);
      onPostCreated(response.data.post);
      setFormData({ text: '', image: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }

    setLoading(false);
  };

  const handleClose = () => {
    setFormData({ text: '', image: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Create Post
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            name="text"
            placeholder="What's on your mind?"
            value={formData.text}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
              fullWidth
            >
              {formData.image ? 'Change Image' : 'Add Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>

          {formData.image && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <img
                src={formData.image}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
              <IconButton
                onClick={() => setFormData({ ...formData, image: '' })}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
                size="small"
              >
                <Close />
              </IconButton>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || (!formData.text.trim() && !formData.image)}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreatePost;
