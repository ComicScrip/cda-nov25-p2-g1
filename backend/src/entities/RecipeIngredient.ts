import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Ingredient } from "./Ingredient";
import { Recipe } from "./Recipe";
import { Unit } from "./enums";

@ObjectType()
@Entity({ name: "recipe_ingredient" })
export class RecipeIngredient extends BaseEntity {
  @Field()
  @PrimaryColumn({ name: "recipe_id", type: "uuid" })
  recipeId: string;

  @Field()
  @PrimaryColumn({ name: "ingredient_id", type: "uuid" })
  ingredientId: string;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  quantity?: number | null;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Unit, nullable: true })
  unit?: Unit | null;

  @ManyToOne(
    () => Recipe,
    (recipe) => recipe.recipeIngredients,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.recipeIngredients,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "ingredient_id" })
  ingredient: Ingredient;
}
