import { Field, Float, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pathology } from "./Pathology";
import { User } from "./User";
import { Weight_Measure } from "./Weight_Measure";

@ObjectType()
@Entity({ name: "user_profiles" })
export class User_profile extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field(() => String)
  @Column({ name: "first_name" })
  first_name!: string;

  @Field(() => String)
  @Column({ name: "last_name" })
  last_name!: string;

  @Field(() => Date, { nullable: true })
  @Column({ name: "date_of_birth", type: "date", nullable: true })
  date_of_birth!: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  gender!: string;

  @Field(() => Float, { nullable: true })
  @Column({ type: "float", nullable: true })
  height!: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  goal!: string;

  /* ---------------- Relations ---------------- */

  @Field(() => User)
  @OneToOne(
    () => User,
    (user) => user.profile,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Field(() => [Pathology])
  @ManyToMany(
    () => Pathology,
    (pathology) => pathology.user_profiles,
    {
      cascade: true,
    },
  )
  @JoinTable({
    name: "User_pathologies",
    joinColumn: {
      name: "id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "id",
      referencedColumnName: "id",
    },
  })
  pathologies!: Pathology[];

  //ONE TO MANY on réutilise pas la mesure de poid chez un autre utilisateur

  @Field(() => [Weight_Measure])
  @OneToMany(
    () => Weight_Measure,
    (weight_measure) => weight_measure.user_profile,
  )
  weight_measures!: Weight_Measure[];
}
