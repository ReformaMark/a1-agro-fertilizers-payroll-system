/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as benefits from "../benefits.js";
import type * as cashAdvance from "../cashAdvance.js";
import type * as compensation from "../compensation.js";
import type * as contributionTables from "../contributionTables.js";
import type * as holidays from "../holidays.js";
import type * as http from "../http.js";
import type * as leaves from "../leaves.js";
import type * as loans from "../loans.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  auth: typeof auth;
  benefits: typeof benefits;
  cashAdvance: typeof cashAdvance;
  compensation: typeof compensation;
  contributionTables: typeof contributionTables;
  holidays: typeof holidays;
  http: typeof http;
  leaves: typeof leaves;
  loans: typeof loans;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
