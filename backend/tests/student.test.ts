import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB, clearDB } from '../src/db/connection';
import { Campaign } from '../src/db/models/Campaign';
import { Participation } from '../src/db/models/Participation';
import { getOrCreateCampaign } from '../src/services/campaign.service';

describe('Student Verification & Roll Number Logic', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
    await getOrCreateCampaign('CAMP-TEST-2025');
  });

  test('1. First-time roll number entry creates participation record', async () => {
    const res = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21CS045', campaignId: 'CAMP-TEST-2025' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rollNumber).toBe('21CS045');
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.chancesUsed).toBe(0);
    expect(res.body.data.selectedBoxes).toEqual([]);
    expect(res.body.data.token).toBeDefined();

    // Verify in database
    const saved = await Participation.findOne({ rollNumber: '21CS045' });
    expect(saved).not.toBeNull();
    expect(saved?.chancesUsed).toBe(0);
  });

  test('2. Same roll number with lowercase letters and accidental spaces is normalized', async () => {
    // First creation
    await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21CS045', campaignId: 'CAMP-TEST-2025' });

    // Request with lowercase and spaces
    const res = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '  21cs 045   ', campaignId: 'CAMP-TEST-2025' });

    expect(res.status).toBe(200);
    expect(res.body.data.rollNumber).toBe('21CS045');
    // Ensure only 1 document in DB
    const count = await Participation.countDocuments({ rollNumber: '21CS045' });
    expect(count).toBe(1);
  });

  test('3. Existing roll number with IN_PROGRESS status restores game', async () => {
    // Manually create an in-progress record with 1 chance used
    await Participation.create({
      campaignId: 'CAMP-TEST-2025',
      rollNumber: '21EC101',
      chancesUsed: 1,
      selectedBoxes: [3],
      rewards: [
        {
          boxNumber: 3,
          discount: 6,
          rewardCode: 'OP-6-ABC123',
          selectedAt: new Date(),
          revealedAt: new Date(),
        },
      ],
      status: 'IN_PROGRESS',
    });

    const res = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21ec101', campaignId: 'CAMP-TEST-2025' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.chancesUsed).toBe(1);
    expect(res.body.data.selectedBoxes).toEqual([3]);
    expect(res.body.data.rewards.length).toBe(1);
    expect(res.body.data.rewards[0].discount).toBe(6);
  });

  test('4. Existing roll number with COMPLETED status returns COMPLETED and prevents restart', async () => {
    // Create a completed record
    await Participation.create({
      campaignId: 'CAMP-TEST-2025',
      rollNumber: '21ME099',
      chancesUsed: 3,
      selectedBoxes: [1, 4, 8],
      rewards: [
        { boxNumber: 1, discount: 5, rewardCode: 'OP-5-1', selectedAt: new Date(), revealedAt: new Date() },
        { boxNumber: 4, discount: 8, rewardCode: 'OP-8-2', selectedAt: new Date(), revealedAt: new Date() },
        { boxNumber: 8, discount: 7, rewardCode: 'OP-7-3', selectedAt: new Date(), revealedAt: new Date() },
      ],
      finalDiscount: 7,
      finalRewardCode: 'OP-7-3',
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21ME099', campaignId: 'CAMP-TEST-2025' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.finalDiscount).toBe(7);
    expect(res.body.data.finalRewardCode).toBe('OP-7-3');
    expect(res.body.data.chancesUsed).toBe(3);
  });

  test('5. Rejects invalid roll number formats (too short or invalid chars)', async () => {
    const resShort = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: 'A', campaignId: 'CAMP-TEST-2025' });

    expect(resShort.status).toBe(400);

    const resInvalid = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: 'ROLL$$$###', campaignId: 'CAMP-TEST-2025' });

    expect(resInvalid.status).toBe(400);
  });

  test('6. Rejects participation when campaign is inactive or expired', async () => {
    await Campaign.updateOne(
      { campaignId: 'CAMP-TEST-2025' },
      { $set: { status: 'INACTIVE' } }
    );

    const res = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21CS099', campaignId: 'CAMP-TEST-2025' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CAMPAIGN_INACTIVE');
  });
});
