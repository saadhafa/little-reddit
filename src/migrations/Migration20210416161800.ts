import { Migration } from '@mikro-orm/migrations';

export class Migration20210416161800 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updarted_at" timestamptz(0) not null, "title" text not null);');
  }

}
