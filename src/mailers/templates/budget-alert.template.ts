import { getBaseEmailTemplate } from "./base.template";

export const getBudgetAlertEmailTemplate = (params: {
  username: string;
  alerts: Array<{ message: string; type: "category" | "overall" }>;
  month: number;
  year: number;
  totalBudget: number;
  spent: number;
}) => {
  const { username, alerts, month, year, totalBudget, spent } = params;

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  const alertsHtml = alerts
    .map((alert) => {
      const icon = alert.type === "overall" ? "⚠️" : "📊";
      const bgColor = alert.type === "overall" ? "#fee2e2" : "#fef3c7";
      const textColor = alert.type === "overall" ? "#991b1b" : "#92400e";
      const borderColor = alert.type === "overall" ? "#fca5a5" : "#fcd34d";

      return `
        <div style="
          margin-bottom:12px;
          padding:12px 16px;
          background:${bgColor};
          border-left:4px solid ${borderColor};
          border-radius:4px;
        ">
          <p style="margin:0;font-size:14px;color:${textColor};font-weight:600;">
            ${icon} ${alert.type === "overall" ? "Overall Budget Alert" : "Category Alert"}
          </p>
          <p style="margin:4px 0 0;font-size:13px;color:${textColor};">
            ${alert.message}
          </p>
        </div>
      `;
    })
    .join("");

  const contentRowsHtml = `
    <p style="margin:0 0 16px;font-size:16px;color:#222;">
      Hi ${username},
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
      We wanted to notify you that your budget has exceeded its limits for ${monthName} ${year}.
    </p>

    <div style="
      padding:16px;
      background:#f9fafb;
      border:1px solid #e5e7eb;
      border-radius:8px;
      margin-bottom:20px;
    ">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111;">
        📈 Budget Summary
      </p>
      <div style="font-size:13px;color:#666;line-height:1.8;">
        <p style="margin:0;"><strong>Total Budget:</strong> $${totalBudget.toFixed(2)}</p>
        <p style="margin:0;"><strong>Amount Spent:</strong> $${spent.toFixed(2)}</p>
        <p style="margin:0;"><strong>Overage:</strong> <span style="color:#dc2626;font-weight:600;">$${(spent - totalBudget).toFixed(2)}</span></p>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111;">
        🔔 Alerts
      </p>
      ${alertsHtml}
    </div>

    <p style="margin:0 0 16px;font-size:14px;color:#666;line-height:1.6;">
      Please review your spending and adjust your budget limits or expenses accordingly.
    </p>

    <p style="margin:0;font-size:13px;color:#999;">
      Log in to VoiceyBill to view detailed breakdown by category and make adjustments.
    </p>
  `;

  return getBaseEmailTemplate({
    title: `Budget Alert for ${monthName} ${year}`,
    headerTitle: "Budget Alert",
    headerSubtitle: "Review your spending",
    headerLabel: "Alert",
    contentRowsHtml,
  });
};
