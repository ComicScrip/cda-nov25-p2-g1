import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Recipe } from "./Recipe";
import { User } from "./User";

@ObjectType()
@Entity({ name: "user_recipe" })
export class UserRecipe extends BaseEntity {
  @Field()
  @PrimaryColumn({ name: "recipe_id", type: "uuid" })
  recipeId: string;

  @Field()
  @PrimaryColumn({ name: "user_id", type: "int" })
  userId: number;

  @ManyToOne(
    () => Recipe,
    (recipe) => recipe.userRecipes,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(
    () => User,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "user_id" })
  user: User;
}
