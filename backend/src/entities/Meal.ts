import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dish } from "./Dish";
import { MealType } from "./enums";
import { User } from "./User";

@ObjectType()
@Entity({ name: "meal" })
export class Meal extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field({ nullable: true })
  @Column({ name: "meal_type", type: "enum", enum: MealType, nullable: true })
  mealType?: MealType;

  @Field({ nullable: true })
  @Column({ name: "consumed_at", type: "timestamp", nullable: true })
  consumedAt?: Date;

  @ManyToOne(
    () => User,
    (user) => user.meals,
    { nullable: true },
  )
  @JoinColumn({ name: "user_id" })
  user?: User;

  @OneToMany(
    () => Dish,
    (dish) => dish.meal,
  )
  dishes?: Dish[];
}
