import {
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm'
  import { classToPlain, Exclude } from 'class-transformer'
  
  /* Entity class is used as a base by other classes*/
  export default abstract class Entity extends BaseEntity {
    @Exclude()
    @PrimaryGeneratedColumn()
    id: number
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  
    toJSON() {
      return classToPlain(this)
    }
  }