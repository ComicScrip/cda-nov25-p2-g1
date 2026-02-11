import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Dish_Ingredient } from "./Dish_Ingredient";
import { AnalysisStatus, DishType } from "./enums";
import { Meal } from "./Meal";
import { Nutritional_Analysis } from "./Nutritional_Analysis";

@ObjectType()
@Entity({ name: "dish" })
export class Dish extends BaseEntity {
  
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field({ nullable: true })
  @Column({ name: "photo_url", type: "text", nullable: true })
  photoUrl?: string;

  @Field({ nullable: true })
  @Column({ name: "dish_type", type: "enum", enum: DishType, nullable: true })
  dishType?: DishType;

  @Field({ nullable: true })
  @Column({ name: "analysis_status", type: "enum", enum: AnalysisStatus, nullable: true })
  analysisStatus?: AnalysisStatus;

  @Field({ nullable: true })
  @Column({ name: "uploaded_at", type: "timestamp", nullable: true })
  uploadedAt?: Date;

  @OneToOne(
    () => Nutritional_Analysis,
    (analysis) => analysis.dish
  )
  @JoinColumn({ name: "analysis_id" })
  analysis?: Nutritional_Analysis;

  @ManyToOne(
    () => Meal,
    (meal) => meal.dishes,
    { nullable: true, onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "meal_id" })
  meal?: Meal;

  @OneToMany(
    () => Dish_Ingredient,
    (dish_ingredient) => dish_ingredient.dish,
  )
  dish_ingredients?: Dish_Ingredient[];
}
