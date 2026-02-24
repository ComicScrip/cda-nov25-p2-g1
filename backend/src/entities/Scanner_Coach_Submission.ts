import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity({ name: "scanner_coach_submission" })
export class Scanner_Coach_Submission extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({ name: "payload", type: "jsonb" })
  payload!: Record<string, unknown>;

  @Field(() => Date)
  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
