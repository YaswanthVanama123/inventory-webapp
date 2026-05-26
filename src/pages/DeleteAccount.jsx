import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const DeleteAccount = () => {
  const lastUpdated = useMemo(
    () =>
      new Date('2026-05-26').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-gray-200">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="font-semibold text-sm">Delete Account</span>
          </div>
          <div className="w-12" />
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col items-start gap-4 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900">
              <ExclamationTriangleIcon className="w-3.5 h-3.5" />
              Permanent Action
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Delete Your Account
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
              This page explains how to permanently delete your Inventory
              Management System account and the personal data associated with
              it. Account deletion is final and cannot be undone.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-gray-500 pt-2">
              <span>
                <strong className="text-slate-700 dark:text-gray-300">Last updated:</strong>{' '}
                {lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-14 space-y-10">
        {/* Critical warning */}
        <div className="rounded-xl border-2 border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
                Before you continue
              </h2>
              <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                Deleting your account permanently removes your profile, login
                credentials, and personal data from our system. This action is{' '}
                <strong>irreversible</strong>. Once your account is deleted, we
                cannot recover it, restore your access, or retrieve any of the
                personal data attached to it.
              </p>
            </div>
          </div>
        </div>

        {/* What gets deleted */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-gray-800">
            What gets permanently deleted
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DataItem
              title="Profile information"
              description="Your username, full name, email address, role, and assigned route."
            />
            <DataItem
              title="Authentication data"
              description="Your password hash, session tokens, and remembered-device records."
            />
            <DataItem
              title="Personal preferences"
              description="Your theme settings, notification preferences, and saved filters."
            />
            <DataItem
              title="Screen permissions"
              description="Your individual screen-access grants and personal permission overrides."
            />
            <DataItem
              title="Truck checkout records"
              description="Personal truck-checkout entries, sales tallies, and checkout discrepancy reports tied to you."
            />
            <DataItem
              title="Activity & audit trails"
              description="Login history, action logs, and audit entries identifying you as the actor."
            />
          </div>
        </section>

        {/* What is retained */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-gray-800">
            What we are legally required to keep
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
            U.S. tax, accounting, and inventory recordkeeping laws require us
            to retain certain business records even after an account is
            deleted. Where this applies, we anonymize references to you (your
            name and identifiers are stripped), but the underlying transaction
            records remain:
          </p>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-gray-300 list-disc pl-6">
            <li>
              Inventory transactions, purchase orders, and sales invoices that
              passed through your account.
            </li>
            <li>
              Stock movements and quantity adjustments performed during your
              employment.
            </li>
            <li>
              Aggregate, anonymized analytics that no longer identify you
              individually.
            </li>
          </ul>
          <p className="text-sm text-slate-500 dark:text-gray-500 mt-4">
            Retention periods are governed by applicable U.S. federal and
            state law and Enviromaster's recordkeeping policy. See our{' '}
            <Link
              to="/privacy-policy"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
        </section>

        {/* Steps */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-gray-800">
            How to permanently delete your account
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Web app */}
            <MethodCard
              icon={<ComputerDesktopIcon className="w-6 h-6" />}
              title="From the Web App"
              steps={[
                <>
                  Open <strong>inventory.enviromasternva.com</strong> in your
                  browser and sign in with your account.
                </>,
                <>
                  Click your name (top-right) and select{' '}
                  <strong>Profile</strong>.
                </>,
                <>
                  In the left tab list, choose{' '}
                  <strong>Delete Account</strong>.
                </>,
                <>
                  Read the consequences carefully, then type{' '}
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-red-600 dark:text-red-400 font-mono text-xs">
                    DELETE
                  </code>{' '}
                  in the confirmation field.
                </>,
                <>
                  Click <strong>Delete My Account</strong>. You will be signed
                  out automatically.
                </>,
              ]}
            />

            {/* Mobile app */}
            <MethodCard
              icon={<DevicePhoneMobileIcon className="w-6 h-6" />}
              title="From the Mobile App"
              steps={[
                <>
                  Open the Inventory Management mobile app and sign in with
                  your account.
                </>,
                <>
                  Tap the <strong>Account</strong> tab in the bottom
                  navigation.
                </>,
                <>
                  Scroll to the bottom of the Account page.
                </>,
                <>
                  Tap <strong>Delete Account</strong>.
                </>,
                <>
                  Confirm both prompts. You will be signed out automatically.
                </>,
              ]}
            />
          </div>

          {/* Email fallback */}
          <div className="mt-6 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  Can't sign in? Request deletion by email
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-3">
                  If you cannot access your account, send a deletion request
                  from the email address registered to your account. Include
                  your username and a brief statement that you want your
                  account permanently deleted.
                </p>
                <a
                  href="mailto:privacy@enviromasternva.com?subject=Account%20Deletion%20Request"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  privacy@enviromasternva.com
                </a>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-3">
                  We verify identity before processing any email-initiated
                  deletion request to prevent unauthorized account loss.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-gray-800">
            What happens next
          </h2>
          <ol className="relative border-l-2 border-slate-200 dark:border-gray-800 ml-3 space-y-6">
            <TimelineItem
              icon={<CheckCircleIcon className="w-4 h-4" />}
              title="Immediately"
              accent="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900"
            >
              Your active sessions are signed out and your account loses
              access to the Service. Sign-in attempts will be rejected.
            </TimelineItem>
            <TimelineItem
              icon={<ClockIcon className="w-4 h-4" />}
              title="Within 30 days"
              accent="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900"
            >
              Your profile, credentials, preferences, screen permissions, and
              other personally identifying records are permanently removed
              from production systems.
            </TimelineItem>
            <TimelineItem
              icon={<ClockIcon className="w-4 h-4" />}
              title="Within 90 days"
              accent="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900"
            >
              Your personal data is purged from routine encrypted backups as
              they roll off our retention schedule. After this point no copy
              of your personally identifying information remains in our
              systems.
            </TimelineItem>
            <TimelineItem
              icon={<ExclamationTriangleIcon className="w-4 h-4" />}
              title="Indefinitely (anonymized)"
              accent="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-gray-800 border-slate-200 dark:border-gray-700"
            >
              Anonymized business transaction records (orders, invoices,
              stock movements) that we are required to keep for tax and
              recordkeeping compliance remain, but no longer reference you by
              name or any personal identifier.
            </TimelineItem>
          </ol>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-gray-800">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            <FAQ
              question="Can I undo account deletion?"
              answer="No. Account deletion is permanent. Once you confirm, we cannot recover your account, your password, or any of the personal data associated with it. If you might need access again, do not delete your account."
            />
            <FAQ
              question="Will deleting my account remove orders or invoices I created?"
              answer="No. Inventory transactions, purchase orders, and sales invoices remain in the system as anonymized business records, as required by U.S. tax and accounting regulations. Your personal identifiers are stripped from these records, but the underlying transactions remain."
            />
            <FAQ
              question="How long does deletion take?"
              answer="Sign-out and access revocation are immediate. Personal data is removed from production systems within 30 days. Encrypted backups are purged within 90 days as they roll through our normal retention schedule."
            />
            <FAQ
              question="What if I just want to stop using the app for a while?"
              answer="Deletion is permanent. If you only want a temporary break, simply sign out and stop using the app. Contact your administrator if you want your account temporarily disabled instead of deleted."
            />
            <FAQ
              question="What if I have a privacy concern after my account is deleted?"
              answer={
                <>
                  Email{' '}
                  <a
                    href="mailto:privacy@enviromasternva.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    privacy@enviromasternva.com
                  </a>
                  . We will respond within the time periods required by
                  applicable U.S. privacy laws (typically 45 days).
                </>
              }
            />
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Ready to delete your account?
              </h2>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Sign in to your account and follow the steps above. This
                action is permanent.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Sign in to delete
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-slate-700 dark:text-gray-200 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Enviromaster. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy-policy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/login"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <a
              href="mailto:privacy@enviromasternva.com"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DataItem = ({ title, description }) => (
  <div className="rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const MethodCard = ({ icon, title, steps }) => (
  <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-gray-800">
      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
    </div>
    <ol className="space-y-3">
      {steps.map((step, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-center mt-0.5">
            {idx + 1}
          </span>
          <span className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed flex-1 [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_strong]:font-semibold">
            {step}
          </span>
        </li>
      ))}
    </ol>
  </div>
);

const TimelineItem = ({ icon, title, accent, children }) => (
  <li className="ml-6">
    <span
      className={`absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full border-2 ${accent}`}
    >
      {icon}
    </span>
    <div className="ml-2">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
        {children}
      </p>
    </div>
  </li>
);

const FAQ = ({ question, answer }) => (
  <details className="group rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
    <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors">
      <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1">
        {question}
      </span>
      <span className="flex-shrink-0 text-slate-400 group-open:rotate-180 transition-transform">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </summary>
    <div className="px-4 pb-4 text-sm text-slate-600 dark:text-gray-400 leading-relaxed border-t border-slate-200 dark:border-gray-800 pt-3">
      {answer}
    </div>
  </details>
);

export default DeleteAccount;
