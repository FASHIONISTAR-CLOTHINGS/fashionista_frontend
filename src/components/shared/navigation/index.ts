/**
 * Canonical navigation component barrel — Fashionistar FSD
 *
 * NewNavbar          → desktop sticky header (logo + search + cart + account)
 * NewMobileNav       → mobile slide-out drawer (hamburger)
 * MobileBottomTabBar → mobile bottom tab bar MC10 (Home/Shop/Measure/Cart/Account)
 *
 * Legacy Navbar.tsx + MobileNavBar.tsx have been merged into the
 * New* files and deleted.
 */

export { default as NewNavbar } from "./NewNavbar";
export { default as NewMobileNav } from "./NewMobileNav";
export { MobileBottomTabBar } from "./MobileBottomTabBar";
