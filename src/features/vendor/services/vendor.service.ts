import { vendorApi } from "@/features/vendor/api/vendor.api";

export const vendorService = {
  // ── Core ─────────────────────────────────────────────────────────────────
  getProfile:     vendorApi.getProfile,
  updateProfile:  vendorApi.updateProfile,
  getSetupState:  vendorApi.getSetupState,
  submitSetup:    vendorApi.submitSetup,
  getDashboard:   vendorApi.getDashboard,

  // ── Payout / PIN ─────────────────────────────────────────────────────────
  savePayout:  vendorApi.savePayout,
  setPin:      vendorApi.setPin,
  verifyPin:   vendorApi.verifyPin,

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalyticsSummary:    vendorApi.getAnalyticsSummary,
  getRevenueChart:        vendorApi.getRevenueChart,
  getOrderChart:          vendorApi.getOrderChart,
  getProductChart:        vendorApi.getProductChart,
  getTopCategories:       vendorApi.getTopCategories,
  getPaymentDistribution: vendorApi.getPaymentDistribution,
  getCustomerBehavior:    vendorApi.getCustomerBehavior,
  getEarnings:            vendorApi.getEarnings,

  // ── Products ─────────────────────────────────────────────────────────────
  getProducts:          vendorApi.getProducts,
  filterProducts:       vendorApi.filterProducts,
  getLowStockProducts:  vendorApi.getLowStockProducts,
  getTopSellingProducts: vendorApi.getTopSellingProducts,
  createProduct:        vendorApi.createProduct,
  updateProduct:        vendorApi.updateProduct,
  deleteProduct:        vendorApi.deleteProduct,

  // ── Orders ───────────────────────────────────────────────────────────────
  getOrders:           vendorApi.getOrders,
  getOrder:            vendorApi.getOrder,
  getOrderStatusCounts: vendorApi.getOrderStatusCounts,
  updateOrderStatus:   vendorApi.updateOrderStatus,

  // ── Reviews / Coupons ────────────────────────────────────────────────────
  getReviews: vendorApi.getReviews,
  getReview:  vendorApi.getReview,
  getCoupons: vendorApi.getCoupons,
};

