import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import api from "../libs/api";

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This year", value: "year" },
];

const PIE_COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#8b5cf6"];

const EMPTY_ANALYTICS = {
  summary: {
    total_revenue: 0,
    retail_revenue: 0,
    wholesale_revenue: 0,
    total_orders: 0,
    average_order_value: 0,
    total_profit: 0,
    retail_profit: 0,
    wholesale_profit: 0,
    profit_margin: 0,
    revenue_change: null,
  },
  revenue_by_date: [],
  profit_by_date: [],
  sales_mix: [],
  top_products: [],
  order_volume_by_date: [],
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value || 0));

function useScreenSize() {
  const [screen, setScreen] = useState(() => ({
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
    isSmallMobile:
      typeof window !== "undefined" ? window.innerWidth < 480 : false,
  }));

  useEffect(() => {
    const handleResize = () => {
      setScreen({
        isMobile: window.innerWidth < 768,
        isSmallMobile: window.innerWidth < 480,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screen;
}

function MetricCard({ label, value, icon, helper, change, tone, isMobile }) {
  const hasChange = change !== null && change !== undefined;
  const isPositive = Number(change) >= 0;

  return (
    <article
      style={{
        ...styles.metricCard,
        ...(isMobile ? styles.metricCardMobile : {}),
      }}
    >
      <div style={styles.metricTopRow}>
        <div style={{ minWidth: 0 }}>
          <p style={styles.metricLabel}>{label}</p>
          <strong
            style={{
              ...styles.metricValue,
              ...(isMobile ? styles.metricValueMobile : {}),
            }}
          >
            {value}
          </strong>
        </div>

        <div
          style={{
            ...styles.metricIcon,
            ...tone,
            ...(isMobile ? styles.metricIconMobile : {}),
          }}
        >
          {icon}
        </div>
      </div>

      {hasChange ? (
        <div style={styles.metricFooter}>
          <span
            style={{
              ...styles.changeBadge,
              ...(isPositive ? styles.changePositive : styles.changeNegative),
            }}
          >
            {isPositive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {Math.abs(Number(change)).toFixed(1)}%
          </span>

          <span style={styles.metricHelper}>vs previous period</span>
        </div>
      ) : (
        <span style={styles.metricHelper}>{helper}</span>
      )}
    </article>
  );
}

function EmptyChart({ message }) {
  return (
    <div style={styles.emptyChart}>
      <BarChart3 size={34} />
      <span>{message}</span>
    </div>
  );
}

export default function Dashboard() {
  const { isMobile, isSmallMobile } = useScreenSize();

  const [range, setRange] = useState("30d");
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `sales/dashboard/analytics/?range=${range}`,
        );

        const data = response.data || {};

        if (!isMounted) return;

        setAnalytics({
          summary: {
            ...EMPTY_ANALYTICS.summary,
            ...(data.summary || {}),
          },
          revenue_by_date: data.revenue_by_date || [],
          profit_by_date: data.profit_by_date || [],
          sales_mix: data.sales_mix || [],
          top_products: data.top_products || [],
          order_volume_by_date: data.order_volume_by_date || [],
        });
      } catch (requestError) {
        console.error("Could not load dashboard analytics:", requestError);

        if (isMounted) {
          setAnalytics(EMPTY_ANALYTICS);
          setError(
            "Analytics are not available yet. Please check the dashboard API endpoint.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [range]);

  const summary = analytics.summary;

  const revenueTrend = useMemo(
    () =>
      analytics.revenue_by_date.map((item) => ({
        date: item.date || item.label,
        retail: Number(item.retail_revenue ?? item.retail ?? 0),
        wholesale: Number(item.wholesale_revenue ?? item.wholesale ?? 0),
      })),
    [analytics.revenue_by_date],
  );

  const profitTrend = useMemo(
    () =>
      analytics.profit_by_date.map((item) => ({
        date: item.date || item.label,
        retail_profit: Number(item.retail_profit ?? 0),
        wholesale_profit: Number(item.wholesale_profit ?? 0),
      })),
    [analytics.profit_by_date],
  );

  const fallbackSalesMix = useMemo(
    () =>
      [
        {
          name: "Retail",
          value: Number(summary.retail_revenue || 0),
        },
        {
          name: "Wholesale",
          value: Number(summary.wholesale_revenue || 0),
        },
      ].filter((item) => item.value > 0),
    [summary.retail_revenue, summary.wholesale_revenue],
  );

  const salesMix = useMemo(() => {
    const apiMix = analytics.sales_mix
      .map((item) => ({
        name: item.sale_type || item.order_type || item.name || "Other",
        value: Number(item.revenue || item.total_revenue || item.value || 0),
      }))
      .filter((item) => item.value > 0);

    return apiMix.length > 0 ? apiMix : fallbackSalesMix;
  }, [analytics.sales_mix, fallbackSalesMix]);

  const topProducts = useMemo(
    () =>
      analytics.top_products.map((item) => ({
        name: item.product_name || item.name || item.sku || "Unknown product",
        revenue: Number(item.total_revenue || item.revenue || 0),
      })),
    [analytics.top_products],
  );

  const orderVolume = useMemo(
    () =>
      analytics.order_volume_by_date.map((item) => ({
        date: item.date || item.label,
        orders: Number(item.order_count || item.orders || 0),
      })),
    [analytics.order_volume_by_date],
  );

  const chartMargin = isMobile
    ? { top: 8, right: 4, left: -28, bottom: 0 }
    : { top: 8, right: 8, left: -16, bottom: 0 };

  const topProductMargin = isMobile
    ? { top: 0, right: 6, left: 8, bottom: 0 }
    : { top: 0, right: 12, left: 28, bottom: 0 };

  const chartHeight = isSmallMobile ? "230px" : isMobile ? "260px" : "320px";

  return (
    <main
      style={{
        ...styles.page,
        ...(isMobile ? styles.pageMobile : {}),
      }}
    >
      <header
        style={{
          ...styles.header,
          ...(isMobile ? styles.headerMobile : {}),
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={styles.eyebrow}>Business performance</p>

          <h1
            style={{
              ...styles.title,
              ...(isMobile ? styles.titleMobile : {}),
            }}
          >
            Sales dashboard
          </h1>

          <p
            style={{
              ...styles.subtitle,
              ...(isMobile ? styles.subtitleMobile : {}),
            }}
          >
            Follow retail and wholesale revenue, gross profit, product
            performance, and daily sales activity.
          </p>
        </div>

        <label
          style={{
            ...styles.rangeControl,
            ...(isMobile ? styles.rangeControlMobile : {}),
          }}
        >
          <CalendarDays size={17} />

          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            style={styles.rangeSelect}
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <section
        style={{
          ...styles.metricsGrid,
          ...(isMobile ? styles.metricsGridMobile : {}),
        }}
      >
        <MetricCard
          label="Total sales"
          value={formatMoney(summary.total_revenue)}
          icon={<CircleDollarSign size={isMobile ? 20 : 22} />}
          change={summary.revenue_change}
          helper="All retail and wholesale revenue"
          tone={styles.blueIcon}
          isMobile={isMobile}
        />

        <MetricCard
          label="Retail sales"
          value={formatMoney(summary.retail_revenue)}
          icon={<Store size={isMobile ? 20 : 22} />}
          helper="Direct customer purchases"
          tone={styles.tealIcon}
          isMobile={isMobile}
        />

        <MetricCard
          label="Wholesale sales"
          value={formatMoney(summary.wholesale_revenue)}
          icon={<ShoppingBag size={isMobile ? 20 : 22} />}
          helper="Bulk and reseller purchases"
          tone={styles.amberIcon}
          isMobile={isMobile}
        />

        <MetricCard
          label="Gross profit"
          value={formatMoney(summary.total_profit)}
          icon={<TrendingUp size={isMobile ? 20 : 22} />}
          helper={`${Number(summary.profit_margin || 0).toFixed(
            1,
          )}% profit margin`}
          tone={styles.profitIcon}
          isMobile={isMobile}
        />

        <MetricCard
          label="Average order value"
          value={formatMoney(summary.average_order_value)}
          icon={<Package size={isMobile ? 20 : 22} />}
          helper={`${formatNumber(summary.total_orders)} completed orders`}
          tone={styles.violetIcon}
          isMobile={isMobile}
        />
      </section>

      <section
        style={{
          ...styles.primaryGrid,
          ...(isMobile ? styles.singleColumnGrid : {}),
        }}
      >
        <article
          style={{
            ...styles.chartCard,
            ...(isMobile ? styles.chartCardMobile : {}),
          }}
        >
          <div
            style={{
              ...styles.chartHeader,
              ...(isSmallMobile ? styles.chartHeaderMobile : {}),
            }}
          >
            <div>
              <h2 style={styles.chartTitle}>Revenue trend</h2>
              <p style={styles.chartDescription}>
                Daily retail and wholesale revenue over time.
              </p>
            </div>

            {!isSmallMobile && <span style={styles.tag}>Time series</span>}
          </div>

          <div style={{ ...styles.largeChartArea, height: chartHeight }}>
            {loading ? (
              <div style={styles.loadingText}>Loading revenue trend...</div>
            ) : revenueTrend.length === 0 ? (
              <EmptyChart message="No revenue data for this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend} margin={chartMargin}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={isMobile ? 24 : 12}
                    tick={{
                      fill: "#64748b",
                      fontSize: isMobile ? 10 : 12,
                    }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 42 : 56}
                    tick={{
                      fill: "#64748b",
                      fontSize: isMobile ? 10 : 12,
                    }}
                    tickFormatter={(value) =>
                      isMobile ? `$${value}` : formatMoney(value)
                    }
                  />

                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                    contentStyle={styles.tooltipStyle}
                  />

                  <Legend
                    verticalAlign="top"
                    align={isMobile ? "center" : "right"}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: isMobile ? "11px" : "12px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="retail"
                    name="Retail"
                    stroke="#2563eb"
                    strokeWidth={isMobile ? 2.5 : 3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="wholesale"
                    name="Wholesale"
                    stroke="#0f766e"
                    strokeWidth={isMobile ? 2.5 : 3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article
          style={{
            ...styles.chartCard,
            ...(isMobile ? styles.chartCardMobile : {}),
          }}
        >
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>Sales mix</h2>
              <p style={styles.chartDescription}>Revenue share by sale type.</p>
            </div>
          </div>

          <div style={{ ...styles.pieChartArea, height: chartHeight }}>
            {loading ? (
              <div style={styles.loadingText}>Loading sales mix...</div>
            ) : salesMix.length === 0 ? (
              <EmptyChart message="No retail or wholesale mix available." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isMobile ? 52 : 62}
                    outerRadius={isMobile ? 76 : 88}
                    paddingAngle={4}
                  >
                    {salesMix.map((item, index) => (
                      <Cell
                        key={`${item.name}-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                    contentStyle={styles.tooltipStyle}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: isMobile ? "11px" : "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section style={styles.profitGrid}>
        <article
          style={{
            ...styles.chartCard,
            ...(isMobile ? styles.chartCardMobile : {}),
          }}
        >
          <div
            style={{
              ...styles.chartHeader,
              ...(isSmallMobile ? styles.chartHeaderMobile : {}),
            }}
          >
            <div>
              <h2 style={styles.chartTitle}>Gross profit trend</h2>
              <p style={styles.chartDescription}>
                Daily gross profit from retail and wholesale sales.
              </p>
            </div>

            {!isSmallMobile && (
              <span style={styles.profitTag}>Profit analysis</span>
            )}
          </div>

          <div style={{ ...styles.largeChartArea, height: chartHeight }}>
            {loading ? (
              <div style={styles.loadingText}>Loading profit trend...</div>
            ) : profitTrend.length === 0 ? (
              <EmptyChart message="No profit data available for this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitTrend} margin={chartMargin}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={isMobile ? 24 : 12}
                    tick={{
                      fill: "#64748b",
                      fontSize: isMobile ? 10 : 12,
                    }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 42 : 56}
                    tick={{
                      fill: "#64748b",
                      fontSize: isMobile ? 10 : 12,
                    }}
                    tickFormatter={(value) =>
                      isMobile ? `$${value}` : formatMoney(value)
                    }
                  />

                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                    contentStyle={styles.tooltipStyle}
                  />

                  <Legend
                    verticalAlign="top"
                    align={isMobile ? "center" : "right"}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: isMobile ? "11px" : "12px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="retail_profit"
                    name="Retail profit"
                    stroke="#7c3aed"
                    strokeWidth={isMobile ? 2.5 : 3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="wholesale_profit"
                    name="Wholesale profit"
                    stroke="#16a34a"
                    strokeWidth={isMobile ? 2.5 : 3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section
        style={{
          ...styles.secondaryGrid,
          ...(isMobile ? styles.singleColumnGrid : {}),
        }}
      >
        <article
          style={{
            ...styles.chartCard,
            ...(isMobile ? styles.chartCardMobile : {}),
          }}
        >
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>Top products by revenue</h2>
              <p style={styles.chartDescription}>
                Products with the strongest sales value.
              </p>
            </div>
          </div>

          <div
            style={{
              ...styles.mediumChartArea,
              height: isSmallMobile ? "260px" : isMobile ? "280px" : "285px",
            }}
          >
            {loading ? (
              <div style={styles.loadingText}>Loading products...</div>
            ) : topProducts.length === 0 ? (
              <EmptyChart message="No product ranking available." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts.slice(0, isMobile ? 5 : 8)}
                  layout="vertical"
                  margin={topProductMargin}
                >
                  <CartesianGrid horizontal={false} stroke="#e2e8f0" />

                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: isMobile ? 10 : 12,
                    }}
                    tickFormatter={(value) =>
                      isMobile ? `$${value}` : formatMoney(value)
                    }
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 78 : 110}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#475569",
                      fontSize: isMobile ? 10 : 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                    contentStyle={styles.tooltipStyle}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#2563eb"
                    radius={[0, 7, 7, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article
          style={{
            ...styles.chartCard,
            ...(isMobile ? styles.chartCardMobile : {}),
          }}
        >
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>Order volume</h2>
              <p style={styles.chartDescription}>
                Number of completed orders per day.
              </p>
            </div>
          </div>

          <div
            style={{
              ...styles.mediumChartArea,
              height: isSmallMobile ? "250px" : isMobile ? "270px" : "285px",
            }}
          >
            {loading ? (
              <div style={styles.loadingText}>Loading order volume...</div>
            ) : orderVolume.length === 0 ? (
              <EmptyChart message="No order-volume data for this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderVolume} margin={chartMargin}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={isMobile ? 24 : 12}
                    tick={{
                      fill: "#64748b",
                      fontSize: isMobile ? 10 : 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 30 : 40}
                    tick={{
                      fill: "#64748b",
                      fontSize: isMobile ? 10 : 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value) => formatNumber(value)}
                    contentStyle={styles.tooltipStyle}
                  />

                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill="#0f766e"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section
        style={{
          ...styles.insightCard,
          ...(isMobile ? styles.insightCardMobile : {}),
        }}
      >
        <Package
          size={isMobile ? 20 : 21}
          color="#2563eb"
          style={{ flexShrink: 0 }}
        />

        <div>
          <strong style={styles.insightTitle}>
            Why profit analysis matters
          </strong>

          <p style={styles.insightText}>
            Revenue shows how much you sold, while gross profit shows how much
            money remains after product cost. This helps you compare whether
            retail or wholesale sales are more profitable.
          </p>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100%",
    boxSizing: "border-box",
    padding: "32px",
    background: "#f6f8fc",
    color: "#0f172a",
  },

  pageMobile: {
    padding: "16px",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "26px",
  },

  headerMobile: {
    gap: "16px",
    marginBottom: "20px",
  },

  eyebrow: {
    margin: 0,
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  title: {
    margin: "6px 0 0",
    fontSize: "31px",
    letterSpacing: "-0.8px",
  },

  titleMobile: {
    fontSize: "25px",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "8px 0 0",
    maxWidth: "680px",
    color: "#64748b",
    lineHeight: 1.55,
  },

  subtitleMobile: {
    fontSize: "14px",
  },

  rangeControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 13px",
    border: "1px solid #dbe3ef",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#475569",
  },

  rangeControlMobile: {
    width: "100%",
    boxSizing: "border-box",
    justifyContent: "center",
  },

  rangeSelect: {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#0f172a",
    fontWeight: "700",
    cursor: "pointer",
  },

  errorBanner: {
    marginBottom: "18px",
    padding: "13px 15px",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "14px",
    lineHeight: 1.45,
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  metricsGridMobile: {
    gridTemplateColumns: "1fr",
    gap: "12px",
  },

  metricCard: {
    minHeight: "142px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "19px",
    border: "1px solid #e5eaf2",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.035)",
  },

  metricCardMobile: {
    minHeight: "120px",
    padding: "16px",
  },

  metricTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },

  metricLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "700",
  },

  metricValue: {
    display: "block",
    marginTop: "8px",
    fontSize: "25px",
    letterSpacing: "-0.5px",
    overflowWrap: "anywhere",
  },

  metricValueMobile: {
    fontSize: "22px",
  },

  metricIcon: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "13px",
  },

  metricIconMobile: {
    width: "38px",
    height: "38px",
  },

  blueIcon: {
    background: "#dbeafe",
    color: "#2563eb",
  },

  tealIcon: {
    background: "#ccfbf1",
    color: "#0f766e",
  },

  amberIcon: {
    background: "#fef3c7",
    color: "#b45309",
  },

  violetIcon: {
    background: "#ede9fe",
    color: "#7c3aed",
  },

  profitIcon: {
    background: "#dcfce7",
    color: "#15803d",
  },

  metricFooter: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "17px",
  },

  changeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    padding: "4px 7px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
  },

  changePositive: {
    background: "#dcfce7",
    color: "#15803d",
  },

  changeNegative: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  metricHelper: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  primaryGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.8fr) minmax(300px, 0.9fr)",
    gap: "18px",
    marginBottom: "18px",
  },

  profitGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "18px",
    marginBottom: "18px",
  },

  secondaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  singleColumnGrid: {
    gridTemplateColumns: "1fr",
    gap: "14px",
  },

  chartCard: {
    minWidth: 0,
    padding: "21px",
    border: "1px solid #e5eaf2",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.035)",
  },

  chartCardMobile: {
    padding: "16px",
    borderRadius: "15px",
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
  },

  chartHeaderMobile: {
    flexDirection: "column",
  },

  chartTitle: {
    margin: 0,
    fontSize: "17px",
  },

  chartDescription: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  tag: {
    alignSelf: "flex-start",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  profitTag: {
    alignSelf: "flex-start",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#f3e8ff",
    color: "#7c3aed",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  largeChartArea: {
    height: "320px",
  },

  pieChartArea: {
    height: "320px",
  },

  mediumChartArea: {
    height: "285px",
  },

  loadingText: {
    height: "100%",
    display: "grid",
    placeItems: "center",
    color: "#64748b",
    fontSize: "14px",
    textAlign: "center",
  },

  emptyChart: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#94a3b8",
    fontSize: "13px",
    textAlign: "center",
  },

  tooltipStyle: {
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
  },

  insightCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginTop: "18px",
    padding: "18px",
    border: "1px solid #bfdbfe",
    borderRadius: "16px",
    background: "#eff6ff",
  },

  insightCardMobile: {
    marginTop: "14px",
    padding: "16px",
  },

  insightTitle: {
    color: "#1e3a8a",
    fontSize: "14px",
  },

  insightText: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.55,
  },
};
