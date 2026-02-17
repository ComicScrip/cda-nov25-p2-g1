import { Field, Float, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User_profile } from "./User_Profile";

@ObjectType()
@Entity({ name: "weight_measures" })
export class Weight_Measure extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field(() => Date)
  @Column({ name: "measured_at", type: "timestamp" })
  measured_at?: Date;

  @Field(() => Float)
  @Column({ type: "float" })
  weight!: number;

  /* ---------------- Relations ---------------- */

  @ManyToOne(
    () => User_profile,
    (user_profile) => user_profile.weight_measures,
    {
      onDelete: "CASCADE",
    },
  )
  user_profile!: User_profile; // This relation is a ManyToOne, so the output should be for one user profile
}
