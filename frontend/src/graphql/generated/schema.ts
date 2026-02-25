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
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: any; output: any; }
};

export type CoachScannerSubmissionTestData = {
  __typename?: 'CoachScannerSubmissionTestData';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  payloadJson: Scalars['String']['output'];
  userEmail?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
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
  login: Scalars['String']['output'];
  logout: Scalars['Boolean']['output'];
  saveScannerCoachSubmission: Scalars['Boolean']['output'];
  signup: User;
  updateUserProfileData?: Maybe<UserProfileData>;
};


export type MutationLoginArgs = {
  data: LoginInput;
};


export type MutationSaveScannerCoachSubmissionArgs = {
  payloadJson: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  data: SignupInput;
};


export type MutationUpdateUserProfileDataArgs = {
  data: UserProfileUpdateInput;
};

export type Pathology = {
  __typename?: 'Pathology';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  coachScannerSubmissionsTestData: Array<CoachScannerSubmissionTestData>;
  coachUserMealsTestData: Array<CoachUserMealTestData>;
  me?: Maybe<User>;
  userDashboardData?: Maybe<DashboardData>;
  userEvolutionData: Array<EvolutionDataPoint>;
  userMealsData: Array<UserMealData>;
  userProfileData?: Maybe<UserProfileData>;
  userRecipesData: Array<RecipeData>;
  users: Array<User>;
};


export type QueryUserDashboardDataArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
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

export type SignupInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
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

export type LoginMutationVariables = Exact<{
  data: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: string };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type SaveScannerCoachSubmissionMutationVariables = Exact<{
  payloadJson: Scalars['String']['input'];
}>;


export type SaveScannerCoachSubmissionMutation = { __typename?: 'Mutation', saveScannerCoachSubmission: boolean };

export type SignupMutationVariables = Exact<{
  data: SignupInput;
}>;


export type SignupMutation = { __typename?: 'Mutation', signup: { __typename?: 'User', id: string, email: string, createdAt: any } };

export type UpdateUserProfileDataMutationVariables = Exact<{
  data: UserProfileUpdateInput;
}>;


export type UpdateUserProfileDataMutation = { __typename?: 'Mutation', updateUserProfileData?: { __typename?: 'UserProfileData', firstName: string, lastName: string, dateOfBirth?: string | null, gender?: string | null, height?: number | null, currentWeight?: number | null, goal?: string | null, medicalTags: Array<string> } | null };

export type ProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email: string, createdAt: any, role: UserRole } | null };

export type UserDashboardDataQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UserDashboardDataQuery = { __typename?: 'Query', userDashboardData?: { __typename?: 'DashboardData', firstName?: string | null, daysOfUse: number, healthScore: number, scannedMeals: number, averageCalories: number, targetCalories: number, targetProgress: number, targetProtein: number, targetCarbs: number, targetLipids: number, todayProtein: number, todayCarbs: number, todayFat: number, hasMoreMeals: boolean, recentMeals: Array<{ __typename?: 'DashboardMealData', name: string, calories: number, protein: number, carbs: number, fat: number }> } | null };

export type UserEvolutionDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserEvolutionDataQuery = { __typename?: 'Query', userEvolutionData: Array<{ __typename?: 'EvolutionDataPoint', week: string, weight: number, calories: number, score: number }> };

export type UserMealsDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserMealsDataQuery = { __typename?: 'Query', userMealsData: Array<{ __typename?: 'UserMealData', id: string, name: string, consumedAt: string, calories: number, protein: number, carbs: number, fat: number, aiScore: number, photo: string, aiInsights: Array<string>, coachComment: string, coachName: string }> };

export type UserProfileDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfileDataQuery = { __typename?: 'Query', userProfileData?: { __typename?: 'UserProfileData', firstName: string, lastName: string, dateOfBirth?: string | null, gender?: string | null, height?: number | null, currentWeight?: number | null, goal?: string | null, medicalTags: Array<string> } | null };

export type UserProfilePromptDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfilePromptDataQuery = { __typename?: 'Query', userProfileData?: { __typename?: 'UserProfileData', dateOfBirth?: string | null, gender?: string | null, height?: number | null, currentWeight?: number | null, medicalTags: Array<string> } | null };

export type UserRecipesDataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserRecipesDataQuery = { __typename?: 'Query', userRecipesData: Array<{ __typename?: 'RecipeData', id: string, title: string, source: string, photo: string, prepTime: string, servings: number, difficulty: string, calories: number, protein: number, carbs: number, fat: number, fiber: number, description: string, prepSteps: Array<string>, benefits: Array<string>, coachNote: string }> };


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
    query UserMealsData {
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