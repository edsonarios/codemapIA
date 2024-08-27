import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Repositories } from './repositories.entity'

@Entity()
export class Datas {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('jsonb', { nullable: true, default: {} })
  contentFiles: object | null

  @Column('jsonb', { nullable: true, default: {} })
  fileDetails: object | null

  @Column('jsonb', { nullable: true, default: {} })
  nodesAndEdges: object | null

  @Column('jsonb', { nullable: true, default: {} })
  structure: object | null

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date

  @OneToOne(() => Repositories, { cascade: true })
  @JoinColumn()
  repository: Repositories
}
