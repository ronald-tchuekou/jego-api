# Post Media Module Documentation

This document describes the Post Media management module that handles media files (images and videos) for posts in the application.

## Overview

The Post Media module provides a complete solution for managing media files associated with posts. It includes:

- **Model**: `PostMedia` - Represents individual media files
- **Service**: `PostMediaService` - Business logic for media operations
- **Controller**: `PostMediasController` - HTTP endpoints for media management
- **Validators**: Validation schemas for media data
- **Abilities**: Authorization rules for media access control

## Database Schema

### PostMedia Table (`post_medias`)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| post_id | UUID | Foreign key to posts table |
| name | String | Media file name |
| type | String | MIME type (e.g., 'image/jpeg', 'video/mp4') |
| url | String | URL to the media file |
| size | String | File size |
| thumbnail_url | String (optional) | URL to thumbnail image |
| alt | String (optional) | Alternative text for accessibility |
| metadata | JSON (optional) | Additional metadata (width, height, duration, etc.) |
| created_at | Timestamp | Creation timestamp |
| updated_at | Timestamp | Last update timestamp |

### Post Table Updates

The `posts` table has been extended with:
- `media_type` - Enum field ('image' or 'video') indicating the type of media attached to the post

## Integration with Posts

### Creating a Post with Media

When creating or updating a post, you can now include media files:

```typescript
// Request body example for creating a post with media
{
  "title": "My Post Title",
  "description": "Post description",
  "status": "published",
  "type": "news",
  "category": "Technology",
  "medias": [
    {
      "name": "photo1.jpg",
      "type": "image/jpeg",
      "url": "https://example.com/uploads/photo1.jpg",
      "size": "2048000",
      "thumbnailUrl": "https://example.com/uploads/thumbs/photo1.jpg",
      "alt": "A beautiful sunset",
      "metadata": {
        "width": 1920,
        "height": 1080,
        "aspectRatio": 1.78
      }
    }
  ]
}
```

### Updating a Post with Media

When updating a post, you can:
- Add new media by providing a `medias` array
- Replace all media by providing a new `medias` array
- Remove all media by providing an empty `medias` array

```typescript
// Update post and replace media
PATCH /posts/:id
{
  "title": "Updated Title",
  "medias": [
    // New media array replaces all existing media
  ]
}
```

## PostMediaService API

### Methods

#### `createMany(postId: string, mediasData: PostMediaData[]): Promise<PostMedia[]>`
Creates multiple media files for a post.
- Validates post exists
- Validates media data
- Automatically sets the post's `mediaType` based on the first media file
- Returns array of created media objects

#### `updatePostMedias(postId: string, mediasData: PostMediaData[]): Promise<PostMedia[]>`
Replaces all existing media for a post with new media.
- Deletes all existing media
- Creates new media
- Updates post's `mediaType`
- Returns array of created media objects

#### `deleteMedia(mediaId: string): Promise<boolean>`
Deletes a single media file.
- Checks if post has remaining media
- Clears post's `mediaType` if no media left

#### `deleteAllPostMedias(postId: string): Promise<boolean>`
Deletes all media for a specific post.
- Clears post's `mediaType`

#### `getPostMedias(postId: string, options?: { page?: number, limit?: number })`
Retrieves all media for a post with pagination.
- Returns paginated results

#### `getMediaById(mediaId: string): Promise<PostMedia | null>`
Retrieves a single media by ID.

#### `getMediaCount(postId: string): Promise<number>`
Gets the total count of media files for a post.

#### `updateMedia(mediaId: string, data: Partial<PostMediaData>): Promise<PostMedia>`
Updates a single media's metadata.

## PostMediasController API

### Endpoints

#### `GET /posts/:postId/medias`
Get all media for a specific post.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 10,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

#### `GET /medias/:id`
Get a single media by ID.

