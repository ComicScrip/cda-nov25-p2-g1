import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Dish } from "./Dish";
import { Ingredient } from "./Ingredient";

@ObjectType()
@Entity({ name: "dish_ingredient" })
export class DishIngredient extends BaseEntity {
  @Field()
  @PrimaryColumn({ name: "dish_id", type: "uuid" })
  dishId: string;

  @Field()
  @PrimaryColumn({ name: "ingredient_id", type: "uuid" })
  ingredientId: string;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  quantity?: number | null;

  @ManyToOne(
    () => Dish,
    (dish) => dish.dishIngredients,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "dish_id" })
  dish: Dish;

  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.dishIngredients,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "ingredient_id" })
  ingredient: Ingredient;
}
