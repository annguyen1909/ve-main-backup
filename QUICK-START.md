# Quick Start - API Projects

## Thay đổi chính

API đã đổi từ `/public/works` sang `/private/projects`. API mới trả về projects với thuộc tính `images` và `videos`.

## API Endpoint

```bash
# Lấy tất cả projects
GET /private/projects

# Lấy chi tiết một project
GET /private/projects/{slug}
```

## Response Structure

```json
{
  "data": [
    {
      "title": "Project Name",
      "slug": "project-slug",
      "description": "...",
      "images": [
        { "id": 1, "url": "...", "title": "..." }
      ],
      "videos": [
        { "id": 10, "url": "...", "title": "..." }
      ]
    }
  ]
}
```

## Cách hoạt động

### Route: /works/image
1. Gọi `GET /private/projects`
2. Lọc projects có `images` array
3. Flatten tất cả images thành danh sách works
4. Hiển thị grid của projects

### Route: /works/cinematic
1. Gọi `GET /private/projects`
2. Lọc projects có `videos` array
3. Flatten tất cả videos thành danh sách works
4. Hiển thị grid của projects

## Test nhanh

```bash
# Test API
curl http://localhost:8000/private/projects \
  -H "Accept-Language: en"

# Test trong browser
# Truy cập: http://localhost:3000/works/image
# Truy cập: http://localhost:3000/works/cinematic
```

## Files đã thay đổi

- `app/lib/api.tsx` - Thêm `getProjects()` và `getProject()`
- `app/routes/($locale).works.$category/route.tsx` - Logic lọc images/videos
- `app/routes/($locale).works.$category.$work/route.tsx` - Sử dụng `getProject()`

## Backward Compatibility

API cũ (`getWorks()`, `getWork()`) vẫn được giữ lại cho các category khác ngoài 'image' và 'cinematic'.
