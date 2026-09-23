"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

export async function getNotifications() {
  const user = await getCurrentUser();

  const notifications = await db.notification.findMany({
    where: {
      userId: user.id,
      isDismissed: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return notifications;
}

export async function markNotificationsAsRead() {
  const user = await getCurrentUser();

  await db.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
      isDismissed: false,
    },
    data: {
      isRead: true,
    },
  });

  return {
    success: true,
  };
}

export async function clearNotifications() {
  const user = await getCurrentUser();

  await db.notification.updateMany({
    where: {
      userId: user.id,
      isDismissed: false,
    },
    data: {
      isRead: true,
      isDismissed: true,
    },
  });

  return {
    success: true,
  };
}
