import { Field, Float, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity({ name: "user_profiles" })
export class UserProfile extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: "user_profile_id" })
  user_profile_id!: number;

  @Field(() => String)
  @Column({ name: "first_name" })
  first_name!: string;

  @Field(() => String)
  @Column({ name: "last_name" })
  last_name!: string;

  @Field(() => Date, { nullable: true })
  @Column({ name: "date_of_birth", type: "date", nullable: true })
  date_of_birth!: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  gender!: string;

  @Field(() => Float, { nullable: true })
  @Column({ type: "float", nullable: true })
  height!: number;

  @Field(() => Float, { nullable: true })
  @Column({ name: "current_weight", type: "float", nullable: true })
  current_weight!: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  goal!: string;

  /* ---------------- Relations ---------------- */

  @Field(() => Int)
  @Column()
  user_id!: number;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}