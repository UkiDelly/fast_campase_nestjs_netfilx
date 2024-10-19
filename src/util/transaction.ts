import type { DataSource, QueryRunner } from 'typeorm';

export async function transaction<T>(ds: DataSource, cb: (qr: QueryRunner) => Promise<T>) {
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    const result = await cb(qr);
    await qr.commitTransaction();

    return result;
  } catch (e) {
    console.log(e);
    await qr.rollbackTransaction();
  } finally {
    await qr.release();
  }
}
