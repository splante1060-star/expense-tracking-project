"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, CircleAlert, Info, X } from "lucide-react";

import {
  getNotifications,
  clearNotifications,
  markNotificationsAsRead,
  confirmBillPayment,
} from "@/actions/notification";
import BillPaymentConfirmation from "@/components/bill-payment-confirmation";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

export default function NotificationBell() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotificationIds, setNewNotificationIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const newCount = newNotificationIds.size;

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();
        setNotifications(data);

        const hasUnread = data.some((notification) => !notification.isRead);

        if (hasUnread) {
          setIsPulsing(true);

          setTimeout(() => {
            setIsPulsing(false);
          }, 6000);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleBellClick() {
    setIsPulsing(false);

    if (isOpen) {
      setIsOpen(false);
      setNewNotificationIds(new Set());
      return;
    }

    const unreadIds = notifications
      .filter((notification) => !notification.isRead)
      .map((notification) => notification.id);

    setNewNotificationIds(new Set(unreadIds));
    setIsOpen(true);

    if (unreadIds.length > 0) {
      try {
        await markNotificationsAsRead();

        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            isRead: true,
          })),
        );
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  }

  function handleNotificationClick(notification: Notification) {
    setIsOpen(false);
    setNewNotificationIds(new Set());

    if (notification.type === "ACTION_REQUIRED" && notification.bill) {
      setSelectedNotification(notification);
      return;
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  }

  async function handleClearNotifications() {
    try {
      await clearNotifications();

      setNotifications([]);
      setNewNotificationIds(new Set());
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setNewNotificationIds(new Set());
  }

  async function handleConfirmPayment() {
    if (!selectedNotification) {
      return;
    }

    setIsConfirmingPayment(true);

    try {
      await confirmBillPayment(selectedNotification.id);

      setNotifications((current) =>
        current.filter(
          (notification) => notification.id !== selectedNotification.id,
        ),
      );

      setSelectedNotification(null);

      router.refresh();
    } catch (error) {
      console.error("Failed to confirm bill payment:", error);
    } finally {
      setIsConfirmingPayment(false);
    }
  }

  return (
    <>
      <div ref={containerRef} className="relative">
        <div ref={containerRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={handleBellClick}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
          >
            <Bell size={19} strokeWidth={1.8} />

            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center">
                {isPulsing && (
                  <span className="absolute h-3 w-3 animate-ping rounded-full bg-(--pocket-purple) opacity-30" />
                )}

                <span className="relative h-2 w-2 rounded-full bg-(--pocket-purple)" />
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Notifications
                  </h2>

                  {newCount > 0 && (
                    <p className="text-xs text-slate-500">{newCount} new</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearNotifications}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-(--pocket-blue) transition-colors hover:bg-(--pocket-blue-light)"
                    >
                      <CheckCheck size={12} />
                      Clear all
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="mx-auto mb-2 text-slate-300" />

                    <p className="text-sm font-medium text-slate-700">
                      You&apos;re all caught up
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      New Pocket updates will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const isNew = newNotificationIds.has(notification.id);

                    const Icon =
                      notification.type === "SUCCESS"
                        ? Check
                        : notification.type === "ACTION_REQUIRED"
                          ? CircleAlert
                          : Info;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50 ${
                          isNew ? "bg-(--pocket-blue-light)" : "bg-white"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            notification.type === "SUCCESS"
                              ? "bg-(--pocket-green-light) text-(--pocket-green-dark)"
                              : notification.type === "ACTION_REQUIRED"
                                ? "bg-(--pocket-orange-light) text-(--pocket-orange-dark)"
                                : "bg-(--pocket-blue-light) text-(--pocket-blue)"
                          }`}
                        >
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {notification.title}
                            </p>

                            {isNew && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-(--pocket-purple)" />
                            )}
                          </div>

                          <p className="mt-0.5 text-xs leading-5 text-slate-600">
                            {notification.message}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedNotification?.bill && (
        <BillPaymentConfirmation
          isOpen={true}
          billName={selectedNotification.bill.name}
          amount={Number(selectedNotification.bill.amount)}
          dueDate={
            selectedNotification.scheduledFor ??
            selectedNotification.bill.dueDate
          }
          accountName={
            selectedNotification.bill.account?.name ?? "No account selected"
          }
          isProcessing={isConfirmingPayment}
          onConfirm={handleConfirmPayment}
          onClose={() => {
            setSelectedNotification(null);
          }}
        />
      )}
    </>
  );
}
