import { join } from "node:path";
import { readCsvObjects, num, round } from "./csv.mjs";

/**
 * Builds every retail aggregate from data/*.csv using exactly the conventions
 * in sql/02_analysis_queries.sql. The returned tables are the single source of
 * truth for the workbook and for verify-data.mjs.
 */
export function computeAll(projectDir) {
  const customerRows = readCsvObjects(join(projectDir, "data", "customers.csv"));
  const productRows = readCsvObjects(join(projectDir, "data", "products.csv"));
  const orderRows = readCsvObjects(join(projectDir, "data", "orders.csv"));

  const orders = orderRows.map((o) => {
    const quantity = num(o.quantity);
    const unitPrice = num(o.unit_price);
    return {
      orderId: o.order_id,
      orderDate: o.order_date,
      customerId: o.customer_id,
      region: o.region,
      productId: o.product_id,
      productName: o.product_name,
      category: o.category,
      quantity,
      unitPrice,
      revenue: quantity * unitPrice,
    };
  });

  // ---------------------------------------------------------------------
  // Q1 KPI summary
  // ---------------------------------------------------------------------
  const orderIds = new Set(orders.map((o) => o.orderId));
  const orderingCustomerIds = new Set(orders.map((o) => o.customerId));
  const totalRevenue = orders.reduce((sum, o) => sum + o.revenue, 0);
  const totalUnits = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalOrders = orderIds.size;
  const uniqueCustomers = orderingCustomerIds.size;

  const kpi = {
    total_revenue: totalRevenue,
    total_orders: totalOrders,
    unique_customers: uniqueCustomers,
    units_sold: totalUnits,
    avg_order_value: totalOrders ? round(totalRevenue / totalOrders, 2) : 0,
  };

  // ---------------------------------------------------------------------
  // Shared maps
  // ---------------------------------------------------------------------
  const monthlyMap = new Map();
  const categoryMap = new Map();
  const productMap = new Map();
  const regionMap = new Map();
  const customerMap = new Map();
  const quarterMap = new Map();

  for (const o of orders) {
    const month = o.orderDate.slice(0, 7);
    const m = monthlyMap.get(month) ?? { month, revenue: 0, orderIds: new Set() };
    m.revenue += o.revenue;
    m.orderIds.add(o.orderId);
    monthlyMap.set(month, m);

    const c = categoryMap.get(o.category) ?? { category: o.category, revenue: 0, units_sold: 0 };
    c.revenue += o.revenue;
    c.units_sold += o.quantity;
    categoryMap.set(o.category, c);

    const pKey = `${o.productName}|${o.category}`;
    const p = productMap.get(pKey) ?? {
      productName: o.productName,
      category: o.category,
      units_sold: 0,
      revenue: 0,
    };
    p.units_sold += o.quantity;
    p.revenue += o.revenue;
    productMap.set(pKey, p);

    const r = regionMap.get(o.region) ?? {
      region: o.region,
      revenue: 0,
      customerIds: new Set(),
    };
    r.revenue += o.revenue;
    r.customerIds.add(o.customerId);
    regionMap.set(o.region, r);

    const cu = customerMap.get(o.customerId) ?? {
      customerId: o.customerId,
      region: o.region,
      orderIds: new Set(),
      revenue: 0,
    };
    cu.orderIds.add(o.orderId);
    cu.revenue += o.revenue;
    customerMap.set(o.customerId, cu);

    const year = o.orderDate.slice(0, 4);
    const monthNumber = Number.parseInt(o.orderDate.slice(5, 7), 10);
    const quarter = `${year}-Q${Math.floor((monthNumber - 1) / 3) + 1}`;
    const q = quarterMap.get(quarter) ?? { quarter, revenue: 0, orderIds: new Set() };
    q.revenue += o.revenue;
    q.orderIds.add(o.orderId);
    quarterMap.set(quarter, q);
  }

  // ---------------------------------------------------------------------
  // Q2 Monthly revenue (and Q4 MoM, which SQL derives from the same CTE)
  // ---------------------------------------------------------------------
  const monthlyRevenue = [...monthlyMap.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ month: m.month, revenue: m.revenue, orders: m.orderIds.size }));

  const momGrowth = monthlyRevenue.map((m, i) => ({
    ...m,
    mom_change_pct:
      i === 0
        ? null
        : round(((m.revenue - monthlyRevenue[i - 1].revenue) * 100) / monthlyRevenue[i - 1].revenue, 1),
  }));

  // ---------------------------------------------------------------------
  // Q3 YoY growth (2025 vs 2024, joined on the month suffix)
  // ---------------------------------------------------------------------
  const monthIndex = new Map(monthlyRevenue.map((m) => [m.month, m]));
  const yoyGrowth = monthlyRevenue
    .filter((m) => m.month.startsWith("2025-"))
    .map((m) => {
      const prev = monthIndex.get(`2024-${m.month.slice(5)}`);
      return {
        month_2025: m.month,
        revenue_2025: m.revenue,
        revenue_2024: prev ? prev.revenue : 0,
        yoy_change_pct: prev
          ? round(((m.revenue - prev.revenue) * 100) / prev.revenue, 1)
          : null,
      };
    });

  // ---------------------------------------------------------------------
  // Q5 Category revenue
  // ---------------------------------------------------------------------
  const categoryRevenue = [...categoryMap.values()].sort((a, b) => b.revenue - a.revenue);

  // ---------------------------------------------------------------------
  // Q6 Top 10 products
  // ---------------------------------------------------------------------
  const topProducts = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((p) => ({
      product_name: p.productName,
      category: p.category,
      units_sold: p.units_sold,
      revenue: p.revenue,
    }));

  // ---------------------------------------------------------------------
  // Q7 Region revenue
  // ---------------------------------------------------------------------
  const regionRevenue = [...regionMap.values()]
    .map((r) => ({
      region: r.region,
      revenue: r.revenue,
      unique_customers: r.customerIds.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ---------------------------------------------------------------------
  // Q8 Top 10 customers (JOIN customers, region taken from orders)
  // ---------------------------------------------------------------------
  const customerNames = new Map(customerRows.map((c) => [c.customer_id, c.customer_name]));
  const topCustomers = [...customerMap.values()]
    .map((c) => ({
      customer_id: c.customerId,
      customer_name: customerNames.get(c.customerId) ?? c.customerId,
      region: c.region,
      revenue: c.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ---------------------------------------------------------------------
  // Q9 Repeat vs one-time
  // ---------------------------------------------------------------------
  const repeatCustomers = [...customerMap.values()].filter((c) => c.orderIds.size > 1);
  const oneTimeCustomers = [...customerMap.values()].filter((c) => c.orderIds.size === 1);
  const repeatRevenue = repeatCustomers.reduce((sum, c) => sum + c.revenue, 0);
  const oneTimeRevenue = oneTimeCustomers.reduce((sum, c) => sum + c.revenue, 0);

  const repeatVsOnetime = [
    {
      customer_type: "Repeat",
      customers: repeatCustomers.length,
      pct_of_base: round((repeatCustomers.length * 100) / uniqueCustomers, 1),
      revenue: repeatRevenue,
    },
    {
      customer_type: "One-time",
      customers: oneTimeCustomers.length,
      pct_of_base: round((oneTimeCustomers.length * 100) / uniqueCustomers, 1),
      revenue: oneTimeRevenue,
    },
  ];

  // ---------------------------------------------------------------------
  // Q10 Category x region matrix
  // ---------------------------------------------------------------------
  const MATRIX_CATEGORIES = ["Electronics", "Apparel", "Home & Kitchen", "Beauty", "Sports"];
  const categoryRegionMatrix = [...regionMap.values()]
    .map((r) => {
      const row = { region: r.region, total_revenue: 0 };
      for (const category of MATRIX_CATEGORIES) row[category] = 0;
      return row;
    })
    .sort((a, b) => a.region.localeCompare(b.region));

  const matrixByRegion = new Map(categoryRegionMatrix.map((r) => [r.region, r]));
  for (const o of orders) {
    const row = matrixByRegion.get(o.region);
    row[o.category] += o.revenue;
    row.total_revenue += o.revenue;
  }
  categoryRegionMatrix.sort((a, b) => b.total_revenue - a.total_revenue);

  // ---------------------------------------------------------------------
  // Q11 Best quarters
  // ---------------------------------------------------------------------
  const bestQuarters = [...quarterMap.values()]
    .map((q) => ({
      quarter: q.quarter,
      avg_order_value: q.orderIds.size ? round(q.revenue / q.orderIds.size, 0) : 0,
      revenue: q.revenue,
      orders: q.orderIds.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ---------------------------------------------------------------------
  // Workbook-only tables (pivot-ready)
  // ---------------------------------------------------------------------
  const customerTable = customerRows
    .map((c) => {
      const agg = customerMap.get(c.customer_id);
      const orderCount = agg ? agg.orderIds.size : 0;
      const revenue = agg ? agg.revenue : 0;
      return {
        customer_id: c.customer_id,
        customer_name: c.customer_name,
        region: c.region,
        signup_date: c.signup_date,
        orders: orderCount,
        revenue,
        customer_type: orderCount === 0 ? "No orders" : orderCount === 1 ? "One-time" : "Repeat",
      };
    })
    .sort((a, b) => b.revenue - a.revenue || a.customer_name.localeCompare(b.customer_name));

  const productTable = productRows
    .map((p) => {
      const agg = productMap.get(`${p.product_name}|${p.category}`);
      return {
        product_id: p.product_id,
        product_name: p.product_name,
        category: p.category,
        unit_price: num(p.unit_price),
        units_sold: agg ? agg.units_sold : 0,
        revenue: agg ? agg.revenue : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue || a.product_name.localeCompare(b.product_name));

  // ---------------------------------------------------------------------
  // Extended metrics used by the percentage dashboard
  // ---------------------------------------------------------------------
  const revenue2024 = monthlyRevenue
    .filter((m) => m.month.startsWith("2024-"))
    .reduce((sum, m) => sum + m.revenue, 0);
  const revenue2025 = monthlyRevenue
    .filter((m) => m.month.startsWith("2025-"))
    .reduce((sum, m) => sum + m.revenue, 0);

  const top10ProductRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
  const top10CustomerRevenue = topCustomers.reduce((sum, c) => sum + c.revenue, 0);
  const apparel = categoryRevenue.find((c) => c.category === "Apparel");
  const electronics = categoryRevenue.find((c) => c.category === "Electronics");
  const north = regionRevenue.find((r) => r.region === "North");
  const west = regionRevenue.find((r) => r.region === "West");

  const peakMonth = monthlyRevenue.reduce((best, m) => (m.revenue > best.revenue ? m : best), monthlyRevenue[0]);
  const lowMonth = monthlyRevenue.reduce((worst, m) => (m.revenue < worst.revenue ? m : worst), monthlyRevenue[0]);

  const extended = {
    revenue2024,
    revenue2025,
    yoyGrowth: revenue2024 ? (revenue2025 - revenue2024) / revenue2024 : 0,
    top10ProductRevenue,
    top10ProductShare: top10ProductRevenue / totalRevenue,
    top10CustomerRevenue,
    top10CustomerShare: top10CustomerRevenue / totalRevenue,
    repeatCustomers: repeatCustomers.length,
    repeatCustomerShare: repeatCustomers.length / uniqueCustomers,
    repeatRevenue,
    repeatRevenueShare: repeatRevenue / totalRevenue,
    oneTimeRevenue,
    oneTimeRevenueShare: oneTimeRevenue / totalRevenue,
    apparelShare: apparel ? apparel.revenue / totalRevenue : 0,
    electronicsShare: electronics ? electronics.revenue / totalRevenue : 0,
    northWestShare: north && west ? (north.revenue + west.revenue) / totalRevenue : 0,
    avgRevenuePerCustomer: totalRevenue / uniqueCustomers,
    avgUnitsPerOrder: totalUnits / totalOrders,
    avgUnitPrice: totalRevenue / totalUnits,
    months: monthlyRevenue.length,
    productCount: productRows.length,
    categoryCount: categoryRevenue.length,
    regionCount: regionRevenue.length,
    peakMonth,
    lowMonth,
    bestQuarter: bestQuarters[0],
    topProduct: topProducts[0],
    topCustomer: topCustomers[0],
  };

  const totals = {
    revenue: totalRevenue,
    orders: totalOrders,
    customers: uniqueCustomers,
    customerRecords: customerRows.length,
    units: totalUnits,
    lineItems: orders.length,
    months: monthlyRevenue.length,
    products: productRows.length,
    categories: categoryRevenue.length,
    regions: regionRevenue.length,
    revenue2024,
    revenue2025,
  };

  return {
    kpi,
    totals,
    extended,
    orders,
    monthlyRevenue,
    momGrowth,
    yoyGrowth,
    categoryRevenue,
    topProducts,
    regionRevenue,
    topCustomers,
    repeatVsOnetime,
    categoryRegionMatrix,
    bestQuarters,
    customerTable,
    productTable,
  };
}
