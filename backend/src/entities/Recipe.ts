import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MealType, Status } from "./enums";
import { RecipeIngredient } from "./RecipeIngredient";
import { UserRecipe } from "./UserRecipe";

@ObjectType()
@Entity({ name: "recipe" })
export class Recipe extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "recipe_id" })
  id: string;

  @Field()
  @Column({ type: "text" })
  title: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  instructions?: string | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: "preparation_time", type: "int", nullable: true })
  preparationTime?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: "cooking_time", type: "int", nullable: true })
  cookingTime?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: "int", nullable: true })
  servings?: number | null;

  @Field({ nullable: true })
  @Column({ name: "difficulty_level", type: "text", nullable: true })
  difficultyLevel?: string | null;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Status, nullable: true })
  status?: Status | null;

  @Field({ nullable: true })
  @Column({ name: "meal_type", type: "enum", enum: MealType, nullable: true })
  mealType?: MealType | null;

  @Field({ nullable: true })
  @Column({ name: "chef_tips", type: "text", nullable: true })
  chefTips?: string | null;

  @Field()
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ name: "calories_per_serving", type: "numeric", nullable: true })
  caloriesPerServing?: number | null;

  @Field({ nullable: true })
  @Column({ name: "proteins_per_serving", type: "numeric", nullable: true })
  proteinsPerServing?: number | null;

  @Field({ nullable: true })
  @Column({
    name: "carbohydrates_per_serving",
    type: "numeric",
    nullable: true,
  })
  carbohydratesPerServing?: number | null;

  @Field({ nullable: true })
  @Column({ name: "lipids_per_serving", type: "numeric", nullable: true })
  lipidsPerServing?: number | null;

  @Field({ nullable: true })
  @Column({ name: "fiber_per_serving", type: "numeric", nullable: true })
  fiberPerServing?: number | null;

  @OneToMany(
    () => RecipeIngredient,
    (recipeIngredient) => recipeIngredient.recipe,
  )
  recipeIngredients?: RecipeIngredient[];

  @OneToMany(
    () => UserRecipe,
    (userRecipe) => userRecipe.recipe,
  )
  userRecipes?: UserRecipe[];
}
