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
import { Recipe_Ingredient } from "./Recipe_Ingredient";
import { User_Recipe } from "./User_Recipe";

@ObjectType()
@Entity({ name: "recipe" })
export class Recipe extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field()
  @Column({ type: "text" })
  title!: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  instructions?: string;

  @Field(() => Int, { nullable: true })
  @Column({ name: "preparation_time", type: "int", nullable: true })
  preparationTime?: number; // en minutes

  @Field(() => Int, { nullable: true })
  @Column({ name: "cooking_time", type: "int", nullable: true })
  cookingTime?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: "int", nullable: true })
  servings?: number;

  @Field({ nullable: true })
  @Column({ name: "difficulty_level", type: "text", nullable: true })
  difficultyLevel?: string;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Status, nullable: true })
  status?: Status;

  @Field({ nullable: true })
  @Column({ name: "meal_type", type: "enum", enum: MealType, nullable: true })
  mealType?: MealType;

  @Field({ nullable: true })
  @Column({ name: "chef_tips", type: "text", nullable: true })
  chefTips?: string;

  @Field()
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Field({ nullable: true })
  @Column({ name: "calories_per_serving", type: "numeric", nullable: true })
  caloriesPerServing?: number;

  @Field({ nullable: true })
  @Column({ name: "proteins_per_serving", type: "numeric", nullable: true })
  proteinsPerServing?: number;

  @Field({ nullable: true })
  @Column({
    name: "carbohydrates_per_serving",
    type: "numeric",
    nullable: true,
  })
  carbohydratesPerServing?: number;

  @Field({ nullable: true })
  @Column({ name: "lipids_per_serving", type: "numeric", nullable: true })
  lipidsPerServing?: number;

  @Field({ nullable: true })
  @Column({ name: "fiber_per_serving", type: "numeric", nullable: true })
  fiberPerServing?: number;

  @OneToMany(
    () => Recipe_Ingredient,
    (recipe_ingredient) => recipe_ingredient.recipe,
  )
  recipe_ingredients?: Recipe_Ingredient[];

  @OneToMany(
    () => User_Recipe,
    (user_recipe) => user_recipe.recipe,
  )
  user_recipes?: User_Recipe[];
}
