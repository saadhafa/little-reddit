import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Book   {

  @PrimaryKey()
  id!:number;

  @Property()
  createdAt = new Date();

  @Property({onUpdate: () => new Date()})
  updartedAt = new Date();

  @Property()
  title!: string;


}