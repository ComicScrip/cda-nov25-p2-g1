import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dish_Ingredient } from "./Dish_Ingredient";
import { Unit } from "./enums";
import { Recipe_Ingredient } from "./Recipe_Ingredient";

@ObjectType()
@Entity({ name: "ingredient" })
export class Ingredient extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field()
  @Column({ type: "text" })
  name!: string;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Unit, nullable: true })
  unit?: Unit;

  @OneToMany(
    () => Recipe_Ingredient,
    (recipe_ingredient) => recipe_ingredient.ingredient,
  )
  recipe_ingredients?: Recipe_Ingredient[];

  @OneToMany(
    () => Dish_Ingredient,
    (dish_ingredient) => dish_ingredient.ingredient,
  )
  dish_ingredients?: Dish_Ingredient[];
}
