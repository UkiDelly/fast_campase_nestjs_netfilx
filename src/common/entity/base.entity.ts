import dayjs from 'dayjs';
import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export class BaseTable {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    transformer: {
      to: () => dayjs(),
      from: (value: Date) => dayjs(value).format('YYYY-MM-DD hh:mm:ss A'),
    },
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    transformer: {
      to: () => new Date(),
      from: (value: Date) => dayjs(value).format('YYYY-MM-DD hh:mm:ss A'),
    },
  })
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
