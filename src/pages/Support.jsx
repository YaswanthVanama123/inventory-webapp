import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LifebuoyIcon,
  ArrowLeftIcon,
  PrinterIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const SUPPORT_EMAIL = 'support@enviromasternva.com';
const SUPPORT_WEB = 'inventory.enviromasternva.com';

const SECTIONS = [
  { id: 'getting-help', title: '1. Getting Help' },
  { id: 'contact', title: '2. Contact Support' },
  { id: 'hours', title: '3. Hours & Response Times' },
  { id: 'faq', title: '4. Frequently Asked Questions' },
  { id: 'account', title: '5. Account, Login & Password' },
  { id: 'troubleshooting', title: '6. Troubleshooting' },
  { id: 'data', title: '7. Data, Privacy & Deletion' },
  { id: 'feedback', title: '8. Feedback & Requests' },
];

const Support = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.target.offsetTop - b.target.offsetTop);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 1] }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTopButton(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-gray-200">
      {}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-slate-200 dark:border-gray-800 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <LifebuoyIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm">Support</span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            title="Print or save as PDF"
          >
            <PrinterIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </header>

      {}
      <section className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col items-start gap-4 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
              <LifebuoyIcon className="w-3.5 h-3.5" />
              Help & Support Center
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              How can we help?
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
              Support for the Inventory Management System (the
              &ldquo;Service&rdquo;) and its web, iPad, and mobile apps. Find
              answers to common questions below, or reach our team directly and
              we&rsquo;ll get back to you.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4" />
                Email Support
              </a>
              <a
                href={`https://${SUPPORT_WEB}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              >
                <GlobeAltIcon className="w-4 h-4" />
                Open the App
              </a>
            </div>
          </div>
        </div>
      </section>

      {}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-12">
          {}
          <aside className="lg:sticky lg:top-20 lg:self-start print:hidden">
            <nav aria-label="Table of contents" className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-3">
                On this page
              </p>
              {SECTIONS.map((s) => {
                const active = activeId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left text-sm py-1.5 px-3 rounded-md border-l-2 transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {s.title}
                  </button>
                );
              })}
            </nav>
          </aside>

          {}
          <article className="prose-policy max-w-none">
            <Section id="getting-help" title="1. Getting Help">
              <p>
                The Inventory Management System is a business application used
                by authorized personnel of Enviromaster to manage inventory,
                purchase orders, sales invoices, truck checkouts, and related
                operations across web, iPad, and mobile.
              </p>
              <p>
                Most questions are answered in the{' '}
                <button
                  type="button"
                  onClick={() => scrollTo('faq')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Frequently Asked Questions
                </button>{' '}
                below. If you still need help, the fastest way to reach us is by
                email&mdash;see{' '}
                <button
                  type="button"
                  onClick={() => scrollTo('contact')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Contact Support
                </button>
                .
              </p>
            </Section>

            <Section id="contact" title="2. Contact Support">
              <p>
                Our support team is here to help with login issues, app
                problems, data questions, and account requests.
              </p>
              <div className="not-prose mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white">
                    <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-sm">Email</span>
                  </div>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">
                    Best for most issues. Include your username, the device you
                    were using, and a short description of the problem.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white">
                    <GlobeAltIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-sm">Web</span>
                  </div>
                  <a
                    href={`https://${SUPPORT_WEB}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {SUPPORT_WEB}
                  </a>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">
                    Sign in to the Service from any browser. Employees can also
                    reach their account administrator for account changes.
                  </p>
                </div>
              </div>
            </Section>

            <Section id="hours" title="3. Hours & Response Times">
              <div className="not-prose mb-4 flex items-start gap-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="text-sm text-slate-700 dark:text-gray-300">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Monday &ndash; Friday, 8:00 AM &ndash; 5:00 PM (Eastern Time)
                  </p>
                  <p className="mt-1">
                    We aim to respond to email requests within one business day.
                    Urgent issues affecting your ability to work are
                    prioritized.
                  </p>
                </div>
              </div>
              <p>
                Requests received on weekends or U.S. holidays are answered the
                next business day.
              </p>
            </Section>

            <Section id="faq" title="4. Frequently Asked Questions">
              <SubHeading>How do I get an account?</SubHeading>
              <p>
                Accounts are created and managed by your organization&rsquo;s
                administrator. If you don&rsquo;t have access yet, contact your
                administrator or email us at{' '}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>

              <SubHeading>I forgot my password. What do I do?</SubHeading>
              <p>
                Use the &ldquo;Forgot password?&rdquo; link on the sign-in
                screen, or ask your administrator to reset it. For security, we
                cannot send passwords by email.
              </p>

              <SubHeading>The app won&rsquo;t load or sign me in.</SubHeading>
              <p>
                Check your internet connection, make sure you have the latest
                version installed, then fully close and reopen the app. If the
                problem continues, email us with your username and device model
                and we&rsquo;ll investigate.
              </p>

              <SubHeading>
                Is my data the same on web, iPad, and mobile?
              </SubHeading>
              <p>
                Yes. The apps share one workspace, so inventory, orders,
                invoices, and truck checkouts stay in sync across every device.
              </p>

              <SubHeading>How do I report incorrect data?</SubHeading>
              <p>
                Email us a description and, if possible, the order or invoice
                number involved. See{' '}
                <button
                  type="button"
                  onClick={() => scrollTo('troubleshooting')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Troubleshooting
                </button>{' '}
                for what to include.
              </p>
            </Section>

            <Section id="account" title="5. Account, Login & Password">
              <ul>
                <li>
                  <strong>Sign in:</strong> Use the username and password
                  provided by your administrator. Choose the correct role
                  (Administrator or Employee) on the sign-in screen.
                </li>
                <li>
                  <strong>Password resets:</strong> Available through your
                  administrator or the &ldquo;Forgot password?&rdquo; link.
                </li>
                <li>
                  <strong>Role or permission changes:</strong> Managed by your
                  administrator. Contact them to adjust which screens and
                  actions you can access.
                </li>
                <li>
                  <strong>Locked out?</strong> Repeated failed sign-ins may
                  temporarily lock an account. Wait a few minutes and try again,
                  or contact support.
                </li>
              </ul>
            </Section>

            <Section id="troubleshooting" title="6. Troubleshooting">
              <p>
                Before contacting us, these steps resolve most issues:
              </p>
              <ul>
                <li>Confirm you have a stable internet connection.</li>
                <li>
                  Update to the latest version of the app from the App Store.
                </li>
                <li>Fully close the app and reopen it; then sign in again.</li>
                <li>
                  If a page looks wrong, pull down to refresh or restart the
                  app.
                </li>
              </ul>
              <p className="mt-4">
                When emailing support, please include:
              </p>
              <ul>
                <li>Your username (never your password).</li>
                <li>
                  Device and OS version (for example, &ldquo;iPad Pro,
                  iPadOS 18&rdquo;).
                </li>
                <li>The app version, if known.</li>
                <li>
                  What you were doing, what you expected, and what happened
                  (a screenshot helps).
                </li>
              </ul>
            </Section>

            <Section id="data" title="7. Data, Privacy & Deletion">
              <p>
                We handle your information responsibly and in accordance with
                applicable U.S. privacy laws. For full details on what we
                collect and your rights, see our policies:
              </p>
              <div className="not-prose mt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/privacy-policy"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  Privacy Policy
                </Link>
                <Link
                  to="/delete-account"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                  Delete My Account
                </Link>
              </div>
              <p className="mt-4">
                To request a copy of your data, corrections, or deletion of your
                account, email{' '}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
                . We verify your identity before fulfilling any request.
              </p>
            </Section>

            <Section id="feedback" title="8. Feedback & Requests">
              <p>
                We&rsquo;re always improving the Service. To suggest a feature,
                report a bug, or share feedback, email{' '}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>{' '}
                with &ldquo;Feedback&rdquo; in the subject line. We read every
                message.
              </p>
            </Section>
          </article>
        </div>
      </div>

      {}
      <footer className="border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Enviromaster. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/privacy-policy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>

      {}
      {showTopButton && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all print:hidden"
          aria-label="Back to top"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24 mb-10">
    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-gray-800">
      {title}
    </h2>
    <div className="space-y-4 text-[15px] leading-relaxed text-slate-700 dark:text-gray-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-3 [&_strong]:text-slate-900 dark:[&_strong]:text-white">
      {children}
    </div>
  </section>
);

const SubHeading = ({ children }) => (
  <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-5 mb-2">
    {children}
  </h3>
);

export default Support;
