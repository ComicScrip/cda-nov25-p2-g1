import { Field, Float, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User_profile } from "./User_profile";

@ObjectType()
@Entity({ name: "weight_measures" })
export class Weight_measure extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: "weight_measure_id" })
  weight_measure_id!: number;

  @Field(() => Date)
  @Column({ name: "measured_at", type: "timestamp" })
  measured_at!: Date;

  @Field(() => Float)
  @Column({ type: "float" })
  weight!: number;

  /* ---------------- Relations ---------------- */

  @ManyToMany(
    () => User_profile,
    (userProfile) => userProfile.weight_measure,
  )
  User_profile!: User_profile[];
}
