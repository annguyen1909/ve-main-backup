# API Migration Guide - Works to Projects

## Tổng quan thay đổi

API đã được cập nhật từ `/public/works` sang `/private/projects`. API mới trả về tất cả projects với thuộc tính `images` và `videos` bên trong mỗi project.

## Các thay đổi chính

### 1. Endpoint mới

| Route | Old API | New API | Cách xử lý |
|-------|---------|---------|------------|
| `/works/image` | `GET /public/works?slug_category=image` | `GET /private/projects` | Lọc projects có `images` array |
| `/works/cinematic` | `GET /public/works?slug_category=cinematic` | `GET /private/projects` | Lọc projects có `videos` array |
| `/works/{category}/{slug}` | `GET /public/works/{slug}` | `GET /private/projects/{slug}` | Trả về project với cả images và videos |

### 2. API Methods mới trong `app/lib/api.tsx`

```typescript
// Lấy tất cả projects (có cả images và videos)
getProjects(locale: string, query: string, tagId: string)
// Endpoint: GET /private/projects

// Lấy chi tiết một project
getProject(locale: string, slug_project: string)
// Endpoint: GET /private/projects/{slug}
```

### 3. Route Updates

#### `app/routes/($locale).works.$category/route.tsx`
- Loader function đã được cập nhật để sử dụng API mới dựa trên category
- Nếu `category.slug === 'image'`:
  1. Gọi `getProjects()` để lấy tất cả projects
  2. Lọc và flatten các `project.images` thành danh sách works
  3. Mỗi image được gắn thêm thông tin project (project_title, project_slug, etc.)
- Nếu `category.slug === 'cinematic'`:
  1. Gọi `getProjects()` để lấy tất cả projects
  2. Lọc và flatten các `project.videos` thành danh sách works
  3. Mỗi video được gắn thêm thông tin project
- Các category khác vẫn sử dụng `getWorks()` (backward compatible)

#### `app/routes/($locale).works.$category.$work/route.tsx`
- Loader function đã được cập nhật để sử dụng `getProject()` thay vì `getWork()`

## Cách test

### 1. Chạy demo script
```bash
npx tsx test-api-demo.ts
```

### 2. Test trong browser
- Truy cập `/works/image` - sẽ gọi `GET /private/projects/images`
- Truy cập `/works/cinematic` - sẽ gọi `GET /private/projects/video`
- Click vào một project - sẽ gọi `GET /private/projects/{slug}`

### 3. Test với search và filter
- `/works/image?q=test` - search projects
- `/works/image?tag_id=1` - filter by tag
- `/works/cinematic?q=video&tag_id=2` - combined filters

## Backward Compatibility

API cũ (`getWorks()` và `getWork()`) vẫn được giữ lại để đảm bảo backward compatibility với các category khác ngoài 'image' và 'cinematic'.

## Response Format

### GET /private/projects

Response trả về danh sách projects, mỗi project có thuộc tính `images` và `videos`:

```typescript
interface ResourceCollection<T> {
  data: T[];
}

interface ProjectResponse {
  title: string;
  slug: string;
  description: string;
  images: Array<{
    id: number;
    url: string;
    title: string;
    description?: string;
    // ... other image properties
  }>;
  videos: Array<{
    id: number;
    url: string;
    title: string;
    description?: string;
    // ... other video properties
  }>;
  tags: WorkTag[];
}
```

### Ví dụ Response

```json
{
  "data": [
    {
      "title": "Modern Architecture Project",
      "slug": "modern-architecture",
      "description": "A stunning modern building",
      "images": [
        {
          "id": 1,
          "url": "https://example.com/image1.jpg",
          "title": "Front View"
        },
        {
          "id": 2,
          "url": "https://example.com/image2.jpg",
          "title": "Side View"
        }
      ],
      "videos": [
        {
          "id": 10,
          "url": "https://example.com/video1.mp4",
          "title": "Walkthrough"
        }
      ],
      "tags": [...]
    }
  ]
}
```

### Cách xử lý trong Route

Khi route `/works/image` được truy cập:
1. API trả về tất cả projects
2. Code lọc projects có `images` array
3. Flatten tất cả images từ các projects thành một danh sách
4. Mỗi image được gắn thêm metadata từ project cha:
   - `project_title`
   - `project_description`
   - `project_slug`

## Notes

- API endpoints mới sử dụng `/private/` prefix thay vì `/public/`
- Tất cả endpoints đều yêu cầu `Accept-Language` header
- Query parameters: `keywords`, `tag_id` vẫn hoạt động như cũ
- Base URL mặc định: `http://localhost:8000` (có thể thay đổi qua `BASE_API_URL` env variable)
