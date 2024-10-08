import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Datas } from './datas.entity'
import { Users } from './users.entity'

@Entity()
export class Repositories {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('character varying', { nullable: true, default: '' })
  name: string

  @Column('character varying', { nullable: true, default: '' })
  url: string

  @Column('character varying', { nullable: true, default: '' })
  description: string

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date

  @OneToOne(() => Datas, (data) => data.repository)
  data: Datas

  @ManyToOne(() => Users, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: Users
}