**Response:**
```json
{
  "data": {
    "id": "...",
    "postId": "...",
    "name": "photo.jpg",
    "type": "image/jpeg",
    "url": "...",
    "size": "2048000",
    "thumbnailUrl": "...",
    "alt": "...",
    "metadata": {},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `POST /posts/:postId/medias`
Create media for a post.

**Request Body:**
```json
{
  "medias": [
    {
      "name": "photo.jpg",
      "type": "image/jpeg",
      "url": "https://example.com/photo.jpg",
      "size": "2048000",
      "thumbnailUrl": "https://example.com/thumb.jpg",
      "alt": "Description",
      "metadata": {}
    }
  ]
}
```

**Authorization:** Requires `post:create` permission

#### `PATCH /medias/:id`
Update a single media's metadata.

**Request Body:**
```json
{
  "name": "new-name.jpg",
  "alt": "Updated description",
  "metadata": {
    "updated": true
  }
}
```

**Authorization:** User must own the post

#### `DELETE /medias/:id`
Delete a single media.

**Authorization:** Requires `post:update` permission and user must own the post

#### `DELETE /posts/:postId/medias`
Delete all media for a post.

**Authorization:** Requires `post:update` permission and user must own the post

#### `GET /posts/:postId/medias/count`
Get the count of media files for a post.

**Response:**
```json
{
  "count": 5
}
```

## Authorization

### Post Media Abilities

#### `createPostMedia`
- Admins can add media to any post
- Company admins and agents can add media to posts in their company
- Post owners can add media to their own posts

#### `updatePostMedia`
- Admins can update any media
- Post owners can update media in their posts

#### `deletePostMedia`
- Admins can delete any media
- Company admins and agents can delete media from posts in their company
- Post owners can delete media from their own posts

## Usage Examples

### Example 1: Creating a Post with Images

```typescript
POST /posts
{
  "title": "Product Launch",
  "description": "We're excited to announce our new product!",
  "status": "published",
  "type": "news",
  "category": "Business",
  "medias": [
    {
      "name": "product-main.jpg",
      "type": "image/jpeg",
      "url": "https://cdn.example.com/products/main.jpg",
      "size": "1024000",
      "thumbnailUrl": "https://cdn.example.com/products/main-thumb.jpg",
      "alt": "Product main image",
      "metadata": {
        "width": 1200,
        "height": 800
      }
    },
    {
      "name": "product-detail.jpg",
      "type": "image/jpeg",
      "url": "https://cdn.example.com/products/detail.jpg",
      "size": "856000",
      "thumbnailUrl": "https://cdn.example.com/products/detail-thumb.jpg",
      "alt": "Product detail view"
    }
  ]
}
```

### Example 2: Adding Media to Existing Post

```typescript
POST /posts/:postId/medias
{
  "medias": [
    {
      "name": "additional-photo.jpg",
      "type": "image/jpeg",
      "url": "https://cdn.example.com/additional.jpg",
      "size": "750000"
    }
  ]
}
```

### Example 3: Updating Post and Replacing All Media

```typescript
PATCH /posts/:postId
{
  "title": "Updated Title",
  "medias": [
    {
      "name": "new-media.jpg",
      "type": "image/jpeg",
      "url": "https://cdn.example.com/new.jpg",
      "size": "900000"
    }
  ]
}
```

### Example 4: Removing All Media from a Post

```typescript
PATCH /posts/:postId
{
  "medias": []
}
```

or

```typescript
DELETE /posts/:postId/medias
```

## Model Relationships

### Post Model
```typescript
@hasMany(() => PostMedia)
declare medias: HasMany<typeof PostMedia>
```

### PostMedia Model
```typescript
@belongsTo(() => Post)
declare post: BelongsTo<typeof Post>
```

## Automatic Behavior

1. **Media Type Detection**: When media is added to a post, the `mediaType` field is automatically set based on the first media file's MIME type (image/* → 'image', video/* → 'video')

2. **Cascade Delete**: When a post is deleted, all associated media records are automatically deleted (database-level cascade)

3. **Media Type Cleanup**: When the last media file is removed from a post, the post's `mediaType` is automatically set to `null`

4. **Automatic Preloading**: All post queries automatically preload the `medias` relationship for convenience

## Validation Rules

### Media Creation/Update
- `name`: Required, minimum 1 character
- `type`: Required, minimum 1 character
- `url`: Required, must be a valid URL
- `size`: Required string
- `thumbnailUrl`: Optional, must be a valid URL if provided
- `alt`: Optional, maximum 255 characters
- `metadata`: Optional JSON object

## Best Practices

1. **File Upload Flow**:
   - First upload files to your storage service
   - Get the URLs and metadata
   - Then create the post with media URLs

2. **Media Organization**:
   - Group related media in a single post
   - Use the same media type (all images or all videos) per post
   - Provide meaningful `alt` text for accessibility

3. **Performance**:
   - Always provide thumbnail URLs for large images
   - Include width/height in metadata to prevent layout shifts
   - Use pagination when retrieving media for posts with many files

4. **Error Handling**:
   - Validate files before uploading to storage
   - Handle storage failures gracefully
   - Clean up orphaned storage files if database operations fail

## Migration

To enable this feature in your database:

```bash
# Run the new migrations
node ace migration:run
```

This will:
1. Create the `post_medias` table
2. Add the `media_type` column to the `posts` table

## Notes

- The `image` field in the post validators is kept for backward compatibility but should be deprecated in favor of the `medias` array
- Posts can have multiple media files of the same type
- The module is designed to work with external file storage (S3, Cloudinary, etc.)
- Media URLs should be publicly accessible or properly signed URLs

