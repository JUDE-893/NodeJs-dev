import request from 'supertest';
import app from '../src/app.js';

describe('Server Health Check', () => {
  it('GET /health should return status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
    expect(res.body.environment).toBeDefined();
  });
});
