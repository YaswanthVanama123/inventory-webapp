import React from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  FileText,
  RefreshCw,
  Truck,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Zap,
  CheckCircle2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Boxes,
    title: 'Inventory & Stock',
    description:
      'Track every SKU across locations with real-time stock levels, low-stock alerts, and full movement history.',
    points: ['Multi-location stock', 'Low-stock alerts', 'Adjustment audit trail'],
  },
  {
    icon: FileText,
    title: 'Orders & Invoicing',
    description:
      'Manage purchase orders, invoices, and an integrated point-of-sale from a single workflow.',
    points: ['Purchase orders', 'Invoice management', 'Built-in POS'],
  },
  {
    icon: RefreshCw,
    title: 'External Sync',
    description:
      'Automated invoice and customer sync from RouteStar and CustomerConnect — no manual re-keying.',
    points: ['RouteStar invoices', 'CustomerConnect orders', 'Scheduled background sync'],
  },
  {
    icon: Truck,
    title: 'Truck Checkouts',
    description:
      'Field employees check inventory in and out of trucks with full reconciliation against sales.',
    points: ['Per-truck inventory', 'Sales reconciliation', 'Discrepancy detection'],
  },
];

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: 'Role-based access', detail: 'Admin and employee scopes' },
  { icon: BarChart3, label: 'Reports & analytics', detail: 'Sales, low-stock, exports' },
  { icon: Zap, label: 'Fast & responsive', detail: 'Web and mobile, same data' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">
              Inventory Management System
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#features"
              className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Features
            </a>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              Built for operations teams
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
              Run your inventory,{' '}
              <span className="text-blue-600">end to end.</span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-slate-600 leading-relaxed">
              One workspace for stock, purchase orders, invoices, RouteStar sync, and truck
              checkouts. Web and mobile, with the same data and the same audit trail.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-sm transition-colors"
              >
                Sign in to your workspace
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-lg transition-colors"
              >
                Explore features
              </a>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div
                    key={h.label}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-slate-200/60"
                  >
                    <Icon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{h.label}</div>
                      <div className="text-sm text-slate-600">{h.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 sm:py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Everything your team needs in one place
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Designed for the way real inventory work happens — from the warehouse floor to
              the dispatch truck to the back office.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{feature.description}</p>
                  <ul className="mt-5 space-y-2">
                    {feature.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-14 sm:px-12 sm:py-16 text-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Ready to get back to work?
              </h2>
              <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
                Sign in to your workspace to manage stock, run point of sale, and reconcile
                truck inventory in real time.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-base font-semibold text-blue-700 bg-white hover:bg-blue-50 px-6 py-3 rounded-lg shadow-sm transition-colors"
                >
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">
              Inventory Management System
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/privacy-policy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/delete-account" className="hover:text-slate-900 transition-colors">
              Delete Account
            </Link>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
