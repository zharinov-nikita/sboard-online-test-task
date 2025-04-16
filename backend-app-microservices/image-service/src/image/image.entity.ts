import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ProcessingStatus } from './enums/processing-status.enum';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  generatedNameForOriginalsImage: string;

  @Column()
  generatedNameForProcessedImage: string;

  @Column()
  originalsImagePath: string;

  @Column()
  processedImagePath: string;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.UPLOADED,
  })
  processingStatus: ProcessingStatus;

  @Column('uuid')
  userId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: string;

  @Column()
  size: number;
}
