import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");

    const primaryEmail =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress;

    const phoneNumber =
      user.primaryPhoneNumber?.phoneNumber ??
      user.phoneNumbers[0]?.phoneNumber ??
      null;

    if (!primaryEmail) {
      throw new Error("Clerk user does not have an email address.");
    }

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        email: primaryEmail,
        phoneNumber,
        name: name || null,
        imageUrl: user.imageUrl,
      },
    });
    return newUser;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error checking user:", error.message);
    } else {
      console.error("Unknown error checking user:", error);
    }

    return null;
  }
};
