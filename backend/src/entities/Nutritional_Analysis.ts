import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Dish } from "./Dish";
import { Status } from "./enums";

@ObjectType()
@Entity({ name: "nutritional_analysis" })
export class Nutritional_Analysis extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  calories?: number;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  proteins?: number;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  carbohydrates?: number;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  lipids?: number;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  fiber?: number;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  sugar?: number;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  sodium?: number;

  @Field({ nullable: true })
  @Column({ name: "confidence_score", type: "numeric", nullable: true })
  confidenceScore?: number;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Status, nullable: true })
  status?: Status;

  @Field({ nullable: true })
  @Column({ name: "is_modified", type: "boolean", nullable: true })
  isModified?: boolean;

  @Field({ nullable: true })
  @Column({ name: "meal_health_score", type: "numeric", nullable: true })
  mealHealthScore?: number;

  @Field({ nullable: true })
  @Column({ type: "numeric", nullable: true })
  rating?: number;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  warnings?: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  suggestions?: string;

  @Field({ nullable: true })
  @CreateDateColumn({ name: "analyzed_at", type: "timestamp", nullable: true })
  analyzedAt?: Date;

  @Field({ nullable: true })
  @Column({ name: "validated_at", type: "timestamp", nullable: true })
  validatedAt?: Date;

  @OneToOne(
    () => Dish,
    (dish) => dish.analysis,
    {
      nullable: true
    }
  )
  dish?: Dish;
}
