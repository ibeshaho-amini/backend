const request = require('supertest');
const app = require('../index'); 

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Blog API', () => {
    let blog_id;
    let comment_id;
    const token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YzczOGY4NzFmMDljNzEzOTJkMjdkMiIsImlhdCI6MTcyNDgyNzExOCwiZXhwIjoxNzI0OTEzNTE4fQ.Suklu3J4IwvjSDLnpazhWbLIwIrIewHyNs5-ptPRWtU`;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

    it('should create a new blog post', async () => {
        const res= await request(app)
          .post('/api/blogs')
          .set('Authorization', token)
          .send({
            title: 'Test Blog',
            content: 'This is a test blog content',
            author: 'Test Author',
          });
    
        expect(201);
        expect(res.body).toHaveProperty('title', 'Test Blog');
        expect(res.body).toHaveProperty('content', 'This is a test blog content');
        expect(res.body).toHaveProperty('author', 'Test Author');
        blog_id = res.body._id;
      }, 30000);

      it('should get all blog posts', async () => {
        const res = await request(app)
          .get('/api/blogs')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200);
    
        // Check if the response body is an array
        expect(Array.isArray(res.body)).toBe(true);
    
        // Check if the array contains the blog post we seeded
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toHaveProperty('title', 'Test Blog');
        expect(res.body[0]).toHaveProperty('content', 'This is a test blog content');
        expect(res.body[0]).toHaveProperty('author', 'Test Author');
        });

      it('should update a blog post', async () => {
        const res= await request(app)
          .patch(`/api/blogs/${blog_id}`)
          .set('Authorization', token)
          .send({
            title: 'updated Test Blog1',
            content: 'updated This a test blog content',
            author: 'UPDATED Test Author',
          });
    
        expect(201);
        expect(res.body).toHaveProperty('title', 'updated Test Blog1');
        expect(res.body).toHaveProperty('content', 'updated This a test blog content');
      }, 30000);

      it('should delete a blog post', async () => {
        const res= await request(app)
          .delete(`/api/blogs/${blog_id}`)
          .set('Authorization', token)
          ;
    
        expect(204);
      }, 30000);

      it('should add a comment on a blog post', async () => {
        const res= await request(app)
          .post(`/api/blogs/${blog_id}/comments`)
          .set('Authorization', token)
          .send({
            like: 1,
            comment: 'This is a test comment',
          });
    
        expect(201);
        expect(res.body).toHaveProperty('like', 1);
        expect(res.body).toHaveProperty('comment', 'This is a test comment');
        comment_id = res.body._id;
      }, 30000);

      it('should update a comment on a blog post', async () => {
        const res= await request(app)
          .patch(`/api/comments/${comment_id}/like`)
          .set('Authorization', token)
          .send({
            like: 1,
            comment: 'updated test comment',
          });
    
        expect(201);
        expect(res.body).toHaveProperty('like', 1);
      }, 30000);
      
    it('should return 400 for invalid input', async () => {
        const res = await request(app)
            .post('/api/blogs')
            .set('Authorization', token)
            .send({
                title: '',
                content: 'This is a test blog content'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should return 401 for unauthorized access', async () => {
        const res = await request(app)
            .post('/api/blogs')  
            .send({
                title: 'Test Blog',
                content: 'This is a test blog content',
                author: 'Test Author'
            });

        expect(res.statusCode).toEqual(401);
    });
});
