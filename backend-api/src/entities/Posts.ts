import { Field, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn, UpdateDateColumn,BaseEntity,ManyToOne} from "typeorm";
import { User } from "./User";


@ObjectType()
@Entity()
export class Posts extends BaseEntity   {

  @Field()
  @PrimaryGeneratedColumn()
  id!:number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt:Date

  @Field(()=> String)
  @UpdateDateColumn()
  updatedAt: Date

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!:string

  @Field()
  @Column()
  creatorId!:number

  @Field()
  @Column({type:'int',default:0})
  points!:number

  @ManyToOne(() => User, user => user.posts)
  creator: User;


}