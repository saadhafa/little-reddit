import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { Posts } from "./Posts";
import { User } from "./User";

@Entity()
export class Updoot extends BaseEntity {
  @PrimaryColumn()
  userID!: number;

  @Column({ type: "int" })
  value: number;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @ManyToOne(() => Posts, (post) => post.updoots)
  posts: Posts;
}
