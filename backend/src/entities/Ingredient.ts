import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DishIngredient } from "./DishIngredient";
import { Unit } from "./enums";
import { RecipeIngredient } from "./RecipeIngredient";

@ObjectType()
@Entity({ name: "ingredient" })
export class Ingredient extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "ingredient_id" })
  id: string;

  @Field()
  @Column({ type: "text" })
  name: string;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Unit, nullable: true })
  unit?: Unit | null;

  @OneToMany(
    () => RecipeIngredient,
    (recipeIngredient) => recipeIngredient.ingredient,
  )
  recipeIngredients?: RecipeIngredient[];

  @OneToMany(
    () => DishIngredient,
    (dishIngredient) => dishIngredient.ingredient,
  )
  dishIngredients?: DishIngredient[];
}
