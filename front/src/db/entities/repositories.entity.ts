import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Datas } from './data.entity'

@Entity()
export class Repositories {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('character varying')
  name: string

  @Column('character varying')
  url: string

  @Column('character varying')
  description: string

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date

  @OneToOne(() => Datas, { cascade: true })
  @JoinColumn()
  data: Datas
}
