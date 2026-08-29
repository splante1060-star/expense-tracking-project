import { CalendarDays, CircleCheck } from "lucide-react";

type UpcomingBill = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  category: string;
  isAutoPay: boolean;
};

type UpcomingBillsProps = {
  bills: UpcomingBill[];
  totalBills: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function UpcomingBills({
  bills,
  totalBills,
}: UpcomingBillsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Upcoming Bills
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {formatCurrency(totalBills)} due this month
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <CalendarDays size={18} strokeWidth={1.8} />
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center">
          <p className="text-sm text-slate-500">No bills due this month.</p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-100">
          {bills.slice(0, 5).map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {bill.name}
                </p>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span>
                    {bill.dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  {bill.isAutoPay && (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CircleCheck size={12} />
                      AutoPay
                    </span>
                  )}
                </div>
              </div>

              <span className="ml-4 text-sm font-semibold text-slate-900">
                {formatCurrency(bill.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
