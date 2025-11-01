import React from 'react';
import { Skeleton, Box, Card, CardHeader, CardContent, CardActions } from '@mui/material';

function PostSkeleton() {
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={<Skeleton variant="circular" width={48} height={48} />}
        title={<Skeleton variant="text" width="40%" />}
        subheader={<Skeleton variant="text" width="30%" />}
      />
      <CardContent>
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2, borderRadius: 2 }} />
      </CardContent>
      <CardActions>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={30} sx={{ ml: 1 }} />
        <Skeleton variant="circular" width={40} height={40} sx={{ ml: 2 }} />
        <Skeleton variant="text" width={30} sx={{ ml: 1 }} />
      </CardActions>
    </Card>
  );
}

export default PostSkeleton;
