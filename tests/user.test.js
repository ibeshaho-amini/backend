

const request = require('supertest');
const app = require('../index'); 

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('User API', () => {
  let mongoServer;

  beforeAll(async () => {    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    
    if (mongoose.connection.readyState !== 0) {
     
      await mongoose.disconnect();
    }
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
})

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoServer.stop();
});

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        email: 'amina@gmail.com',
        password: 'amina123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('email', 'amina@gmail.com');
  }, 30000);

  it('should login the user and return a token', async () => {
    await request(app)
      .post('/api/users')
      .send({
        email: 'amina@gmail.com',
        password: 'amina123',
      });

    const res = await request(app)
      .post('/api/userLogin')
      .send({
        email: 'amina@gmail.com',
        password: 'amina123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).toMatch(/^Bearer /);
  }, 30000);
});
