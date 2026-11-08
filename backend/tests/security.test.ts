import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB, clearDB } from '../src/db/connection';
import { getOrCreateCampaign } from '../src/services/campaign.service';

describe('Security, Token & Rate Limiting Verification', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
    await getOrCreateCampaign('CAMP-TEST-SEC');
  });

  test('Rejects protected endpoint when Authorization header is missing', async () => {
    const res = await request(app).get('/api/game/boxes');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  test('Rejects protected endpoint when token is forged or tampered with', async () => {
    const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tampered_signature';
    const res = await request(app)
      .get('/api/game/boxes')
      .set('Authorization', `Bearer ${forgedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('TOKEN_INVALID');
  });

  test('Rejects invalid roll numbers with SQL/NoSQL injection attempt or XSS symbols', async () => {
    const resXss = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '<script>alert(1)</script>', campaignId: 'CAMP-TEST-SEC' });

    expect(resXss.status).toBe(400);

    const resInjection = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '{ $ne: 1 }', campaignId: 'CAMP-TEST-SEC' });

    expect(resInjection.status).toBe(400);
  });
});
