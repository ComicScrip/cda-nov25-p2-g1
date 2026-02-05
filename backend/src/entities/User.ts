import { IsEmail, IsStrongPassword } from "class-validator";
import { Field, InputType, Int, ObjectType, registerEnumType } from "type-graphql";
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
import { User_profile } from "./User_profile";

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
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

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
  created_at!: Date;

  @Field(() => Date, { nullable: true })
  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  last_login_at!: Date | null;

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
