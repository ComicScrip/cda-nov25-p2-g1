import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DishIngredient } from "./DishIngredient";
import { AnalysisStatus, DishType } from "./enums";
import { Meal } from "./Meal";
import { NutritionalAnalysis } from "./NutritionalAnalysis";

@ObjectType()
@Entity({ name: "dish" })
export class Dish extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "dish_id" })
  id: string;

  @Field({ nullable: true })
  @Column({ name: "photo_url", type: "text", nullable: true })
  photoUrl?: string | null;

  @Field({ nullable: true })
  @Column({ name: "dish_type", type: "enum", enum: DishType, nullable: true })
  dishType?: DishType | null;

  @Field({ nullable: true })
  @Column({
    name: "analysis_status",
    type: "enum",
    enum: AnalysisStatus,
    nullable: true,
  })
  analysisStatus?: AnalysisStatus | null;

  @Field({ nullable: true })
  @Column({ name: "uploaded_at", type: "timestamp", nullable: true })
  uploadedAt?: Date | null;

  @OneToOne(
    () => NutritionalAnalysis,
    (analysis) => analysis.dish,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: "analysis_id" })
  analysis?: NutritionalAnalysis | null;

  @ManyToOne(
    () => Meal,
    (meal) => meal.dishes,
    { nullable: true },
  )
  @JoinColumn({ name: "meal_id" })
  meal?: Meal | null;

  @OneToMany(
    () => DishIngredient,
    (dishIngredient) => dishIngredient.dish,
  )
  dishIngredients?: DishIngredient[];
}
