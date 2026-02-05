import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User_profile } from "./User_profile";

@ObjectType()
@Entity({ name: "pathologies" })
export class Pathology extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: "pathology_id" })
  pathology_id!: number;

  @Field(() => String)
  @Column({ unique: true })
  name!: string;

  /* ---------------- Relations */

  @ManyToMany(
    () => User_profile,
    (userProfile) => userProfile.pathologies,
  )
  User_profile!: User_profile[];
}
