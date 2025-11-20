# API Test Examples

## Các endpoint mới để test

### 1. Get All Projects (cho cả /works/image và /works/cinematic)
```bash
# Request
GET http://localhost:8000/private/projects
Headers:
  Accept-Language: en
  Content-Type: application/json

# Query Parameters (optional)
?keywords=search_term
?tag_id=1

# Response sẽ chứa tất cả projects với thuộc tính images và videos
```

### 2. Get Single Project Detail
```bash
# Request
GET http://localhost:8000/private/projects/{project-slug}
Headers:
  Accept-Language: en
  Content-Type: application/json

# Response sẽ chứa project detail với cả images và videos arrays
```

## Test trong ứng dụng

### Route: /works/image
- **API được gọi**: `GET /private/projects`
- **Method**: `api.getProjects(locale, query, tagId)`
- **Xử lý**: Lọc projects có `images` array, flatten tất cả images
- **Khi nào**: Khi user truy cập `/works/image` hoặc `/ko/works/image`

### Route: /works/cinematic
- **API được gọi**: `GET /private/projects`
- **Method**: `api.getProjects(locale, query, tagId)`
- **Xử lý**: Lọc projects có `videos` array, flatten tất cả videos
- **Khi nào**: Khi user truy cập `/works/cinematic` hoặc `/ko/works/cinematic`

### Route: /works/{category}/{slug}
- **API được gọi**: `GET /private/projects/{slug}`
- **Method**: `api.getProject(locale, slug)`
- **Response**: Project detail với cả images và videos arrays
- **Khi nào**: Khi user click vào một project cụ thể

## Test với curl

```bash
# Test get all projects
curl -X GET "http://localhost:8000/private/projects" \
  -H "Accept-Language: en" \
  -H "Content-Type: application/json"

# Test get single project
curl -X GET "http://localhost:8000/private/projects/project-slug-here" \
  -H "Accept-Language: en" \
  -H "Content-Type: application/json"

# Test with search
curl -X GET "http://localhost:8000/private/projects?keywords=test" \
  -H "Accept-Language: en" \
  -H "Content-Type: application/json"

# Test with tag filter
curl -X GET "http://localhost:8000/private/projects?tag_id=1" \
  -H "Accept-Language: en" \
  -H "Content-Type: application/json"

# Test with both search and tag
curl -X GET "http://localhost:8000/private/projects?keywords=modern&tag_id=1" \
  -H "Accept-Language: en" \
  -H "Content-Type: application/json"
```

## Expected Response Format

### GET /private/projects

```json
{
  "data": [
    {
      "title": "Modern Architecture Project",
      "slug": "modern-architecture",
      "description": "A stunning modern building design",
      "images": [
        {
          "id": 1,
          "url": "https://example.com/image1.jpg",
          "title": "Front View",
          "description": "Main entrance view",
          "attachment_url": "https://...",
          "optimize_attachment_url": "https://..."
        },
        {
          "id": 2,
          "url": "https://example.com/image2.jpg",
          "title": "Side View",
          "description": "Side perspective"
        }
      ],
      "videos": [
        {
          "id": 10,
          "url": "https://example.com/video1.mp4",
          "title": "Walkthrough Video",
          "description": "Full building walkthrough",
          "link_video": "https://youtube.com/..."
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": { "en": "Architecture", "ko": "건축" }
        }
      ]
    }
  ]
}
```

### GET /private/projects/{slug}

```json
{
  "data": {
    "title": "Modern Architecture Project",
    "slug": "modern-architecture",
    "description": "A stunning modern building design",
    "images": [...],
    "videos": [...],
    "tags": [...]
  }
}
```

## Debugging Tips

1. **Kiểm tra Network tab** trong DevTools để xem request/response
2. **Kiểm tra Console** để xem có error nào không
3. **Kiểm tra baseURL** trong `app/lib/api.tsx` (mặc định: `http://localhost:8000`)
4. **Kiểm tra CORS** nếu gặp lỗi kết nối
5. **Kiểm tra authentication** nếu API yêu cầu token

## Flow hoàn chỉnh

### Flow cho /works/image

```
User visits /works/image
    ↓
Remix loader runs
    ↓
api.getProjects(locale, query, tagId)
    ↓
GET /private/projects
    ↓
Backend returns all projects with images and videos
    ↓
Frontend filters projects with images array
    ↓
Flatten all images from projects into works array
    ↓
Each image gets project metadata (project_title, project_slug, etc.)
    ↓
groupWorksByProject() organizes works back into projects
    ↓
Page renders with project grid
    ↓
User clicks a project
    ↓
Navigate to /works/image/{slug}
    ↓
api.getProject(locale, slug)
    ↓
GET /private/projects/{slug}
    ↓
Backend returns project detail with images and videos
    ↓
Modal opens with project images carousel
```

### Flow cho /works/cinematic

```
User visits /works/cinematic
    ↓
Remix loader runs
    ↓
api.getProjects(locale, query, tagId)
    ↓
GET /private/projects
    ↓
Backend returns all projects with images and videos
    ↓
Frontend filters projects with videos array
    ↓
Flatten all videos from projects into works array
    ↓
Each video gets project metadata
    ↓
groupWorksByProject() organizes works back into projects
    ↓
Page renders with project grid (video covers)
    ↓
User clicks a project
    ↓
Navigate to /works/cinematic/{slug}
    ↓
Modal opens with project videos
```
