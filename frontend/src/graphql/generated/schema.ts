// @ts-nocheck
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTimeISO: { input: any; output: any; }
};

export type AnalyzeMealImageInput = {
  imageBase64: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
};

export type CoachDashboardData = {
  __typename?: 'CoachDashboardData';
  recentRecipes: Array<RecentRecipeData>;
  recentUsers: Array<RecentUserData>;
  stats: CoachDashboardStats;
};

export type CoachDashboardStats = {
  __typename?: 'CoachDashboardStats';
  averageScore: StatData;
  publishedRecipes: StatData;
  scannedMeals: StatData;
  users: StatData;
};

export type CoachDishAnalysisResult = {
  __typename?: 'CoachDishAnalysisResult';
  analysisId: Scalars['String']['output'];
  analysisSummary: Scalars['String']['output'];
  dishId: Scalars['String']['output'];
  dishName: Scalars['String']['output'];
  healthScore: Scalars['Float']['output'];
  ingredients: Array<CoachDishIngredientType>;
  mealType?: Maybe<Scalars['String']['output']>;
  photoUrl?: Maybe<Scalars['String']['output']>;
  totalNutrition: CoachDishTotalsType;
  warnings: Array<Scalars['String']['output']>;
};

export type CoachDishIngredientType = {
  __typename?: 'CoachDishIngredientType';
  calories?: Maybe<Scalars['Float']['output']>;
  carbs?: Maybe<Scalars['Float']['output']>;
  estimatedQuantityGrams?: Maybe<Scalars['Float']['output']>;
  fat?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  protein?: Maybe<Scalars['Float']['output']>;
};

export type CoachDishTotalsType = {
  __typename?: 'CoachDishTotalsType';
  calories?: Maybe<Scalars['Float']['output']>;
  carbs?: Maybe<Scalars['Float']['output']>;
  fat?: Maybe<Scalars['Float']['output']>;
  fiber?: Maybe<Scalars['Float']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  salt?: Maybe<Scalars['Float']['output']>;
  sugar?: Maybe<Scalars['Float']['output']>;
};

export type CoachRecipesPageData = {
  __typename?: 'CoachRecipesPageData';
  averageCalories: Scalars['Int']['output'];
  coachCount: Scalars['Int']['output'];
  recipes: Array<RecipeData>;
  totalCount: Scalars['Int']['output'];
};

