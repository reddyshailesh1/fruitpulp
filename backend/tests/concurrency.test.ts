import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB, clearDB } from '../src/db/connection';
import { getOrCreateCampaign } from '../src/services/campaign.service';
import { Participation } from '../src/db/models/Participation';

describe('Concurrency & Race Condition Defenses', () => {
  const campaignId = 'CAMP-CONCURRENCY-TEST';

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
    await getOrCreateCampaign(campaignId);
  });

  test('Simultaneous verify requests for the same roll number create exactly 1 document in MongoDB', async () => {
    const rollNumber = '21CSCONC01';

    // Send 5 parallel verify requests simultaneously
    const promises = Array.from({ length: 5 }, () =>
      request(app)
        .post('/api/student/verify')
        .send({ rollNumber, campaignId })
    );

    const responses = await Promise.all(promises);

    // All should succeed (200)
    for (const res of responses) {
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rollNumber).toBe(rollNumber);
    }

    // Verify exactly ONE record exists in MongoDB
    const records = await Participation.find({ rollNumber, campaignId });
    expect(records.length).toBe(1);
  });

  test('Simultaneous box selection attempts prevent race condition and chance skipping', async () => {
    const loginRes = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21CSCONC02', campaignId });

    const token = loginRes.body.data.token;

    // Send two simultaneous requests trying to pick different boxes for Chance 1
    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/game/select')
        .set('Authorization', `Bearer ${token}`)
        .send({ boxNumber: 1 }),
      request(app)
        .post('/api/game/select')
        .set('Authorization', `Bearer ${token}`)
        .send({ boxNumber: 2 }),
    ]);

    // One of them must succeed (200) and the other will either be rejected (409/400) or serialized cleanly
    const statuses = [resA.status, resB.status];
    expect(statuses).toContain(200);

    const record = await Participation.findOne({ rollNumber: '21CSCONC02' });
    expect(record).not.toBeNull();
    // chancesUsed must accurately equal the number of registered selectedBoxes
    expect(record?.chancesUsed).toBe(record?.selectedBoxes.length);
  });
});
