import { Field, ObjectType } from "type-graphql";
import type { ValueTransformer } from "typeorm";
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

const numericColumnTransformer: ValueTransformer = {
  to(value: number | null | undefined) {
    return value;
  },
  from(value: string | number | null | undefined) {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  },
};

@ObjectType()
@Entity({ name: "nutritional_analysis" })
export class Nutritional_Analysis extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field({ nullable: true })
  @Column({
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  calories?: number;

  @Field({ nullable: true })
  @Column({
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  proteins?: number;

  @Field({ nullable: true })
  @Column({
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  carbohydrates?: number;

  @Field({ nullable: true })
  @Column({
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  lipids?: number;

  @Field({ nullable: true })
  @Column({
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  fiber?: number;

  @Field({ nullable: true })
  @Column({
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  sugar?: number;

  @Field({ nullable: true })
  @Column({
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  sodium?: number;

  @Field({ nullable: true })
  @Column({
    name: "confidence_score",
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  confidenceScore?: number;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: Status, nullable: true })
  status?: Status;

  @Field({ nullable: true })
  @Column({ name: "is_modified", type: "boolean", nullable: true })
  isModified?: boolean;

  @Field({ nullable: true })
  @Column({
    name: "meal_health_score",
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
  mealHealthScore?: number;

  @Field({ nullable: true })
  @Column({
    type: "numeric",
    nullable: true,
    transformer: numericColumnTransformer,
  })
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
      nullable: true,
    },
  )
  dish?: Dish;
}
