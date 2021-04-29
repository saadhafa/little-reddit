import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn, UpdateDateColumn,BaseEntity,OneToMany} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import {Posts} from './Posts'
@ObjectType()
@Entity()
export class User extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn()
  id!:number

  @Field(()=> String)
  @CreateDateColumn()
  createdAt:Date


  @Field(()=> String)
  @UpdateDateColumn()
  updatedAt:Date

  @Field()
  @Column({unique:true})
  username!:string

  @Field()
  @Column({unique:true})
  email!:string


  @Column()
  password!:string

  @OneToMany(() => Posts, posts => posts.creator)
  posts: Posts[];

}