export type CoachScannerSubmissionTestData = {
  __typename?: 'CoachScannerSubmissionTestData';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  payloadJson: Scalars['String']['output'];
  userEmail?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type CoachUser = {
  __typename?: 'CoachUser';
  caloricGoal?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  currentWeight?: Maybe<Scalars['Float']['output']>;
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  goalLabel?: Maybe<Scalars['String']['output']>;
  initialWeight?: Maybe<Scalars['Float']['output']>;
  mealsCount: Scalars['Int']['output'];
  role: Scalars['String']['output'];
  scoreRounded?: Maybe<Scalars['Int']['output']>;
  userId: Scalars['String']['output'];
};

export type CoachUserDetail = {
  __typename?: 'CoachUserDetail';
  currentWeight?: Maybe<Scalars['Float']['output']>;
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  evolutionData: Array<EvolutionDataPoint>;
  goal?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  imc?: Maybe<Scalars['Float']['output']>;
  pathologies: Array<Scalars['String']['output']>;
  todayMeals: Array<UserMealData>;
};

export type CoachUserMealTestData = {
  __typename?: 'CoachUserMealTestData';
  aiInsights: Array<Scalars['String']['output']>;
  aiScore: Scalars['Int']['output'];
  calories: Scalars['Int']['output'];
  carbs: Scalars['Int']['output'];
  coachComment: Scalars['String']['output'];
  coachName: Scalars['String']['output'];
  consumedAt: Scalars['String']['output'];
  fat: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  photo: Scalars['String']['output'];
  protein: Scalars['Int']['output'];
  userEmail?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type CoachUsersPage = {
  __typename?: 'CoachUsersPage';
  totalCount: Scalars['Int']['output'];
  users: Array<CoachUser>;
};

export type CreateDishFromScannerSubmissionInput = {
  calories: Scalars['Float']['input'];
  submissionId: Scalars['String']['input'];
};

export type CreateRecipeInput = {
  benefits?: InputMaybe<Array<Scalars['String']['input']>>;
  caloriesPerServing?: InputMaybe<Scalars['Float']['input']>;
  carbohydratesPerServing?: InputMaybe<Scalars['Float']['input']>;
  chefTips?: InputMaybe<Scalars['String']['input']>;
  cookingTime?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficultyLevel?: InputMaybe<Scalars['String']['input']>;
  fiberPerServing?: InputMaybe<Scalars['Float']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  lipidsPerServing?: InputMaybe<Scalars['Float']['input']>;
  mealType?: InputMaybe<Scalars['String']['input']>;
  photoUrl?: InputMaybe<Scalars['String']['input']>;
  preparationTime?: InputMaybe<Scalars['Int']['input']>;
  proteinsPerServing?: InputMaybe<Scalars['Float']['input']>;
  servings?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type DashboardData = {
  __typename?: 'DashboardData';
  averageCalories: Scalars['Int']['output'];
  daysOfUse: Scalars['Int']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  hasMoreMeals: Scalars['Boolean']['output'];
  healthScore: Scalars['Int']['output'];
  recentMeals: Array<DashboardMealData>;
  scannedMeals: Scalars['Int']['output'];
  targetCalories: Scalars['Int']['output'];
  targetCarbs: Scalars['Int']['output'];
  targetLipids: Scalars['Int']['output'];
  targetProgress: Scalars['Int']['output'];
  targetProtein: Scalars['Int']['output'];
  todayCarbs: Scalars['Int']['output'];
  todayFat: Scalars['Int']['output'];
  todayProtein: Scalars['Int']['output'];
};

export type DashboardMealData = {
  __typename?: 'DashboardMealData';
  calories: Scalars['Int']['output'];
  carbs: Scalars['Int']['output'];
  fat: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  protein: Scalars['Int']['output'];
};

export type EvolutionDataPoint = {
  __typename?: 'EvolutionDataPoint';
  calories: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  week: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export type IngredientEstimateType = {
  __typename?: 'IngredientEstimateType';
  calories?: Maybe<Scalars['Float']['output']>;
  carbs?: Maybe<Scalars['Float']['output']>;
  confidence?: Maybe<Scalars['Float']['output']>;
  estimatedQuantityGrams?: Maybe<Scalars['Float']['output']>;
  fat?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  protein?: Maybe<Scalars['Float']['output']>;
};

export type IngredientQuantityInput = {
  calories?: InputMaybe<Scalars['Float']['input']>;
  carbs?: InputMaybe<Scalars['Float']['input']>;
  estimatedQuantityGrams?: InputMaybe<Scalars['Float']['input']>;
  fat?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  protein?: InputMaybe<Scalars['Float']['input']>;
};

export type IngredientQuantityUpdateInput = {
  ingredientName: Scalars['String']['input'];
  quantityGrams: Scalars['Float']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Meal = {
  __typename?: 'Meal';
  consumedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  id: Scalars['String']['output'];
  mealType?: Maybe<MealType>;
  name?: Maybe<Scalars['String']['output']>;
};

export enum MealType {
  Collation = 'Collation',
  Dejeuner = 'Dejeuner',
  Diner = 'Diner',
  PetitDejeuner = 'PetitDejeuner'
}

export type Mutation = {
  __typename?: 'Mutation';
  analyzeMealImage: NutritionalAnalysisType;
  assignRecipeToUser: Scalars['Boolean']['output'];
  createDishFromScannerSubmission: Scalars['String']['output'];
  createRecipe?: Maybe<Recipe>;
  login: Scalars['String']['output'];
  loginCoach: Scalars['String']['output'];
  logout: Scalars['Boolean']['output'];
  saveMealAnalysis: Scalars['String']['output'];
  saveScannerCoachSubmission: Scalars['Boolean']['output'];
  signup: User;
  updateAnalysisCalories: Nutritional_Analysis;
  updateDishName: Scalars['String']['output'];
  updateIngredientQuantities: Nutritional_Analysis;
  updateUserProfileData?: Maybe<UserProfileData>;
};


export type MutationAnalyzeMealImageArgs = {
  input: AnalyzeMealImageInput;
};


export type MutationAssignRecipeToUserArgs = {
  recipeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCreateDishFromScannerSubmissionArgs = {
  input: CreateDishFromScannerSubmissionInput;
};


export type MutationCreateRecipeArgs = {
  input: CreateRecipeInput;
};


export type MutationLoginArgs = {
  data: LoginInput;
};


export type MutationLoginCoachArgs = {
  data: LoginInput;
};


export type MutationSaveMealAnalysisArgs = {
  input: SaveMealAnalysisInput;
};


export type MutationSaveScannerCoachSubmissionArgs = {
  payloadJson: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  data: SignupInput;
};


export type MutationUpdateAnalysisCaloriesArgs = {
  input: UpdateAnalysisCaloriesInput;
};


export type MutationUpdateDishNameArgs = {
  input: UpdateDishNameInput;
};


export type MutationUpdateIngredientQuantitiesArgs = {
  input: UpdateIngredientQuantitiesInput;
};


export type MutationUpdateUserProfileDataArgs = {
  data: UserProfileUpdateInput;
};

export type NutritionalAnalysisType = {
  __typename?: 'NutritionalAnalysisType';
  analysisSummary: Scalars['String']['output'];
  dishName: Scalars['String']['output'];
  healthScore: Scalars['Float']['output'];
  ingredients: Array<IngredientEstimateType>;
  mealType?: Maybe<Scalars['String']['output']>;
  totalNutrition: NutritionalTotalsType;
  warnings: Array<Scalars['String']['output']>;
};

export type NutritionalTotalsInput = {
  calories?: InputMaybe<Scalars['Float']['input']>;
  carbs?: InputMaybe<Scalars['Float']['input']>;
  fat?: InputMaybe<Scalars['Float']['input']>;
  fiber?: InputMaybe<Scalars['Float']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
  salt?: InputMaybe<Scalars['Float']['input']>;
  sugar?: InputMaybe<Scalars['Float']['input']>;
};

export type NutritionalTotalsType = {
  __typename?: 'NutritionalTotalsType';
  calories?: Maybe<Scalars['Float']['output']>;
  carbs?: Maybe<Scalars['Float']['output']>;
  fat?: Maybe<Scalars['Float']['output']>;
  fiber?: Maybe<Scalars['Float']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  salt?: Maybe<Scalars['Float']['output']>;
  sugar?: Maybe<Scalars['Float']['output']>;
};

export type Nutritional_Analysis = {
  __typename?: 'Nutritional_Analysis';
  analyzedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  calories?: Maybe<Scalars['Float']['output']>;
  carbohydrates?: Maybe<Scalars['Float']['output']>;
  confidenceScore?: Maybe<Scalars['Float']['output']>;
  fiber?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  isModified?: Maybe<Scalars['Boolean']['output']>;
  lipids?: Maybe<Scalars['Float']['output']>;
  mealHealthScore?: Maybe<Scalars['Float']['output']>;
  proteins?: Maybe<Scalars['Float']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
  sodium?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<Status>;
  sugar?: Maybe<Scalars['Float']['output']>;
  suggestions?: Maybe<Scalars['String']['output']>;
  validatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  warnings?: Maybe<Scalars['String']['output']>;
};

export type Pathology = {
  __typename?: 'Pathology';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  coachDashboardData?: Maybe<CoachDashboardData>;
  coachGetDishAnalysis?: Maybe<CoachDishAnalysisResult>;
  coachRecipesPageData?: Maybe<CoachRecipesPageData>;
  coachScannerSubmissionsTestData: Array<CoachScannerSubmissionTestData>;
  coachUserDetail?: Maybe<CoachUserDetail>;
  coachUserMealsTestData: Array<CoachUserMealTestData>;
  coachUsers: Array<CoachUser>;
  coachUsersRecentScanners: Array<CoachUser>;
  coachUsersPage: CoachUsersPage;
  me?: Maybe<User>;
  userDashboardData?: Maybe<DashboardData>;
  userEvolutionData: Array<EvolutionDataPoint>;
  userMealsData: Array<UserMealData>;
  userProfileData?: Maybe<UserProfileData>;
  userRecipesData: Array<RecipeData>;
  users: Array<User>;
};


export type QueryCoachGetDishAnalysisArgs = {
  dishId: Scalars['String']['input'];
};


export type QueryCoachRecipesPageDataArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCoachScannerSubmissionsTestDataArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCoachUserDetailArgs = {
  userId: Scalars['String']['input'];
};


export type QueryCoachUserMealsTestDataArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCoachUsersRecentScannersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryCoachUsersPageArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserDashboardDataArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type RecentRecipeData = {
  __typename?: 'RecentRecipeData';
  calories: Scalars['Float']['output'];
  carbs: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  lipids: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  photo: Scalars['String']['output'];
  proteins: Scalars['Float']['output'];
};

export type RecentUserData = {
  __typename?: 'RecentUserData';
  currentWeight?: Maybe<Scalars['Float']['output']>;
  email: Scalars['String']['output'];
  goal?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  score: Scalars['Float']['output'];
  targetDailyCalories?: Maybe<Scalars['Int']['output']>;
};

export type Recipe = {
  __typename?: 'Recipe';
  benefits?: Maybe<Array<Scalars['String']['output']>>;
  caloriesPerServing?: Maybe<Scalars['Float']['output']>;
  carbohydratesPerServing?: Maybe<Scalars['Float']['output']>;
  chefTips?: Maybe<Scalars['String']['output']>;
  cookingTime?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTimeISO']['output'];
  description?: Maybe<Scalars['String']['output']>;
  difficultyLevel?: Maybe<Scalars['String']['output']>;
  fiberPerServing?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  lipidsPerServing?: Maybe<Scalars['Float']['output']>;
  mealType?: Maybe<MealType>;
  photoUrl?: Maybe<Scalars['String']['output']>;
  preparationTime?: Maybe<Scalars['Int']['output']>;
  proteinsPerServing?: Maybe<Scalars['Float']['output']>;
  servings?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Status>;
  title: Scalars['String']['output'];
};

export type RecipeData = {
  __typename?: 'RecipeData';
  benefits: Array<Scalars['String']['output']>;
  calories: Scalars['Int']['output'];
  carbs: Scalars['Int']['output'];
  coachNote: Scalars['String']['output'];
  description: Scalars['String']['output'];
  difficulty: Scalars['String']['output'];
  fat: Scalars['Int']['output'];
  fiber: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  photo: Scalars['String']['output'];
  prepSteps: Array<Scalars['String']['output']>;
  prepTime: Scalars['String']['output'];
  protein: Scalars['Int']['output'];
  servings: Scalars['Int']['output'];
  source: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type SaveMealAnalysisInput = {
  analysisSummary: Scalars['String']['input'];
  dishName: Scalars['String']['input'];
  healthScore: Scalars['Float']['input'];
  imageBase64: Scalars['String']['input'];
  ingredients: Array<IngredientQuantityInput>;
  mealType?: InputMaybe<Scalars['String']['input']>;
  mimeType?: InputMaybe<Scalars['String']['input']>;
  totalNutrition: NutritionalTotalsInput;
  warnings: Array<Scalars['String']['input']>;
};

export type SignupInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type StatData = {
  __typename?: 'StatData';
  count: Scalars['Int']['output'];
  evolution: Scalars['String']['output'];
};

export enum Status {
  Archive = 'Archive',
  Brouillon = 'Brouillon',
  Publie = 'Publie'
}

export type UpdateAnalysisCaloriesInput = {
  analysisId: Scalars['String']['input'];
  calories: Scalars['Float']['input'];
};

export type UpdateDishNameInput = {
  dishId: Scalars['String']['input'];
  dishName: Scalars['String']['input'];
};

export type UpdateIngredientQuantitiesInput = {
  dishId: Scalars['String']['input'];
  ingredients: Array<IngredientQuantityUpdateInput>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTimeISO']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  last_login_at?: Maybe<Scalars['DateTimeISO']['output']>;
  meals?: Maybe<Array<Meal>>;
  profile?: Maybe<User_Profile>;
  recipes?: Maybe<Array<User_Recipe>>;
  role: UserRole;
  uploaded_at: Scalars['DateTimeISO']['output'];
};

export type UserMealIngredientData = {
  __typename?: 'UserMealIngredientData';
  name: Scalars['String']['output'];
  quantity?: Maybe<Scalars['Float']['output']>;
};

export type UserMealData = {
  __typename?: 'UserMealData';
  aiInsights: Array<Scalars['String']['output']>;
  aiScore: Scalars['Int']['output'];
  calories: Scalars['Int']['output'];
  carbs: Scalars['Int']['output'];
  coachComment: Scalars['String']['output'];
  coachName: Scalars['String']['output'];
  consumedAt: Scalars['String']['output'];
  fat: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  ingredients: Array<UserMealIngredientData>;
  name: Scalars['String']['output'];
  photo: Scalars['String']['output'];
  protein: Scalars['Int']['output'];
};

export type UserProfileData = {
  __typename?: 'UserProfileData';
  currentWeight?: Maybe<Scalars['Float']['output']>;
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  goal?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  lastName: Scalars['String']['output'];
  medicalTags: Array<Scalars['String']['output']>;
};

export type UserProfileUpdateInput = {
  currentWeight?: InputMaybe<Scalars['Float']['input']>;
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  goal?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  lastName: Scalars['String']['input'];
  medicalTags: Array<Scalars['String']['input']>;
};

export enum UserRole {
  Admin = 'Admin',
  Coach = 'Coach',
  Coachee = 'Coachee'
}

export type User_Recipe = {
  __typename?: 'User_Recipe';
  id: Scalars['String']['output'];
};

export type User_Profile = {
  __typename?: 'User_profile';
  date_of_birth?: Maybe<Scalars['DateTimeISO']['output']>;
  first_name: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  goal?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  last_name: Scalars['String']['output'];
  pathologies: Array<Pathology>;
  user: User;
  weight_measures: Array<Weight_Measure>;
};

export type Weight_Measure = {
  __typename?: 'Weight_Measure';
  id: Scalars['String']['output'];
  measured_at: Scalars['DateTimeISO']['output'];
  weight: Scalars['Float']['output'];
};

export type AnalyzeMealImageMutationVariables = Exact<{
  input: AnalyzeMealImageInput;
}>;


export type AnalyzeMealImageMutation = { __typename?: 'Mutation', analyzeMealImage: { __typename?: 'NutritionalAnalysisType', dishName: string, analysisSummary: string, healthScore: number, mealType?: string | null, warnings: Array<string>, totalNutrition: { __typename?: 'NutritionalTotalsType', calories?: number | null, protein?: number | null, carbs?: number | null, fat?: number | null, fiber?: number | null, sugar?: number | null, salt?: number | null }, ingredients: Array<{ __typename?: 'IngredientEstimateType', name: string, estimatedQuantityGrams?: number | null, confidence?: number | null, calories?: number | null, protein?: number | null, carbs?: number | null, fat?: number | null }> } };

export type AssignRecipeToUserMutationVariables = Exact<{
  recipeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type AssignRecipeToUserMutation = { __typename?: 'Mutation', assignRecipeToUser: boolean };

export type CreateDishFromScannerSubmissionMutationVariables = Exact<{
  input: CreateDishFromScannerSubmissionInput;
}>;


export type CreateDishFromScannerSubmissionMutation = { __typename?: 'Mutation', createDishFromScannerSubmission: string };

export type CreateRecipeMutationVariables = Exact<{
  input: CreateRecipeInput;
}>;


export type CreateRecipeMutation = { __typename?: 'Mutation', createRecipe?: { __typename?: 'Recipe', id: string, title: string, status?: Status | null } | null };

export type LoginMutationVariables = Exact<{
  data: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: string };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type SaveMealAnalysisMutationVariables = Exact<{
  input: SaveMealAnalysisInput;
}>;


export type SaveMealAnalysisMutation = { __typename?: 'Mutation', saveMealAnalysis: string };

export type SaveScannerCoachSubmissionMutationVariables = Exact<{
  payloadJson: Scalars['String']['input'];
}>;


export type SaveScannerCoachSubmissionMutation = { __typename?: 'Mutation', saveScannerCoachSubmission: boolean };

export type SignupMutationVariables = Exact<{
  data: SignupInput;
}>;


export type SignupMutation = { __typename?: 'Mutation', signup: { __typename?: 'User', id: string, email: string, createdAt: any } };

export type UpdateAnalysisCaloriesMutationVariables = Exact<{
  input: UpdateAnalysisCaloriesInput;
}>;


export type UpdateAnalysisCaloriesMutation = { __typename?: 'Mutation', updateAnalysisCalories: { __typename?: 'Nutritional_Analysis', id: string, calories?: number | null, isModified?: boolean | null, validatedAt?: any | null, status?: Status | null } };

export type UpdateDishNameMutationVariables = Exact<{
  input: UpdateDishNameInput;
}>;


export type UpdateDishNameMutation = { __typename?: 'Mutation', updateDishName: string };

export type UpdateIngredientQuantitiesMutationVariables = Exact<{
  input: UpdateIngredientQuantitiesInput;
}>;


export type UpdateIngredientQuantitiesMutation = { __typename?: 'Mutation', updateIngredientQuantities: { __typename?: 'Nutritional_Analysis', id: string, calories?: number | null, proteins?: number | null, carbohydrates?: number | null, lipids?: number | null, fiber?: number | null, sugar?: number | null, sodium?: number | null, mealHealthScore?: number | null, isModified?: boolean | null } };

export type UpdateUserProfileDataMutationVariables = Exact<{
  data: UserProfileUpdateInput;
}>;


export type UpdateUserProfileDataMutation = { __typename?: 'Mutation', updateUserProfileData?: { __typename?: 'UserProfileData', firstName: string, lastName: string, dateOfBirth?: string | null, gender?: string | null, height?: number | null, currentWeight?: number | null, goal?: string | null, medicalTags: Array<string> } | null };

export type CoachDashboardDataQueryVariables = Exact<{ [key: string]: never; }>;


export type CoachDashboardDataQuery = { __typename?: 'Query', coachDashboardData?: { __typename?: 'CoachDashboardData', stats: { __typename?: 'CoachDashboardStats', users: { __typename?: 'StatData', count: number, evolution: string }, publishedRecipes: { __typename?: 'StatData', count: number, evolution: string }, scannedMeals: { __typename?: 'StatData', count: number, evolution: string }, averageScore: { __typename?: 'StatData', count: number, evolution: string } }, recentUsers: Array<{ __typename?: 'RecentUserData', name: string, email: string, score: number, currentWeight?: number | null, goal?: string | null, targetDailyCalories?: number | null }>, recentRecipes: Array<{ __typename?: 'RecentRecipeData', id: string, name: string, photo: string, calories: number, proteins: number, carbs: number, lipids: number }> } | null };

export type CoachGetDishAnalysisQueryVariables = Exact<{
  dishId: Scalars['String']['input'];
}>;


export type CoachGetDishAnalysisQuery = { __typename?: 'Query', coachGetDishAnalysis?: { __typename?: 'CoachDishAnalysisResult', dishId: string, analysisId: string, dishName: string, analysisSummary: string, healthScore: number, warnings: Array<string>, mealType?: string | null, photoUrl?: string | null, ingredients: Array<{ __typename?: 'CoachDishIngredientType', name: string, estimatedQuantityGrams?: number | null, calories?: number | null, protein?: number | null, carbs?: number | null, fat?: number | null }>, totalNutrition: { __typename?: 'CoachDishTotalsType', calories?: number | null, protein?: number | null, carbs?: number | null, fat?: number | null, fiber?: number | null, sugar?: number | null, salt?: number | null } } | null };

export type CoachRecipesPageDataQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
}>;


export type CoachRecipesPageDataQuery = { __typename?: 'Query', coachRecipesPageData?: { __typename?: 'CoachRecipesPageData', totalCount: number, coachCount: number, averageCalories: number, recipes: Array<{ __typename?: 'RecipeData', id: string, title: string, source: string, photo: string, prepTime: string, servings: number, difficulty: string, calories: number, protein: number, carbs: number, fat: number, fiber: number, description: string, prepSteps: Array<string>, benefits: Array<string>, coachNote: string }> } | null };

export type CoachScannerSubmissionsTestDataQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CoachScannerSubmissionsTestDataQuery = { __typename?: 'Query', coachScannerSubmissionsTestData: Array<{ __typename?: 'CoachScannerSubmissionTestData', id: string, userId: string, userEmail?: string | null, createdAt: string, payloadJson: string }> };

export type CoachUserDetailQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type CoachUserDetailQuery = { __typename?: 'Query', coachUserDetail?: { __typename?: 'CoachUserDetail', displayName: string, email: string, height?: number | null, currentWeight?: number | null, goal?: string | null, pathologies: Array<string>, imc?: number | null, evolutionData: Array<{ __typename?: 'EvolutionDataPoint', week: string, weight: number, calories: number, score: number }>, todayMeals: Array<{ __typename?: 'UserMealData', id: string, name: string, consumedAt: string, calories: number, protein: number, carbs: number, fat: number, aiScore: number, photo: string, aiInsights: Array<string>, coachComment: string, coachName: string }> } | null };

export type CoachUserMealsTestDataQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CoachUserMealsTestDataQuery = { __typename?: 'Query', coachUserMealsTestData: Array<{ __typename?: 'CoachUserMealTestData', id: string, userId: string, userEmail?: string | null, name: string, consumedAt: string, calories: number, protein: number, carbs: number, fat: number, aiScore: number, photo: string, aiInsights: Array<string>, coachComment: string, coachName: string }> };

export type CoachUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CoachUserQuery = { __typename?: 'Query', coachUsers: Array<{ __typename?: 'CoachUser', userId: string, email: string, displayName: string, initialWeight?: number | null, currentWeight?: number | null, goalLabel?: string | null, caloricGoal?: number | null, mealsCount: number, scoreRounded?: number | null, createdAt: string }> };

export type CoachUsersRecentScannersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type CoachUsersRecentScannersQuery = { __typename?: 'Query', coachUsersRecentScanners: Array<{ __typename?: 'CoachUser', userId: string, email: string, displayName: string, initialWeight?: number | null, currentWeight?: number | null, goalLabel?: string | null, caloricGoal?: number | null, mealsCount: number, scoreRounded?: number | null, createdAt: string }> };

export type CoachUsersPageQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CoachUsersPageQuery = { __typename?: 'Query', coachUsersPage: { __typename?: 'CoachUsersPage', totalCount: number, users: Array<{ __typename?: 'CoachUser', userId: string, email: string, displayName: string, role: string, initialWeight?: number | null, currentWeight?: number | null, goalLabel?: string | null, caloricGoal?: number | null, mealsCount: number, scoreRounded?: number | null, createdAt: string }> } };

export type ProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email: string, createdAt: any, role: UserRole } | null };

export type UserDashboardDataQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UserDashboardDataQuery = { __typename?: 'Query', userDashboardData?: { __typename?: 'DashboardData', firstName?: string | null, daysOfUse: number, healthScore: number, scannedMeals: number, averageCalories: number, targetCalories: number, targetProgress: number, targetProtein: number, targetCarbs: number, targetLipids: number, todayProtein: number, todayCarbs: number, todayFat: number, hasMoreMeals: boolean, recentMeals: Array<{ __typename?: 'DashboardMealData', name: string, calories: number, protein: number, carbs: number, fat: number }> } | null };

export type UserEvolutionDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserEvolutionDataQuery = { __typename?: 'Query', userEvolutionData: Array<{ __typename?: 'EvolutionDataPoint', week: string, weight: number, calories: number, score: number }> };

export type UserMealsDataQueryVariables = Exact<{
  includeIngredients?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UserMealsDataQuery = { __typename?: 'Query', userMealsData: Array<{ __typename?: 'UserMealData', id: string, name: string, consumedAt: string, calories: number, protein: number, carbs: number, fat: number, aiScore: number, photo: string, ingredients?: Array<{ __typename?: 'UserMealIngredientData', name: string, quantity?: number | null }>, aiInsights: Array<string>, coachComment: string, coachName: string }> };

export type UserProfileDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfileDataQuery = { __typename?: 'Query', userProfileData?: { __typename?: 'UserProfileData', firstName: string, lastName: string, dateOfBirth?: string | null, gender?: string | null, height?: number | null, currentWeight?: number | null, goal?: string | null, medicalTags: Array<string> } | null };

export type UserProfilePromptDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfilePromptDataQuery = { __typename?: 'Query', userProfileData?: { __typename?: 'UserProfileData', dateOfBirth?: string | null, gender?: string | null, height?: number | null, currentWeight?: number | null, medicalTags: Array<string> } | null };

export type UserRecipesDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserRecipesDataQuery = { __typename?: 'Query', userRecipesData: Array<{ __typename?: 'RecipeData', id: string, title: string, source: string, photo: string, prepTime: string, servings: number, difficulty: string, calories: number, protein: number, carbs: number, fat: number, fiber: number, description: string, prepSteps: Array<string>, benefits: Array<string>, coachNote: string }> };


export const AnalyzeMealImageDocument = gql`
    mutation AnalyzeMealImage($input: AnalyzeMealImageInput!) {
  analyzeMealImage(input: $input) {
    dishName
    analysisSummary
    healthScore
    mealType
    warnings
    totalNutrition {
      calories
      protein
      carbs
      fat
      fiber
      sugar
      salt
    }
    ingredients {
      name
      estimatedQuantityGrams
      confidence
      calories
      protein
      carbs
      fat
    }
  }
}
    `;
export type AnalyzeMealImageMutationFn = ApolloReactCommon.MutationFunction<AnalyzeMealImageMutation, AnalyzeMealImageMutationVariables>;

/**
 * __useAnalyzeMealImageMutation__
 *
 * To run a mutation, you first call `useAnalyzeMealImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAnalyzeMealImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [analyzeMealImageMutation, { data, loading, error }] = useAnalyzeMealImageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAnalyzeMealImageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AnalyzeMealImageMutation, AnalyzeMealImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AnalyzeMealImageMutation, AnalyzeMealImageMutationVariables>(AnalyzeMealImageDocument, options);
      }
export type AnalyzeMealImageMutationHookResult = ReturnType<typeof useAnalyzeMealImageMutation>;
export type AnalyzeMealImageMutationResult = ApolloReactCommon.MutationResult<AnalyzeMealImageMutation>;
export type AnalyzeMealImageMutationOptions = ApolloReactCommon.BaseMutationOptions<AnalyzeMealImageMutation, AnalyzeMealImageMutationVariables>;
export const AssignRecipeToUserDocument = gql`
    mutation AssignRecipeToUser($recipeId: String!, $userId: String!) {
  assignRecipeToUser(recipeId: $recipeId, userId: $userId)
}
    `;
export type AssignRecipeToUserMutationFn = ApolloReactCommon.MutationFunction<AssignRecipeToUserMutation, AssignRecipeToUserMutationVariables>;

/**
 * __useAssignRecipeToUserMutation__
 *
 * To run a mutation, you first call `useAssignRecipeToUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignRecipeToUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignRecipeToUserMutation, { data, loading, error }] = useAssignRecipeToUserMutation({
 *   variables: {
 *      recipeId: // value for 'recipeId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useAssignRecipeToUserMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AssignRecipeToUserMutation, AssignRecipeToUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AssignRecipeToUserMutation, AssignRecipeToUserMutationVariables>(AssignRecipeToUserDocument, options);
      }
export type AssignRecipeToUserMutationHookResult = ReturnType<typeof useAssignRecipeToUserMutation>;
export type AssignRecipeToUserMutationResult = ApolloReactCommon.MutationResult<AssignRecipeToUserMutation>;
export type AssignRecipeToUserMutationOptions = ApolloReactCommon.BaseMutationOptions<AssignRecipeToUserMutation, AssignRecipeToUserMutationVariables>;
export const CreateDishFromScannerSubmissionDocument = gql`
    mutation CreateDishFromScannerSubmission($input: CreateDishFromScannerSubmissionInput!) {
  createDishFromScannerSubmission(input: $input)
}
    `;
export type CreateDishFromScannerSubmissionMutationFn = ApolloReactCommon.MutationFunction<CreateDishFromScannerSubmissionMutation, CreateDishFromScannerSubmissionMutationVariables>;

/**
 * __useCreateDishFromScannerSubmissionMutation__
 *
 * To run a mutation, you first call `useCreateDishFromScannerSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDishFromScannerSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDishFromScannerSubmissionMutation, { data, loading, error }] = useCreateDishFromScannerSubmissionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateDishFromScannerSubmissionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateDishFromScannerSubmissionMutation, CreateDishFromScannerSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateDishFromScannerSubmissionMutation, CreateDishFromScannerSubmissionMutationVariables>(CreateDishFromScannerSubmissionDocument, options);
      }
export type CreateDishFromScannerSubmissionMutationHookResult = ReturnType<typeof useCreateDishFromScannerSubmissionMutation>;
export type CreateDishFromScannerSubmissionMutationResult = ApolloReactCommon.MutationResult<CreateDishFromScannerSubmissionMutation>;
export type CreateDishFromScannerSubmissionMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateDishFromScannerSubmissionMutation, CreateDishFromScannerSubmissionMutationVariables>;
export const CreateRecipeDocument = gql`
    mutation CreateRecipe($input: CreateRecipeInput!) {
  createRecipe(input: $input) {
    id
    title
    status
  }
}
    `;
export type CreateRecipeMutationFn = ApolloReactCommon.MutationFunction<CreateRecipeMutation, CreateRecipeMutationVariables>;

/**
 * __useCreateRecipeMutation__
 *
 * To run a mutation, you first call `useCreateRecipeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRecipeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRecipeMutation, { data, loading, error }] = useCreateRecipeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateRecipeMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateRecipeMutation, CreateRecipeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateRecipeMutation, CreateRecipeMutationVariables>(CreateRecipeDocument, options);
      }
export type CreateRecipeMutationHookResult = ReturnType<typeof useCreateRecipeMutation>;
export type CreateRecipeMutationResult = ApolloReactCommon.MutationResult<CreateRecipeMutation>;
export type CreateRecipeMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateRecipeMutation, CreateRecipeMutationVariables>;
export const LoginDocument = gql`
    mutation Login($data: LoginInput!) {
  login(data: $data)
}
    `;
export type LoginMutationFn = ApolloReactCommon.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = ApolloReactCommon.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = ApolloReactCommon.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = ApolloReactCommon.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const SaveMealAnalysisDocument = gql`
    mutation SaveMealAnalysis($input: SaveMealAnalysisInput!) {
  saveMealAnalysis(input: $input)
}
    `;
export type SaveMealAnalysisMutationFn = ApolloReactCommon.MutationFunction<SaveMealAnalysisMutation, SaveMealAnalysisMutationVariables>;

/**
 * __useSaveMealAnalysisMutation__
 *
 * To run a mutation, you first call `useSaveMealAnalysisMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveMealAnalysisMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveMealAnalysisMutation, { data, loading, error }] = useSaveMealAnalysisMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSaveMealAnalysisMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SaveMealAnalysisMutation, SaveMealAnalysisMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SaveMealAnalysisMutation, SaveMealAnalysisMutationVariables>(SaveMealAnalysisDocument, options);
      }
export type SaveMealAnalysisMutationHookResult = ReturnType<typeof useSaveMealAnalysisMutation>;
export type SaveMealAnalysisMutationResult = ApolloReactCommon.MutationResult<SaveMealAnalysisMutation>;
export type SaveMealAnalysisMutationOptions = ApolloReactCommon.BaseMutationOptions<SaveMealAnalysisMutation, SaveMealAnalysisMutationVariables>;
export const SaveScannerCoachSubmissionDocument = gql`
    mutation SaveScannerCoachSubmission($payloadJson: String!) {
  saveScannerCoachSubmission(payloadJson: $payloadJson)
}
    `;
export type SaveScannerCoachSubmissionMutationFn = ApolloReactCommon.MutationFunction<SaveScannerCoachSubmissionMutation, SaveScannerCoachSubmissionMutationVariables>;

/**
 * __useSaveScannerCoachSubmissionMutation__
 *
 * To run a mutation, you first call `useSaveScannerCoachSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveScannerCoachSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveScannerCoachSubmissionMutation, { data, loading, error }] = useSaveScannerCoachSubmissionMutation({
 *   variables: {
 *      payloadJson: // value for 'payloadJson'
 *   },
 * });
 */
export function useSaveScannerCoachSubmissionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SaveScannerCoachSubmissionMutation, SaveScannerCoachSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SaveScannerCoachSubmissionMutation, SaveScannerCoachSubmissionMutationVariables>(SaveScannerCoachSubmissionDocument, options);
      }
export type SaveScannerCoachSubmissionMutationHookResult = ReturnType<typeof useSaveScannerCoachSubmissionMutation>;
export type SaveScannerCoachSubmissionMutationResult = ApolloReactCommon.MutationResult<SaveScannerCoachSubmissionMutation>;
export type SaveScannerCoachSubmissionMutationOptions = ApolloReactCommon.BaseMutationOptions<SaveScannerCoachSubmissionMutation, SaveScannerCoachSubmissionMutationVariables>;
export const SignupDocument = gql`
    mutation Signup($data: SignupInput!) {
  signup(data: $data) {
    id
    email
    createdAt
  }
}
    `;
export type SignupMutationFn = ApolloReactCommon.MutationFunction<SignupMutation, SignupMutationVariables>;

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSignupMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SignupMutation, SignupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SignupMutation, SignupMutationVariables>(SignupDocument, options);
      }
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = ApolloReactCommon.MutationResult<SignupMutation>;
export type SignupMutationOptions = ApolloReactCommon.BaseMutationOptions<SignupMutation, SignupMutationVariables>;
export const UpdateAnalysisCaloriesDocument = gql`
    mutation UpdateAnalysisCalories($input: UpdateAnalysisCaloriesInput!) {
  updateAnalysisCalories(input: $input) {
    id
    calories
    isModified
    validatedAt
    status
  }
}
    `;
export type UpdateAnalysisCaloriesMutationFn = ApolloReactCommon.MutationFunction<UpdateAnalysisCaloriesMutation, UpdateAnalysisCaloriesMutationVariables>;

/**
 * __useUpdateAnalysisCaloriesMutation__
 *
 * To run a mutation, you first call `useUpdateAnalysisCaloriesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAnalysisCaloriesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAnalysisCaloriesMutation, { data, loading, error }] = useUpdateAnalysisCaloriesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAnalysisCaloriesMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateAnalysisCaloriesMutation, UpdateAnalysisCaloriesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateAnalysisCaloriesMutation, UpdateAnalysisCaloriesMutationVariables>(UpdateAnalysisCaloriesDocument, options);
      }
export type UpdateAnalysisCaloriesMutationHookResult = ReturnType<typeof useUpdateAnalysisCaloriesMutation>;
export type UpdateAnalysisCaloriesMutationResult = ApolloReactCommon.MutationResult<UpdateAnalysisCaloriesMutation>;
export type UpdateAnalysisCaloriesMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateAnalysisCaloriesMutation, UpdateAnalysisCaloriesMutationVariables>;
export const UpdateDishNameDocument = gql`
    mutation UpdateDishName($input: UpdateDishNameInput!) {
  updateDishName(input: $input)
}
    `;
export type UpdateDishNameMutationFn = ApolloReactCommon.MutationFunction<UpdateDishNameMutation, UpdateDishNameMutationVariables>;

/**
 * __useUpdateDishNameMutation__
 *
 * To run a mutation, you first call `useUpdateDishNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDishNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDishNameMutation, { data, loading, error }] = useUpdateDishNameMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDishNameMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateDishNameMutation, UpdateDishNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateDishNameMutation, UpdateDishNameMutationVariables>(UpdateDishNameDocument, options);
      }
export type UpdateDishNameMutationHookResult = ReturnType<typeof useUpdateDishNameMutation>;
export type UpdateDishNameMutationResult = ApolloReactCommon.MutationResult<UpdateDishNameMutation>;
export type UpdateDishNameMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateDishNameMutation, UpdateDishNameMutationVariables>;
export const UpdateIngredientQuantitiesDocument = gql`
    mutation UpdateIngredientQuantities($input: UpdateIngredientQuantitiesInput!) {
  updateIngredientQuantities(input: $input) {
    id
    calories
    proteins
    carbohydrates
    lipids
    fiber
    sugar
    sodium
    mealHealthScore
    isModified
  }
}
    `;
export type UpdateIngredientQuantitiesMutationFn = ApolloReactCommon.MutationFunction<UpdateIngredientQuantitiesMutation, UpdateIngredientQuantitiesMutationVariables>;

/**
 * __useUpdateIngredientQuantitiesMutation__
 *
 * To run a mutation, you first call `useUpdateIngredientQuantitiesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIngredientQuantitiesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIngredientQuantitiesMutation, { data, loading, error }] = useUpdateIngredientQuantitiesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateIngredientQuantitiesMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateIngredientQuantitiesMutation, UpdateIngredientQuantitiesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateIngredientQuantitiesMutation, UpdateIngredientQuantitiesMutationVariables>(UpdateIngredientQuantitiesDocument, options);
      }
export type UpdateIngredientQuantitiesMutationHookResult = ReturnType<typeof useUpdateIngredientQuantitiesMutation>;
export type UpdateIngredientQuantitiesMutationResult = ApolloReactCommon.MutationResult<UpdateIngredientQuantitiesMutation>;
export type UpdateIngredientQuantitiesMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateIngredientQuantitiesMutation, UpdateIngredientQuantitiesMutationVariables>;
export const UpdateUserProfileDataDocument = gql`
    mutation UpdateUserProfileData($data: UserProfileUpdateInput!) {
  updateUserProfileData(data: $data) {
    firstName
    lastName
    dateOfBirth
    gender
    height
    currentWeight
    goal
    medicalTags
  }
}
    `;
export type UpdateUserProfileDataMutationFn = ApolloReactCommon.MutationFunction<UpdateUserProfileDataMutation, UpdateUserProfileDataMutationVariables>;

/**
 * __useUpdateUserProfileDataMutation__
 *
 * To run a mutation, you first call `useUpdateUserProfileDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserProfileDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserProfileDataMutation, { data, loading, error }] = useUpdateUserProfileDataMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateUserProfileDataMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateUserProfileDataMutation, UpdateUserProfileDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateUserProfileDataMutation, UpdateUserProfileDataMutationVariables>(UpdateUserProfileDataDocument, options);
      }
export type UpdateUserProfileDataMutationHookResult = ReturnType<typeof useUpdateUserProfileDataMutation>;
export type UpdateUserProfileDataMutationResult = ApolloReactCommon.MutationResult<UpdateUserProfileDataMutation>;
export type UpdateUserProfileDataMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateUserProfileDataMutation, UpdateUserProfileDataMutationVariables>;
export const CoachDashboardDataDocument = gql`
    query CoachDashboardData {
  coachDashboardData {
    stats {
      users {
        count
        evolution
      }
      publishedRecipes {
        count
        evolution
      }
      scannedMeals {
        count
        evolution
      }
      averageScore {
        count
        evolution
      }
    }
    recentUsers {
      name
      email
      score
      currentWeight
      goal
      targetDailyCalories
    }
    recentRecipes {
      id
      name
      photo
      calories
      proteins
      carbs
      lipids
    }
  }
}
    `;

/**
 * __useCoachDashboardDataQuery__
 *
 * To run a query within a React component, call `useCoachDashboardDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoachDashboardDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoachDashboardDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useCoachDashboardDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>(CoachDashboardDataDocument, options);
      }
export function useCoachDashboardDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>(CoachDashboardDataDocument, options);
        }
// @ts-ignore
export function useCoachDashboardDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>;
export function useCoachDashboardDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachDashboardDataQuery | undefined, CoachDashboardDataQueryVariables>;
export function useCoachDashboardDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>(CoachDashboardDataDocument, options);
        }
export type CoachDashboardDataQueryHookResult = ReturnType<typeof useCoachDashboardDataQuery>;
export type CoachDashboardDataLazyQueryHookResult = ReturnType<typeof useCoachDashboardDataLazyQuery>;
export type CoachDashboardDataSuspenseQueryHookResult = ReturnType<typeof useCoachDashboardDataSuspenseQuery>;
export type CoachDashboardDataQueryResult = ApolloReactCommon.QueryResult<CoachDashboardDataQuery, CoachDashboardDataQueryVariables>;
export const CoachGetDishAnalysisDocument = gql`
    query CoachGetDishAnalysis($dishId: String!) {
  coachGetDishAnalysis(dishId: $dishId) {
    dishId
    analysisId
    dishName
    ingredients {
      name
      estimatedQuantityGrams
      calories
      protein
      carbs
      fat
    }
    totalNutrition {
      calories
      protein
      carbs
      fat
      fiber
      sugar
      salt
    }
    analysisSummary
    healthScore
    warnings
    mealType
    photoUrl
  }
}
    `;

/**
 * __useCoachGetDishAnalysisQuery__
 *
 * To run a query within a React component, call `useCoachGetDishAnalysisQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoachGetDishAnalysisQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoachGetDishAnalysisQuery({
 *   variables: {
 *      dishId: // value for 'dishId'
 *   },
 * });
 */
export function useCoachGetDishAnalysisQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables> & ({ variables: CoachGetDishAnalysisQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>(CoachGetDishAnalysisDocument, options);
      }
export function useCoachGetDishAnalysisLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>(CoachGetDishAnalysisDocument, options);
        }
// @ts-ignore
export function useCoachGetDishAnalysisSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>;
export function useCoachGetDishAnalysisSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachGetDishAnalysisQuery | undefined, CoachGetDishAnalysisQueryVariables>;
export function useCoachGetDishAnalysisSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>(CoachGetDishAnalysisDocument, options);
        }
export type CoachGetDishAnalysisQueryHookResult = ReturnType<typeof useCoachGetDishAnalysisQuery>;
export type CoachGetDishAnalysisLazyQueryHookResult = ReturnType<typeof useCoachGetDishAnalysisLazyQuery>;
export type CoachGetDishAnalysisSuspenseQueryHookResult = ReturnType<typeof useCoachGetDishAnalysisSuspenseQuery>;
export type CoachGetDishAnalysisQueryResult = ApolloReactCommon.QueryResult<CoachGetDishAnalysisQuery, CoachGetDishAnalysisQueryVariables>;
export const CoachRecipesPageDataDocument = gql`
    query CoachRecipesPageData($limit: Int!, $offset: Int!) {
  coachRecipesPageData(limit: $limit, offset: $offset) {
    recipes {
      id
      title
      source
      photo
      prepTime
      servings
      difficulty
      calories
      protein
      carbs
      fat
      fiber
      description
      prepSteps
      benefits
      coachNote
    }
    totalCount
    coachCount
    averageCalories
  }
}
    `;

/**
 * __useCoachRecipesPageDataQuery__
 *
 * To run a query within a React component, call `useCoachRecipesPageDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoachRecipesPageDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoachRecipesPageDataQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useCoachRecipesPageDataQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables> & ({ variables: CoachRecipesPageDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>(CoachRecipesPageDataDocument, options);
      }
export function useCoachRecipesPageDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>(CoachRecipesPageDataDocument, options);
        }
// @ts-ignore
export function useCoachRecipesPageDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>;
export function useCoachRecipesPageDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachRecipesPageDataQuery | undefined, CoachRecipesPageDataQueryVariables>;
export function useCoachRecipesPageDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>(CoachRecipesPageDataDocument, options);
        }
export type CoachRecipesPageDataQueryHookResult = ReturnType<typeof useCoachRecipesPageDataQuery>;
export type CoachRecipesPageDataLazyQueryHookResult = ReturnType<typeof useCoachRecipesPageDataLazyQuery>;
export type CoachRecipesPageDataSuspenseQueryHookResult = ReturnType<typeof useCoachRecipesPageDataSuspenseQuery>;
export type CoachRecipesPageDataQueryResult = ApolloReactCommon.QueryResult<CoachRecipesPageDataQuery, CoachRecipesPageDataQueryVariables>;
export const CoachScannerSubmissionsTestDataDocument = gql`
    query CoachScannerSubmissionsTestData($userId: String, $limit: Int) {
  coachScannerSubmissionsTestData(userId: $userId, limit: $limit) {
    id
    userId
    userEmail
    createdAt
    payloadJson
  }
}
    `;

/**
 * __useCoachScannerSubmissionsTestDataQuery__
 *
 * To run a query within a React component, call `useCoachScannerSubmissionsTestDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoachScannerSubmissionsTestDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoachScannerSubmissionsTestDataQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useCoachScannerSubmissionsTestDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>(CoachScannerSubmissionsTestDataDocument, options);
      }
export function useCoachScannerSubmissionsTestDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>(CoachScannerSubmissionsTestDataDocument, options);
        }
// @ts-ignore
export function useCoachScannerSubmissionsTestDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>;
export function useCoachScannerSubmissionsTestDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachScannerSubmissionsTestDataQuery | undefined, CoachScannerSubmissionsTestDataQueryVariables>;
export function useCoachScannerSubmissionsTestDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>(CoachScannerSubmissionsTestDataDocument, options);
        }
export type CoachScannerSubmissionsTestDataQueryHookResult = ReturnType<typeof useCoachScannerSubmissionsTestDataQuery>;
export type CoachScannerSubmissionsTestDataLazyQueryHookResult = ReturnType<typeof useCoachScannerSubmissionsTestDataLazyQuery>;
export type CoachScannerSubmissionsTestDataSuspenseQueryHookResult = ReturnType<typeof useCoachScannerSubmissionsTestDataSuspenseQuery>;
export type CoachScannerSubmissionsTestDataQueryResult = ApolloReactCommon.QueryResult<CoachScannerSubmissionsTestDataQuery, CoachScannerSubmissionsTestDataQueryVariables>;
export const CoachUserDetailDocument = gql`
    query CoachUserDetail($userId: String!) {
  coachUserDetail(userId: $userId) {
    displayName
    email
    height
    currentWeight
    goal
    pathologies
    imc
    evolutionData {
      week
      weight
      calories
      score
    }
    todayMeals {
      id
      name
      consumedAt
      calories
      protein
      carbs
      fat
      aiScore
      photo
      aiInsights
      coachComment
      coachName
    }
  }
}
    `;

/**
 * __useCoachUserDetailQuery__
 *
 * To run a query within a React component, call `useCoachUserDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoachUserDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoachUserDetailQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useCoachUserDetailQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CoachUserDetailQuery, CoachUserDetailQueryVariables> & ({ variables: CoachUserDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachUserDetailQuery, CoachUserDetailQueryVariables>(CoachUserDetailDocument, options);
      }
export function useCoachUserDetailLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CoachUserDetailQuery, CoachUserDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CoachUserDetailQuery, CoachUserDetailQueryVariables>(CoachUserDetailDocument, options);
        }
// @ts-ignore
export function useCoachUserDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CoachUserDetailQuery, CoachUserDetailQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachUserDetailQuery, CoachUserDetailQueryVariables>;
export function useCoachUserDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachUserDetailQuery, CoachUserDetailQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachUserDetailQuery | undefined, CoachUserDetailQueryVariables>;
export function useCoachUserDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachUserDetailQuery, CoachUserDetailQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CoachUserDetailQuery, CoachUserDetailQueryVariables>(CoachUserDetailDocument, options);
        }
export type CoachUserDetailQueryHookResult = ReturnType<typeof useCoachUserDetailQuery>;
export type CoachUserDetailLazyQueryHookResult = ReturnType<typeof useCoachUserDetailLazyQuery>;
export type CoachUserDetailSuspenseQueryHookResult = ReturnType<typeof useCoachUserDetailSuspenseQuery>;
export type CoachUserDetailQueryResult = ApolloReactCommon.QueryResult<CoachUserDetailQuery, CoachUserDetailQueryVariables>;
export const CoachUserMealsTestDataDocument = gql`
    query CoachUserMealsTestData($userId: String, $limit: Int) {
  coachUserMealsTestData(userId: $userId, limit: $limit) {
    id
    userId
    userEmail
    name
    consumedAt
    calories
    protein
    carbs
    fat
    aiScore
    photo
    aiInsights
    coachComment
    coachName
  }
}
    `;

/**
 * __useCoachUserMealsTestDataQuery__
 *
 * To run a query within a React component, call `useCoachUserMealsTestDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoachUserMealsTestDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoachUserMealsTestDataQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useCoachUserMealsTestDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>(CoachUserMealsTestDataDocument, options);
      }
export function useCoachUserMealsTestDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>(CoachUserMealsTestDataDocument, options);
        }
// @ts-ignore
export function useCoachUserMealsTestDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>;
export function useCoachUserMealsTestDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachUserMealsTestDataQuery | undefined, CoachUserMealsTestDataQueryVariables>;
export function useCoachUserMealsTestDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>(CoachUserMealsTestDataDocument, options);
        }
export type CoachUserMealsTestDataQueryHookResult = ReturnType<typeof useCoachUserMealsTestDataQuery>;
export type CoachUserMealsTestDataLazyQueryHookResult = ReturnType<typeof useCoachUserMealsTestDataLazyQuery>;
export type CoachUserMealsTestDataSuspenseQueryHookResult = ReturnType<typeof useCoachUserMealsTestDataSuspenseQuery>;
export type CoachUserMealsTestDataQueryResult = ApolloReactCommon.QueryResult<CoachUserMealsTestDataQuery, CoachUserMealsTestDataQueryVariables>;
export const CoachUserDocument = gql`
    query CoachUser {
  coachUsers {
    userId
    email
    displayName
    initialWeight
    currentWeight
    goalLabel
    caloricGoal
    mealsCount
    scoreRounded
    createdAt
  }
}
    `;

/**
 * __useCoachUserQuery__
 *
 * To run a query within a React component, call `useCoachUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoachUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoachUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCoachUserQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CoachUserQuery, CoachUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachUserQuery, CoachUserQueryVariables>(CoachUserDocument, options);
      }
export function useCoachUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CoachUserQuery, CoachUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CoachUserQuery, CoachUserQueryVariables>(CoachUserDocument, options);
        }
// @ts-ignore
export function useCoachUserSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CoachUserQuery, CoachUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachUserQuery, CoachUserQueryVariables>;
export function useCoachUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachUserQuery, CoachUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachUserQuery | undefined, CoachUserQueryVariables>;
export function useCoachUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachUserQuery, CoachUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CoachUserQuery, CoachUserQueryVariables>(CoachUserDocument, options);
        }
export type CoachUserQueryHookResult = ReturnType<typeof useCoachUserQuery>;
export type CoachUserLazyQueryHookResult = ReturnType<typeof useCoachUserLazyQuery>;
export type CoachUserSuspenseQueryHookResult = ReturnType<typeof useCoachUserSuspenseQuery>;
export type CoachUserQueryResult = ApolloReactCommon.QueryResult<CoachUserQuery, CoachUserQueryVariables>;
export const CoachUsersRecentScannersDocument = gql`
    query CoachUsersRecentScanners($limit: Int) {
  coachUsersRecentScanners(limit: $limit) {
    userId
    email
    displayName
    initialWeight
    currentWeight
    goalLabel
    caloricGoal
    mealsCount
    scoreRounded
    createdAt
  }
}
    `;

/**
 * __useCoachUsersRecentScannersQuery__
 * Charge d’abord les coachés ayant le plus récemment scanné (pour affichage progressif).
 */
export function useCoachUsersRecentScannersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CoachUsersRecentScannersQuery, CoachUsersRecentScannersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachUsersRecentScannersQuery, CoachUsersRecentScannersQueryVariables>(CoachUsersRecentScannersDocument, options);
      }
export type CoachUsersRecentScannersQueryHookResult = ReturnType<typeof useCoachUsersRecentScannersQuery>;
export const CoachUsersPageDocument = gql`
    query CoachUsersPage($limit: Int, $offset: Int) {
  coachUsersPage(limit: $limit, offset: $offset) {
    users {
      userId
      email
      displayName
      role
      initialWeight
      currentWeight
      goalLabel
      caloricGoal
      mealsCount
      scoreRounded
      createdAt
    }
    totalCount
  }
}
    `;

/**
 * __useCoachUsersPageQuery__
 *
 * To run a query within a React component, call `useCoachUsersPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useCoachUsersPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCoachUsersPageQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useCoachUsersPageQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CoachUsersPageQuery, CoachUsersPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CoachUsersPageQuery, CoachUsersPageQueryVariables>(CoachUsersPageDocument, options);
      }
export function useCoachUsersPageLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CoachUsersPageQuery, CoachUsersPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CoachUsersPageQuery, CoachUsersPageQueryVariables>(CoachUsersPageDocument, options);
        }
// @ts-ignore
export function useCoachUsersPageSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CoachUsersPageQuery, CoachUsersPageQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachUsersPageQuery, CoachUsersPageQueryVariables>;
export function useCoachUsersPageSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachUsersPageQuery, CoachUsersPageQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CoachUsersPageQuery | undefined, CoachUsersPageQueryVariables>;
export function useCoachUsersPageSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CoachUsersPageQuery, CoachUsersPageQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CoachUsersPageQuery, CoachUsersPageQueryVariables>(CoachUsersPageDocument, options);
        }
export type CoachUsersPageQueryHookResult = ReturnType<typeof useCoachUsersPageQuery>;
export type CoachUsersPageLazyQueryHookResult = ReturnType<typeof useCoachUsersPageLazyQuery>;
export type CoachUsersPageSuspenseQueryHookResult = ReturnType<typeof useCoachUsersPageSuspenseQuery>;
export type CoachUsersPageQueryResult = ApolloReactCommon.QueryResult<CoachUsersPageQuery, CoachUsersPageQueryVariables>;
export const ProfileDocument = gql`
    query profile {
  me {
    id
    email
    createdAt
    role
  }
}
    `;

/**
 * __useProfileQuery__
 *
 * To run a query within a React component, call `useProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useProfileQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
      }
export function useProfileLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
        }
// @ts-ignore
export function useProfileSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ProfileQuery, ProfileQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ProfileQuery, ProfileQueryVariables>;
export function useProfileSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ProfileQuery, ProfileQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ProfileQuery | undefined, ProfileQueryVariables>;
export function useProfileSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
        }
export type ProfileQueryHookResult = ReturnType<typeof useProfileQuery>;
export type ProfileLazyQueryHookResult = ReturnType<typeof useProfileLazyQuery>;
export type ProfileSuspenseQueryHookResult = ReturnType<typeof useProfileSuspenseQuery>;
export type ProfileQueryResult = ApolloReactCommon.QueryResult<ProfileQuery, ProfileQueryVariables>;
export const UserDashboardDataDocument = gql`
    query UserDashboardData($limit: Int, $offset: Int) {
  userDashboardData(limit: $limit, offset: $offset) {
    firstName
    daysOfUse
    healthScore
    scannedMeals
    averageCalories
    targetCalories
    targetProgress
    targetProtein
    targetCarbs
    targetLipids
    todayProtein
    todayCarbs
    todayFat
    hasMoreMeals
    recentMeals {
      name
      calories
      protein
      carbs
      fat
    }
  }
}
    `;

/**
 * __useUserDashboardDataQuery__
 *
 * To run a query within a React component, call `useUserDashboardDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserDashboardDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserDashboardDataQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useUserDashboardDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UserDashboardDataQuery, UserDashboardDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UserDashboardDataQuery, UserDashboardDataQueryVariables>(UserDashboardDataDocument, options);
      }
export function useUserDashboardDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UserDashboardDataQuery, UserDashboardDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UserDashboardDataQuery, UserDashboardDataQueryVariables>(UserDashboardDataDocument, options);
        }
// @ts-ignore
export function useUserDashboardDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<UserDashboardDataQuery, UserDashboardDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserDashboardDataQuery, UserDashboardDataQueryVariables>;
export function useUserDashboardDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserDashboardDataQuery, UserDashboardDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserDashboardDataQuery | undefined, UserDashboardDataQueryVariables>;
export function useUserDashboardDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserDashboardDataQuery, UserDashboardDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<UserDashboardDataQuery, UserDashboardDataQueryVariables>(UserDashboardDataDocument, options);
        }
export type UserDashboardDataQueryHookResult = ReturnType<typeof useUserDashboardDataQuery>;
export type UserDashboardDataLazyQueryHookResult = ReturnType<typeof useUserDashboardDataLazyQuery>;
export type UserDashboardDataSuspenseQueryHookResult = ReturnType<typeof useUserDashboardDataSuspenseQuery>;
export type UserDashboardDataQueryResult = ApolloReactCommon.QueryResult<UserDashboardDataQuery, UserDashboardDataQueryVariables>;
export const UserEvolutionDataDocument = gql`
    query UserEvolutionData {
  userEvolutionData {
    week
    weight
    calories
    score
  }
}
    `;

/**
 * __useUserEvolutionDataQuery__
 *
 * To run a query within a React component, call `useUserEvolutionDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserEvolutionDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserEvolutionDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserEvolutionDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>(UserEvolutionDataDocument, options);
      }
export function useUserEvolutionDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>(UserEvolutionDataDocument, options);
        }
// @ts-ignore
export function useUserEvolutionDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>;
export function useUserEvolutionDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserEvolutionDataQuery | undefined, UserEvolutionDataQueryVariables>;
export function useUserEvolutionDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>(UserEvolutionDataDocument, options);
        }
export type UserEvolutionDataQueryHookResult = ReturnType<typeof useUserEvolutionDataQuery>;
export type UserEvolutionDataLazyQueryHookResult = ReturnType<typeof useUserEvolutionDataLazyQuery>;
export type UserEvolutionDataSuspenseQueryHookResult = ReturnType<typeof useUserEvolutionDataSuspenseQuery>;
export type UserEvolutionDataQueryResult = ApolloReactCommon.QueryResult<UserEvolutionDataQuery, UserEvolutionDataQueryVariables>;
export const UserMealsDataDocument = gql`
    query UserMealsData($includeIngredients: Boolean = true) {
  userMealsData {
    id
    name
    consumedAt
    calories
    protein
    carbs
    fat
    aiScore
    photo
    ingredients @include(if: $includeIngredients) {
      name
      quantity
    }
    aiInsights
    coachComment
    coachName
  }
}
    `;

/**
 * __useUserMealsDataQuery__
 *
 * To run a query within a React component, call `useUserMealsDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserMealsDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserMealsDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserMealsDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UserMealsDataQuery, UserMealsDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UserMealsDataQuery, UserMealsDataQueryVariables>(UserMealsDataDocument, options);
      }
export function useUserMealsDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UserMealsDataQuery, UserMealsDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UserMealsDataQuery, UserMealsDataQueryVariables>(UserMealsDataDocument, options);
        }
// @ts-ignore
export function useUserMealsDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<UserMealsDataQuery, UserMealsDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserMealsDataQuery, UserMealsDataQueryVariables>;
export function useUserMealsDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserMealsDataQuery, UserMealsDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserMealsDataQuery | undefined, UserMealsDataQueryVariables>;
export function useUserMealsDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserMealsDataQuery, UserMealsDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<UserMealsDataQuery, UserMealsDataQueryVariables>(UserMealsDataDocument, options);
        }
export type UserMealsDataQueryHookResult = ReturnType<typeof useUserMealsDataQuery>;
export type UserMealsDataLazyQueryHookResult = ReturnType<typeof useUserMealsDataLazyQuery>;
export type UserMealsDataSuspenseQueryHookResult = ReturnType<typeof useUserMealsDataSuspenseQuery>;
export type UserMealsDataQueryResult = ApolloReactCommon.QueryResult<UserMealsDataQuery, UserMealsDataQueryVariables>;
export const UserProfileDataDocument = gql`
    query UserProfileData {
  userProfileData {
    firstName
    lastName
    dateOfBirth
    gender
    height
    currentWeight
    goal
    medicalTags
  }
}
    `;

/**
 * __useUserProfileDataQuery__
 *
 * To run a query within a React component, call `useUserProfileDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserProfileDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UserProfileDataQuery, UserProfileDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UserProfileDataQuery, UserProfileDataQueryVariables>(UserProfileDataDocument, options);
      }
export function useUserProfileDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UserProfileDataQuery, UserProfileDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UserProfileDataQuery, UserProfileDataQueryVariables>(UserProfileDataDocument, options);
        }
// @ts-ignore
export function useUserProfileDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<UserProfileDataQuery, UserProfileDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserProfileDataQuery, UserProfileDataQueryVariables>;
export function useUserProfileDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserProfileDataQuery, UserProfileDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserProfileDataQuery | undefined, UserProfileDataQueryVariables>;
export function useUserProfileDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserProfileDataQuery, UserProfileDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<UserProfileDataQuery, UserProfileDataQueryVariables>(UserProfileDataDocument, options);
        }
export type UserProfileDataQueryHookResult = ReturnType<typeof useUserProfileDataQuery>;
export type UserProfileDataLazyQueryHookResult = ReturnType<typeof useUserProfileDataLazyQuery>;
export type UserProfileDataSuspenseQueryHookResult = ReturnType<typeof useUserProfileDataSuspenseQuery>;
export type UserProfileDataQueryResult = ApolloReactCommon.QueryResult<UserProfileDataQuery, UserProfileDataQueryVariables>;
export const UserProfilePromptDataDocument = gql`
    query UserProfilePromptData {
  userProfileData {
    dateOfBirth
    gender
    height
    currentWeight
    medicalTags
  }
}
    `;

/**
 * __useUserProfilePromptDataQuery__
 *
 * To run a query within a React component, call `useUserProfilePromptDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfilePromptDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfilePromptDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserProfilePromptDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>(UserProfilePromptDataDocument, options);
      }
export function useUserProfilePromptDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>(UserProfilePromptDataDocument, options);
        }
// @ts-ignore
export function useUserProfilePromptDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>;
export function useUserProfilePromptDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserProfilePromptDataQuery | undefined, UserProfilePromptDataQueryVariables>;
export function useUserProfilePromptDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>(UserProfilePromptDataDocument, options);
        }
export type UserProfilePromptDataQueryHookResult = ReturnType<typeof useUserProfilePromptDataQuery>;
export type UserProfilePromptDataLazyQueryHookResult = ReturnType<typeof useUserProfilePromptDataLazyQuery>;
export type UserProfilePromptDataSuspenseQueryHookResult = ReturnType<typeof useUserProfilePromptDataSuspenseQuery>;
export type UserProfilePromptDataQueryResult = ApolloReactCommon.QueryResult<UserProfilePromptDataQuery, UserProfilePromptDataQueryVariables>;
export const UserRecipesDataDocument = gql`
    query UserRecipesData {
  userRecipesData {
    id
    title
    source
    photo
    prepTime
    servings
    difficulty
    calories
    protein
    carbs
    fat
    fiber
    description
    prepSteps
    benefits
    coachNote
  }
}
    `;

/**
 * __useUserRecipesDataQuery__
 *
 * To run a query within a React component, call `useUserRecipesDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserRecipesDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserRecipesDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserRecipesDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UserRecipesDataQuery, UserRecipesDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UserRecipesDataQuery, UserRecipesDataQueryVariables>(UserRecipesDataDocument, options);
      }
export function useUserRecipesDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UserRecipesDataQuery, UserRecipesDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UserRecipesDataQuery, UserRecipesDataQueryVariables>(UserRecipesDataDocument, options);
        }
// @ts-ignore
export function useUserRecipesDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<UserRecipesDataQuery, UserRecipesDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserRecipesDataQuery, UserRecipesDataQueryVariables>;
export function useUserRecipesDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserRecipesDataQuery, UserRecipesDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<UserRecipesDataQuery | undefined, UserRecipesDataQueryVariables>;
export function useUserRecipesDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<UserRecipesDataQuery, UserRecipesDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<UserRecipesDataQuery, UserRecipesDataQueryVariables>(UserRecipesDataDocument, options);
        }
export type UserRecipesDataQueryHookResult = ReturnType<typeof useUserRecipesDataQuery>;
export type UserRecipesDataLazyQueryHookResult = ReturnType<typeof useUserRecipesDataLazyQuery>;
export type UserRecipesDataSuspenseQueryHookResult = ReturnType<typeof useUserRecipesDataSuspenseQuery>;
export type UserRecipesDataQueryResult = ApolloReactCommon.QueryResult<UserRecipesDataQuery, UserRecipesDataQueryVariables>;