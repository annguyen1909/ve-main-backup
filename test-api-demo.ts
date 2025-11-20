/**
 * Demo script to test the new private project API endpoints
 * 
 * API Changes:
 * - Old: /public/works?slug_category=image
 * - New: /private/projects (then filter by images property)
 * 
 * - Old: /public/works?slug_category=cinematic
 * - New: /private/projects (then filter by videos property)
 * 
 * - Old: /public/works/{slug}
 * - New: /private/projects/{slug}
 * 
 * Response Structure:
 * {
 *   data: [
 *     {
 *       title: "Project Title",
 *       slug: "project-slug",
 *       description: "Project description",
 *       images: [ { url: "...", title: "..." }, ... ],
 *       videos: [ { url: "...", title: "..." }, ... ]
 *     }
 *   ]
 * }
 */

import { Api } from "./app/lib/api";

async function testProjectAPIs() {
  const api = new Api();
  const locale = "en";

  console.log("=== Testing New Private Project APIs ===\n");

  try {
    // Test 1: Get All Projects
    console.log("1. Testing GET /private/projects");
    console.log("   This endpoint returns all projects with images and videos properties");
    const projects = await api.getProjects(locale, "", "");
    console.log(`   ✓ Success: Found ${projects.data.data.length} projects`);
    
    if (projects.data.data.length > 0) {
      const firstProject = projects.data.data[0];
      console.log(`   Sample Project: ${firstProject.title}`);
      console.log(`   - Images: ${firstProject.images?.length || 0}`);
      console.log(`   - Videos: ${firstProject.videos?.length || 0}\n`);
    }

    // Test 2: Filter Projects for Image Category
    console.log("2. Filtering projects for /works/image route");
    const imageProjects = projects.data.data.filter((p: any) => 
      p.images && Array.isArray(p.images) && p.images.length > 0
    );
    console.log(`   ✓ Found ${imageProjects.length} projects with images`);
    const totalImages = imageProjects.reduce((sum: number, p: any) => sum + p.images.length, 0);
    console.log(`   Total images: ${totalImages}\n`);

    // Test 3: Filter Projects for Cinematic Category
    console.log("3. Filtering projects for /works/cinematic route");
    const videoProjects = projects.data.data.filter((p: any) => 
      p.videos && Array.isArray(p.videos) && p.videos.length > 0
    );
    console.log(`   ✓ Found ${videoProjects.length} projects with videos`);
    const totalVideos = videoProjects.reduce((sum: number, p: any) => sum + p.videos.length, 0);
    console.log(`   Total videos: ${totalVideos}\n`);

    // Test 4: Get Single Project Detail
    if (projects.data.data.length > 0) {
      const firstProject = projects.data.data[0];
      console.log("4. Testing GET /private/projects/{slug}");
      console.log(`   Route: /works/image/${firstProject.slug}`);
      const project = await api.getProject(locale, firstProject.slug);
      console.log(`   ✓ Success: ${project.data.data.title}`);
      console.log(`   Description: ${project.data.data.description || 'N/A'}`);
      console.log(`   Images: ${project.data.data.images?.length || 0}`);
      console.log(`   Videos: ${project.data.data.videos?.length || 0}\n`);
    }

    // Test 5: Search with query
    console.log("5. Testing search with query parameter");
    const searchResults = await api.getProjects(locale, "test", "");
    console.log(`   ✓ Success: Found ${searchResults.data.data.length} results for 'test'\n`);

    // Test 6: Filter by tag
    console.log("6. Testing filter by tag_id");
    const tagResults = await api.getProjects(locale, "", "1");
    console.log(`   ✓ Success: Found ${tagResults.data.data.length} results for tag_id=1\n`);

    console.log("=== All Tests Completed Successfully ===");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
  }
}

// Run the demo
testProjectAPIs();
