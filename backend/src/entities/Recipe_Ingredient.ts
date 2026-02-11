import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Unit } from "./enums";
import { Ingredient } from "./Ingredient";
import { Recipe } from "./Recipe";

@ObjectType()
@Entity({ name: "recipe_ingredient" })
export class Recipe_Ingredient extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  quantity?: number;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Unit, nullable: true })
  unit?: Unit;

  @ManyToOne(
    () => Recipe,
    (recipe) => recipe.recipe_ingredients,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.recipe_ingredients,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "ingredient_id" })
  ingredient: Ingredient;
}
