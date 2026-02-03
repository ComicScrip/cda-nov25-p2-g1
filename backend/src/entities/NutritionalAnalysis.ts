import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dish } from "./Dish";
import { Status } from "./enums";

@ObjectType()
@Entity({ name: "nutritional_analysis" })
export class NutritionalAnalysis extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "analysis_id" })
  id: string;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  calories?: number | null;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  proteins?: number | null;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  carbohydrates?: number | null;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  lipids?: number | null;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  fiber?: number | null;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  sugar?: number | null;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  sodium?: number | null;

  @Field({ nullable: true })
  @Column({ name: "confidence_score", type: "numeric", nullable: true })
  confidenceScore?: number | null;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Status, nullable: true })
  status?: Status | null;

  @Field({ nullable: true })
  @Column({ name: "is_modified", type: "boolean", nullable: true })
  isModified?: boolean | null;

  @Field({ nullable: true })
  @Column({ name: "meal_health_score", type: "numeric", nullable: true })
  mealHealthScore?: number | null;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  rating?: number | null;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  warnings?: string | null;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  suggestions?: string | null;

  @Field({ nullable: true })
  @Column({ name: "analyzed_at", type: "timestamp", nullable: true })
  analyzedAt?: Date | null;

  @Field({ nullable: true })
  @Column({ name: "validated_at", type: "timestamp", nullable: true })
  validatedAt?: Date | null;

  @OneToOne(
    () => Dish,
    (dish) => dish.analysis,
  )
  dish?: Dish;
}
