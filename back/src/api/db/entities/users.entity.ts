import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Repositories } from './repositories.entity'

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('character varying', { nullable: true, default: '' })
  name: string

  @Column('character varying', { nullable: true, default: '' })
  email: string

  @Column('character varying', { nullable: true, default: '' })
  password: string

  @Column('character varying', { nullable: true, default: '' })
  provider: string

  @Column('character varying', { nullable: true, default: '' })
  image: string

  @Column('boolean', { default: true })
  active: boolean

  @Column('int', { nullable: true, default: 5 })
  allowedRepos: number

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date

  @OneToMany(() => Repositories, (repository) => repository.user)
  @JoinColumn()
  repository: Repositories
}
