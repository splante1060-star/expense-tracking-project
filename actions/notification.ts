"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { recordBillPayment } from "@/lib/record-bill-payment";
import { success } from "zod";

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
    include: {
      bill: {
        include: {
          account: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return notifications.map((notification) => ({
    ...notification,

    bill: notification.bill
      ? {
          ...notification.bill,
          amount: notification.bill.amount.toNumber(),

          account: notification.bill.account
            ? {
                ...notification.bill.account,
                balance: notification.bill.account.balance.toNumber(),
              }
            : null,
        }
      : null,
  }));
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

export async function confirmBillPayment(notificationId: string) {
  const user = await getCurrentUser();

  const notification = await db.notification.findFirst({
    where: {
      id: notificationId,
      userId: user.id,
      isDismissed: false,
      type: "ACTION_REQUIRED",
    },
    include: {
      bill: true,
    },
  });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (!notification.bill || !notification.billId) {
    throw new Error("Bill not found.");
  }

  if (!notification.bill.accountId) {
    throw new Error("This bill does not have an account selected.");
  }

  if (!notification.scheduledFor) {
    throw new Error("Scheduled payment date not found.");
  }

  if (
    notification.bill.dueDate.getTime() !== notification.scheduledFor.getTime()
  ) {
    throw new Error(
      "This bill has changed since the notification was created.",
    );
  }

  await recordBillPayment({
    billId: notification.bill.id,
    accountId: notification.bill.accountId,
    userId: user.id,
    source: "MANUAL",
  });

  await db.notification.update({
    where: {
      id: notification.id,
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
