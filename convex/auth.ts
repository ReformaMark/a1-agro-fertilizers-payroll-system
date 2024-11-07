import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      role: "employee",
      firstName: params.firstName as string,
      middleName: params.middleName as string | undefined,
      lastName: params.lastName as string,
      dateOfBirth: params.dateOfBirth as string,
      gender: params.gender as "male" | "female",
      maritalStatus: params.maritalStatus as "single" | "married" | "widowed" | "divorced" | "separated",
      contactType: params.contactType as "mobile" | "landline",
      contactNumber: params.contactNumber as string,
      isArchived: false,
    }
  }
})

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [CustomPassword],
});