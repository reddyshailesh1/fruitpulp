import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB, clearDB } from '../src/db/connection';
import { Campaign } from '../src/db/models/Campaign';
import { Participation } from '../src/db/models/Participation';

describe('Game Logic, 3-Chance Rules & Final Discount Calculation', () => {
  const campaignId = 'CAMP-ORANGE-CRITICAL';

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();

    // Create a deterministic box arrangement for precise test verification:
    // Box 1 -> 5%
    // Box 2 -> 6%
    // Box 3 -> 7%
    // Box 4 -> 8%
    // Box 5 -> 9%
    // Box 6 -> 10%
    // Box 7 -> 5%
    // Box 8 -> 6%
    // Box 9 -> 7%
    await Campaign.create({
      campaignId,
      name: 'Orange Pulp Test Carnival',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      totalBoxes: 9,
      totalChances: 3,
      discountConfiguration: [
        { discount: 5, count: 2 },
        { discount: 6, count: 2 },
        { discount: 7, count: 2 },
        { discount: 8, count: 1 },
        { discount: 9, count: 1 },
        { discount: 10, count: 1 },
      ],
      boxArrangement: [
        { boxNumber: 1, discount: 5 },
        { boxNumber: 2, discount: 6 },
        { boxNumber: 3, discount: 7 },
        { boxNumber: 4, discount: 8 },
        { boxNumber: 5, discount: 9 },
        { boxNumber: 6, discount: 10 },
        { boxNumber: 7, discount: 5 },
        { boxNumber: 8, discount: 6 },
        { boxNumber: 9, discount: 7 },
      ],
    });
  });

  test('GET /api/game/boxes returns all 9 boxes and NEVER exposes discounts', async () => {
    const studentRes = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21CS001', campaignId });

    const token = studentRes.body.data.token;

    const boxesRes = await request(app)
      .get('/api/game/boxes')
      .set('Authorization', `Bearer ${token}`);

    expect(boxesRes.status).toBe(200);
    expect(boxesRes.body.data.availableBoxes).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(boxesRes.body.data.selectedBoxes).toEqual([]);
    expect(boxesRes.body.data.chancesUsed).toBe(0);

    // Verify no discounts leaked in response
    const jsonStr = JSON.stringify(boxesRes.body);
    expect(jsonStr).not.toContain('boxArrangement');
  });

  test('CRITICAL TEST: 3-Chance flow (5% -> 8% -> 7%), finalDiscount = 7, 4th selection rejected', async () => {
    // 1. Student enters roll number
    const loginRes = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21CS777', campaignId });
    const token = loginRes.body.data.token;
    expect(token).toBeDefined();

    // 2. Chance 1: Select Box 1 (Assigned 5%)
    const select1 = await request(app)
      .post('/api/game/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ boxNumber: 1 });

    expect(select1.status).toBe(200);
    expect(select1.body.data.reward.boxNumber).toBe(1);
    expect(select1.body.data.reward.discount).toBe(5);
    expect(select1.body.data.chancesUsed).toBe(1);
    expect(select1.body.data.remainingChances).toBe(2);
    expect(select1.body.data.status).toBe('IN_PROGRESS');
    expect(select1.body.data.isFinalChance).toBe(false);
    expect(select1.body.data.finalDiscount).toBeNull();

    // Verify boxes available now exclude Box 1
    const boxesAfter1 = await request(app)
      .get('/api/game/boxes')
      .set('Authorization', `Bearer ${token}`);
    expect(boxesAfter1.body.data.availableBoxes).not.toContain(1);
    expect(boxesAfter1.body.data.selectedBoxes).toEqual([1]);

    // 3. Duplicate selection attempt on Box 1 must be rejected
    const dupRes = await request(app)
      .post('/api/game/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ boxNumber: 1 });
    // Returns idempotent reward or error
    expect(dupRes.body.data.reward.boxNumber).toBe(1);

    // 4. Chance 2: Select Box 4 (Assigned 8%)
    const select2 = await request(app)
      .post('/api/game/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ boxNumber: 4 });

    expect(select2.status).toBe(200);
    expect(select2.body.data.reward.boxNumber).toBe(4);
    expect(select2.body.data.reward.discount).toBe(8);
    expect(select2.body.data.chancesUsed).toBe(2);
    expect(select2.body.data.remainingChances).toBe(1);
    expect(select2.body.data.status).toBe('IN_PROGRESS');
    expect(select2.body.data.isFinalChance).toBe(false);
    expect(select2.body.data.finalDiscount).toBeNull();

    // 5. Chance 3: Select Box 3 (Assigned 7%)
    const select3 = await request(app)
      .post('/api/game/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ boxNumber: 3 });

    expect(select3.status).toBe(200);
    expect(select3.body.data.reward.boxNumber).toBe(3);
    expect(select3.body.data.reward.discount).toBe(7);
    expect(select3.body.data.chancesUsed).toBe(3);
    expect(select3.body.data.remainingChances).toBe(0);
    expect(select3.body.data.isFinalChance).toBe(true);
    expect(select3.body.data.status).toBe('COMPLETED');

    // STRICT CHECK: The third discount must be the FINAL discount (7%), NOT 5 + 8 + 7 = 20%!
    expect(select3.body.data.finalDiscount).toBe(7);
    expect(select3.body.data.finalRewardCode).toMatch(/^OP-7-[A-Z0-9]+$/);

    // 6. Verify in MongoDB directly
    const dbRecord = await Participation.findOne({ rollNumber: '21CS777', campaignId });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.chancesUsed).toBe(3);
    expect(dbRecord?.selectedBoxes).toEqual([1, 4, 3]);
    expect(dbRecord?.rewards.length).toBe(3);
    expect(dbRecord?.rewards[0].discount).toBe(5);
    expect(dbRecord?.rewards[1].discount).toBe(8);
    expect(dbRecord?.rewards[2].discount).toBe(7);
    expect(dbRecord?.finalDiscount).toBe(7);
    expect(dbRecord?.status).toBe('COMPLETED');
    expect(dbRecord?.completedAt).toBeDefined();

    // 7. Fourth selection attempt MUST BE REJECTED
    const select4 = await request(app)
      .post('/api/game/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ boxNumber: 5 });

    expect(select4.status).toBe(400);
    expect(select4.body.success).toBe(false);
    expect(select4.body.error).toContain('already completed');

    // 8. Refresh / GET /api/game/status returns completed status and 7% final discount
    const statusRes = await request(app)
      .get('/api/game/status')
      .set('Authorization', `Bearer ${token}`);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('COMPLETED');
    expect(statusRes.body.data.chancesUsed).toBe(3);
    expect(statusRes.body.data.finalDiscount).toBe(7);
    expect(statusRes.body.data.rewards.length).toBe(3);
  });

  test('Session Recovery / Refresh after Chance 1 and Chance 2 restores exact state', async () => {
    const loginRes = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21IT023', campaignId });
    const token = loginRes.body.data.token;

    // Pick Box 2 (6%)
    await request(app)
      .post('/api/game/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ boxNumber: 2 });

    // Simulate page refresh -> calls /api/game/status
    const refresh1 = await request(app)
      .get('/api/game/status')
      .set('Authorization', `Bearer ${token}`);

    expect(refresh1.body.data.chancesUsed).toBe(1);
    expect(refresh1.body.data.selectedBoxes).toEqual([2]);
    expect(refresh1.body.data.rewards[0].discount).toBe(6);
    expect(refresh1.body.data.status).toBe('IN_PROGRESS');

    // Simulate opening from another device with same roll number
    const otherDeviceLogin = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21IT023', campaignId });

    expect(otherDeviceLogin.body.data.chancesUsed).toBe(1);
    expect(otherDeviceLogin.body.data.selectedBoxes).toEqual([2]);
  });

  test('POST /api/game/claim-current allows utilizing coupon immediately after 1 chance', async () => {
    const loginRes = await request(app)
      .post('/api/student/verify')
      .send({ rollNumber: '21ME777', campaignId });
    const token = loginRes.body.data.token;

    // Chance 1: Select Box 6 (10%)
    const selectRes = await request(app)
      .post('/api/game/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ boxNumber: 6 });

    expect(selectRes.body.data.reward.discount).toBe(10);
    expect(selectRes.body.data.status).toBe('IN_PROGRESS');

    // Utilize current coupon immediately without picking boxes 2 and 3!
    const claimRes = await request(app)
      .post('/api/game/claim-current')
      .set('Authorization', `Bearer ${token}`);

    expect(claimRes.status).toBe(200);
    expect(claimRes.body.data.status).toBe('COMPLETED');
    expect(claimRes.body.data.finalDiscount).toBe(10);
    expect(claimRes.body.data.finalRewardCode).toBe(selectRes.body.data.reward.rewardCode);

    // Verify further box selection is blocked
    const selectAfter = await request(app)
      .post('/api/game/select')
      .set('Authorization', `Bearer ${token}`)
      .send({ boxNumber: 1 });

    expect(selectAfter.status).toBe(400);
  });

  test('Statistical verification: 90% probability for 5, 6, 7 and combined 10% for 9 and 10', () => {
    const { sampleWeightedDiscount } = require('../src/services/campaign.service');
    const counts: Record<number, number> = { 5: 0, 6: 0, 7: 0, 9: 0, 10: 0 };
    const trials = 10000;

    for (let i = 0; i < trials; i++) {
      const discount = sampleWeightedDiscount();
      counts[discount] = (counts[discount] || 0) + 1;
    }

    const prob5 = counts[5] / trials;
    const prob6 = counts[6] / trials;
    const prob7 = counts[7] / trials;
    const prob9 = counts[9] / trials;
    const prob10 = counts[10] / trials;

    const combined90 = prob5 + prob6 + prob7;
    const combined10 = prob9 + prob10;

    // Combined 5, 6, 7 must be ~90%
    expect(combined90).toBeGreaterThanOrEqual(0.88);
    expect(combined90).toBeLessThanOrEqual(0.92);

    // Combined 9 and 10 must be ~10%
    expect(combined10).toBeGreaterThanOrEqual(0.08);
    expect(combined10).toBeLessThanOrEqual(0.12);

    // 5% discount is highest (~50%)
    expect(prob5).toBeGreaterThanOrEqual(0.46);
    expect(prob5).toBeLessThanOrEqual(0.54);

    // 6% discount is next highest (~25%)
    expect(prob6).toBeGreaterThanOrEqual(0.22);
    expect(prob6).toBeLessThanOrEqual(0.28);

    // 10% discount is ~5%
    expect(prob10).toBeGreaterThanOrEqual(0.035);
    expect(prob10).toBeLessThanOrEqual(0.065);
  });
});
