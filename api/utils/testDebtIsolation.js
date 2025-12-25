import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Debt from '../models/Debt.js';

/**
 * Minimal regression check for multi-user debt isolation.
 *
 * This is NOT an HTTP test; it verifies the core invariant at the DB layer:
 * debts are always stored with a userId, and filtering by userId isolates them.
 */

dotenv.config();

const must = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const run = async () => {
  must(process.env.MONGO_URI, 'MONGO_URI is required');

  await mongoose.connect(process.env.MONGO_URI);

  const userA = new mongoose.Types.ObjectId();
  const userB = new mongoose.Types.ObjectId();

  // Create 2 debts for A, 1 debt for B
  const docs = await Debt.create([
    { userId: userA, name: 'A1', amount: 10, date: new Date(), status: 'unpaid' },
    { userId: userA, name: 'A2', amount: 20, date: new Date(), status: 'paid' },
    { userId: userB, name: 'B1', amount: 30, date: new Date(), status: 'unpaid' },
  ]);

  const ids = docs.map((d) => d._id);

  const a = await Debt.find({ userId: userA });
  const b = await Debt.find({ userId: userB });

  must(a.length === 2, `Expected 2 debts for userA, got ${a.length}`);
  must(b.length === 1, `Expected 1 debt for userB, got ${b.length}`);

  const overlap = a.some((d) => d.userId.toString() === userB.toString()) || b.some((d) => d.userId.toString() === userA.toString());
  must(!overlap, 'Found cross-user debts in filtered results');

  // Cleanup
  await Debt.deleteMany({ _id: { $in: ids } });

  console.log('✅ Debt isolation check passed');
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error('❌ Debt isolation check failed:', e.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
