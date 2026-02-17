import { IsEmail, IsStrongPassword } from "class-validator";
import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Meal } from "./Meal";
import { User_profile } from "./User_Profile";
import { User_Recipe } from "./User_Recipe";

export enum UserRole {
  Coach = "coach",
  Coachee = "coachee",
  Admin = "admin",
}

registerEnumType(UserRole, {
  name: "UserRole",
});

@ObjectType()
@Entity({ name: "users" })
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  hashedPassword: string;

  @Field(() => UserRole)
  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.Coachee,
  })
  role!: UserRole;

  @Field(() => Date)
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Field(() => Date, { nullable: true })
  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  last_login_at?: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: "uploaded_at" })
  uploaded_at!: Date;

  /* ---------------- Relations ---------------- */

  @Field(() => User_profile, { nullable: true })
  @OneToOne(
    () => User_profile,
    (profile) => profile.user,
  )
  profile?: User_profile;

  @Field(() => [Meal], { nullable: true })
  @OneToMany(
    () => Meal,
    (meal) => meal.user,
  )
  meals?: Meal[];

  @Field(() => [User_Recipe], { nullable: true })
  @OneToMany(
    () => User_Recipe,
    (user_recipe) => user_recipe.user,
  )
  recipes?: User_Recipe[];
}

@InputType()
export class SignupInput {
  @Field()
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string;

  @Field()
  @IsStrongPassword(
    {},
    {
      message:
        "Le mot de passe doit contenir au moins 8 caractères, dont une minuscule, une majuscule, un chiffre et un caractère spécial",
    },
  )
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string;

  @Field()
  @IsStrongPassword(
    {},
    {
      message:
        "Le mot de passe doit contenir au moins 8 caractères, dont une minuscule, une majuscule, un chiffre et un caractère spécial",
    },
  )
  password: string;
}
