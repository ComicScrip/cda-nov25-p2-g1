import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity({ name: "user_profiles" })
export class UserProfile extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => User, { nullable: true })
  @OneToOne(
    () => User,
    (user) => user.profile,
    { nullable: true },
  )
  @JoinColumn({ name: "user_id" })
  user?: User | null;
}
