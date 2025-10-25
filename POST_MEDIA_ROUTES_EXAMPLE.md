# Post Media Routes Configuration

This document provides example routes configuration for the Post Media module.

## Step 1: Add Controller Import

Add this line to your `start/routes.ts` file with the other controller imports (around line 22):

```typescript
const PostMediasController = () => import('#controllers/post_medias_controller')
```

## Step 2: Add Post Media Routes

Add these routes after the Posts routes section (around line 207):

```typescript
/**
 * Post Media routes
 */
router
  .group(() => {
    // Protected routes
    router
      .group(() => {
        // Create media for a post
        router.post(':postId/medias', [PostMediasController, 'store'])
        
        // Update a single media
        router.patch('medias/:id', [PostMediasController, 'update'])
        
        // Delete a single media
        router.delete('medias/:id', [PostMediasController, 'destroy'])
        
        // Delete all media for a post
        router.delete(':postId/medias', [PostMediasController, 'destroyAll'])
      })
      .middleware([middleware.auth()])

    // Public routes
    // Get all media for a post
    router.get(':postId/medias', [PostMediasController, 'index'])
    
    // Get a single media by ID
    router.get('medias/:id', [PostMediasController, 'show'])
    
    // Get media count for a post
    router.get(':postId/medias/count', [PostMediasController, 'getCount'])
  })
  .prefix('posts')
```

## Alternative: Separate Media Routes

If you prefer to have media routes under their own prefix, you can use this configuration instead:

```typescript
/**
 * Post Media routes
 */
router
  .group(() => {
    // Protected routes
    router
      .group(() => {
        // Create media for a post
        router.post('', [PostMediasController, 'store'])
        
        // Update a single media
        router.patch(':id', [PostMediasController, 'update'])
        
        // Delete a single media
        router.delete(':id', [PostMediasController, 'destroy'])
      })
      .middleware([middleware.auth()])

    // Public routes
    // Get a single media by ID
    router.get(':id', [PostMediasController, 'show'])
  })
  .prefix('post-medias')

// Additional routes for post-specific media operations
router
  .group(() => {
    // Protected routes
    router
      .group(() => {
        // Delete all media for a post
        router.delete(':postId/medias', [PostMediasController, 'destroyAll'])
      })
      .middleware([middleware.auth()])

    // Public routes
    // Get all media for a post
    router.get(':postId/medias', [PostMediasController, 'index'])
    
    // Get media count for a post
    router.get(':postId/medias/count', [PostMediasController, 'getCount'])
  })
  .prefix('posts')
```

## Complete Routes File Structure

Here's how the routes section should look with Post Media routes integrated:

```typescript
/**
 * Posts routes
 */
router
  .group(() => {
    // Protected
    router
      .group(() => {
        router.post('', [PostsController, 'store'])
        router.put(':id', [PostsController, 'update'])
        router.delete(':id', [PostsController, 'destroy'])
        
        // Post Media protected routes
        router.post(':postId/medias', [PostMediasController, 'store'])
        router.patch('medias/:id', [PostMediasController, 'update'])
        router.delete('medias/:id', [PostMediasController, 'destroy'])
        router.delete(':postId/medias', [PostMediasController, 'destroyAll'])
      })
      .middleware([middleware.auth()])

    // Public
    router.get('', [PostsController, 'index'])
    router.get('count', [PostsController, 'getTotal'])
    router.get('count-per-day', [PostsController, 'getPostsCountPerDay'])
    router.get(':id', [PostsController, 'show'])
    router.get('user/:userId', [PostsController, 'getByUser'])
    router.get('company/:companyId', [PostsController, 'getByCompanyId'])
    router.get('category/:category', [PostsController, 'getByCategory'])
    
    // Post Media public routes
    router.get(':postId/medias', [PostMediasController, 'index'])
    router.get('medias/:id', [PostMediasController, 'show'])
    router.get(':postId/medias/count', [PostMediasController, 'getCount'])
  })
  .prefix('posts')
```

## Route Endpoints Summary

After adding the routes, the following endpoints will be available:

### Protected Endpoints (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/:postId/medias` | Create media for a post |
| PATCH | `/api/posts/medias/:id` | Update a single media |
| DELETE | `/api/posts/medias/:id` | Delete a single media |
| DELETE | `/api/posts/:postId/medias` | Delete all media for a post |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/:postId/medias` | Get all media for a post |
| GET | `/api/posts/medias/:id` | Get a single media by ID |
| GET | `/api/posts/:postId/medias/count` | Get media count for a post |

## Testing the Routes

### 1. Create a post with media

```bash
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Post",
  "description": "Post description",
  "status": "published",
  "type": "news",
  "category": "Tech",
  "medias": [
    {
      "name": "photo.jpg",
      "type": "image/jpeg",
      "url": "https://example.com/photo.jpg",
      "size": "1024000"
    }
  ]
}
```

### 2. Add more media to existing post

```bash
POST /api/posts/{postId}/medias
Authorization: Bearer {token}
Content-Type: application/json

{
  "medias": [
    {
      "name": "another-photo.jpg",
      "type": "image/jpeg",
      "url": "https://example.com/another.jpg",
      "size": "856000"
    }
  ]
}
```

### 3. Get all media for a post

```bash
GET /api/posts/{postId}/medias?page=1&limit=10
```

### 4. Get a single media

```bash
GET /api/posts/medias/{mediaId}
```

### 5. Update media metadata

```bash
PATCH /api/posts/medias/{mediaId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "alt": "Updated alt text",
  "metadata": {
    "featured": true
  }
}
```

### 6. Delete a single media

```bash
DELETE /api/posts/medias/{mediaId}
Authorization: Bearer {token}
```

### 7. Delete all media for a post

```bash
DELETE /api/posts/{postId}/medias
Authorization: Bearer {token}
```

### 8. Get media count

```bash
GET /api/posts/{postId}/medias/count
```

## Notes

- All routes assume the API is prefixed with `/api/v1` or similar (adjust as per your configuration)
- Protected routes require a valid authentication token
- The controller automatically handles authorization checks based on user roles and post ownership
- Media files should be uploaded to your storage service first, then their URLs included in the request

