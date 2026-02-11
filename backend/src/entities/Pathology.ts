import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User_profile } from "./User_Profile";

@ObjectType()
@Entity({ name: "pathologies" })
export class Pathology extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field(() => String)
  @Column({ unique: true })
  name!: string;

  /* ---------------- Relations -------------  */

  @ManyToMany(
    () => User_profile,
    (user_profile) => user_profile.pathologies
  )
  user_profiles!: User_profile[];
}