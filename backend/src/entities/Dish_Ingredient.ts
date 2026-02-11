import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Dish } from "./Dish";
import { Ingredient } from "./Ingredient";

@ObjectType()
@Entity({ name: "dish_ingredient" })
export class Dish_Ingredient extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  quantity?: number;

  @ManyToOne(
    () => Dish,
    (dish) => dish.dish_ingredients,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "dish_id" })
  dish: Dish;

  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.dish_ingredients,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn({ name: "ingredient_id" })
  ingredient: Ingredient;
}
