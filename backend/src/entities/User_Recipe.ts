import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Recipe } from "./Recipe";
import { User } from "./User";

@ObjectType()
@Entity({ name: "user_recipe" })
export class User_Recipe extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @ManyToOne(
    () => Recipe,
    (recipe) => recipe.user_recipes,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
