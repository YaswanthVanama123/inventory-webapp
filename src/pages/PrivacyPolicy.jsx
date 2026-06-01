import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  PrinterIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

const SECTIONS = [
  { id: 'overview', title: '1. Overview' },
  { id: 'scope', title: '2. Scope' },
  { id: 'information-we-collect', title: '3. Information We Collect' },
  { id: 'how-we-use', title: '4. How We Use Information' },
  { id: 'sharing', title: '5. Sharing & Disclosure' },
  { id: 'retention', title: '6. Data Retention' },
  { id: 'security', title: '7. Security' },
  { id: 'your-rights', title: '8. Your Privacy Rights' },
  { id: 'california', title: '9. California Residents (CCPA/CPRA)' },
  { id: 'other-states', title: '10. Other U.S. State Rights' },
  { id: 'children', title: "11. Children's Privacy" },
  { id: 'cookies', title: '12. Cookies & Tracking' },
  { id: 'do-not-track', title: '13. Do Not Track' },
  { id: 'international', title: '14. International Users' },
  { id: 'changes', title: '15. Changes to This Policy' },
  { id: 'contact', title: '16. Contact Us' },
];

const PrivacyPolicy = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [showTopButton, setShowTopButton] = useState(false);
  const lastUpdated = useMemo(
    () =>
      new Date('2026-05-26').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

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
            <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm">Privacy Policy</span>
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
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Privacy Notice — United States
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
              This policy explains what information the Inventory Management
              System (the &ldquo;Service&rdquo;) collects, how it&rsquo;s used,
              and the rights you have over your information under U.S. privacy
              laws.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-gray-500 pt-2">
              <span>
                <strong className="text-slate-700 dark:text-gray-300">Last updated:</strong>{' '}
                {lastUpdated}
              </span>
              <span>
                <strong className="text-slate-700 dark:text-gray-300">Effective:</strong>{' '}
                {lastUpdated}
              </span>
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
            <Section id="overview" title="1. Overview">
              <p>
                Enviromaster (&ldquo;<strong>we</strong>,&rdquo; &ldquo;
                <strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>
                &rdquo;) operates the Inventory Management System available at{' '}
                <span className="whitespace-nowrap">inventory.enviromasternva.com</span>{' '}
                and through related mobile applications (collectively, the
                &ldquo;Service&rdquo;). The Service is a business application
                used by authorized personnel to manage inventory, purchase
                orders, sales invoices, and related operations.
              </p>
              <p>
                We respect your privacy and are committed to handling personal
                information responsibly and in accordance with applicable U.S.
                federal and state privacy laws, including the California
                Consumer Privacy Act (CCPA) as amended by the California
                Privacy Rights Act (CPRA), the Virginia Consumer Data
                Protection Act (VCDPA), the Colorado Privacy Act (CPA), the
                Connecticut Data Privacy Act (CTDPA), the Utah Consumer Privacy
                Act (UCPA), and other applicable state privacy laws.
              </p>
            </Section>

            <Section id="scope" title="2. Scope">
              <p>
                This policy applies to information we collect about authorized
                users of the Service (typically employees, contractors, and
                administrators of Enviromaster) and visitors to our public
                pages. It does not cover information collected by third-party
                services, websites, or applications that are linked to but not
                operated by us.
              </p>
            </Section>

            <Section id="information-we-collect" title="3. Information We Collect">
              <p>We collect the following categories of information:</p>
              <SubHeading>Account &amp; Identity Information</SubHeading>
              <ul>
                <li>Username, full name, email address, and assigned role.</li>
                <li>Encrypted password and authentication tokens.</li>
                <li>
                  Truck or route assignment, employee ID, and other
                  work-related identifiers.
                </li>
              </ul>
              <SubHeading>Activity &amp; Usage Information</SubHeading>
              <ul>
                <li>
                  Inventory transactions you create, view, edit, or delete
                  (purchase orders, sales invoices, stock movements, truck
                  checkouts, discrepancy reports).
                </li>
                <li>
                  Audit-log records describing actions taken in the Service,
                  including timestamps, IP address, browser, operating system,
                  and device type.
                </li>
                <li>Login and logout events.</li>
              </ul>
              <SubHeading>Technical Information</SubHeading>
              <ul>
                <li>
                  Browser version, screen size, language, and similar
                  diagnostic data needed to render the Service correctly.
                </li>
                <li>
                  Approximate geographic location derived from your IP address
                  (used solely for security and abuse prevention).
                </li>
              </ul>
              <SubHeading>Information You Provide Voluntarily</SubHeading>
              <ul>
                <li>
                  Notes, comments, and other free-text content you enter into
                  the Service.
                </li>
                <li>Support requests or feedback you submit to us.</li>
              </ul>
              <p className="mt-4">
                <strong>We do not collect</strong> Social Security numbers,
                payment card information from end users, biometric identifiers,
                or precise GPS location.
              </p>
            </Section>

            <Section id="how-we-use" title="4. How We Use Information">
              <ul>
                <li>To authenticate users and provide access to the Service.</li>
                <li>
                  To operate, maintain, and improve the Service&rsquo;s
                  features.
                </li>
                <li>
                  To keep an audit trail of inventory and order activity for
                  internal accountability and regulatory recordkeeping.
                </li>
                <li>
                  To investigate and prevent fraud, unauthorized access, or
                  abuse of the Service.
                </li>
                <li>
                  To respond to inquiries, support requests, and legal
                  obligations.
                </li>
              </ul>
              <p>
                We do <strong>not</strong> sell personal information, share it
                for cross-context behavioral advertising, or use it for
                automated decision-making that produces legal effects.
              </p>
            </Section>

            <Section id="sharing" title="5. Sharing & Disclosure">
              <p>We share information only as described below:</p>
              <ul>
                <li>
                  <strong>Service providers.</strong> We use vetted third-party
                  vendors that help us operate the Service&mdash;cloud hosting
                  (DigitalOcean), database hosting (MongoDB Atlas), email
                  delivery, image hosting, error monitoring, and similar
                  back-office tooling. These providers are contractually
                  required to use your information only to perform services
                  for us.
                </li>
                <li>
                  <strong>Business systems.</strong> The Service integrates
                  with operational systems used by Enviromaster (for example
                  RouteStar, CustomerConnect, and QuickBooks). Inventory and
                  invoice data is exchanged with those systems as part of
                  normal business operation.
                </li>
                <li>
                  <strong>Legal &amp; safety.</strong> We may disclose
                  information when required by law, court order, or legitimate
                  legal process, or where we reasonably believe disclosure is
                  necessary to protect rights, safety, or property.
                </li>
                <li>
                  <strong>Business transfers.</strong> In the event of a
                  merger, acquisition, financing, or sale of assets, your
                  information may be transferred as part of that transaction
                  subject to standard confidentiality protections.
                </li>
              </ul>
              <p>
                We do not sell or rent personal information to advertisers or
                data brokers.
              </p>
            </Section>

            <Section id="retention" title="6. Data Retention">
              <p>
                We retain personal information only as long as is reasonably
                necessary to provide the Service, comply with our legal
                obligations, resolve disputes, and enforce our agreements.
                Audit logs and activity records are retained for the period
                required by Enviromaster&rsquo;s recordkeeping policies, which
                may be longer than the underlying account record. When data is
                no longer needed, it is securely deleted or anonymized.
              </p>
            </Section>

            <Section id="security" title="7. Security">
              <p>
                We use administrative, technical, and physical safeguards
                designed to protect personal information against unauthorized
                access, alteration, disclosure, or destruction. These include
                encrypted transport (TLS), encrypted password storage,
                role-based access controls, screen-level permissions, audit
                logging, and least-privilege access for service operators.
              </p>
              <p>
                No method of transmission over the internet or electronic
                storage is 100% secure, and we cannot guarantee absolute
                security.
              </p>
            </Section>

            <Section id="your-rights" title="8. Your Privacy Rights">
              <p>
                Depending on where you reside, you may have rights to:
              </p>
              <ul>
                <li>
                  <strong>Know &amp; access:</strong> request confirmation that
                  we process information about you and obtain a copy of that
                  information.
                </li>
                <li>
                  <strong>Correct:</strong> request that we correct inaccurate
                  information.
                </li>
                <li>
                  <strong>Delete:</strong> request that we delete personal
                  information about you, subject to legal exceptions.
                </li>
                <li>
                  <strong>Opt out of sale &amp; sharing:</strong> we do not
                  sell or share personal information for cross-context
                  behavioral advertising; this right is automatically honored.
                </li>
                <li>
                  <strong>Non-discrimination:</strong> we will not deny you
                  access to the Service for exercising these rights.
                </li>
              </ul>
              <p>
                To exercise any of these rights, contact us using the
                information in Section 16. We will verify your identity before
                fulfilling a rights request, typically by confirming
                information already on file with your account.
              </p>
            </Section>

            <Section id="california" title="9. California Residents (CCPA/CPRA)">
              <p>
                If you are a California resident, you have the rights described
                above and the following additional rights:
              </p>
              <ul>
                <li>
                  <strong>Right to know</strong> the categories and specific
                  pieces of personal information we have collected about you,
                  the categories of sources, the business or commercial purpose
                  for collection, and the categories of third parties with whom
                  we share it.
                </li>
                <li>
                  <strong>Right to limit</strong> the use of sensitive personal
                  information. The Service does not use sensitive personal
                  information for purposes that would trigger this right.
                </li>
                <li>
                  <strong>Right to opt out of sale or sharing.</strong> We do
                  not sell or share personal information as those terms are
                  defined under the CCPA/CPRA.
                </li>
                <li>
                  <strong>Authorized agents.</strong> You may designate an
                  authorized agent to make a request on your behalf. We will
                  require written authorization and verification of your
                  identity.
                </li>
              </ul>
              <p>
                <strong>Notice of financial incentives:</strong> We do not
                offer financial incentives in exchange for personal
                information.
              </p>
            </Section>

            <Section id="other-states" title="10. Other U.S. State Rights">
              <p>
                Residents of Virginia, Colorado, Connecticut, Utah, and other
                states with comprehensive consumer privacy laws have rights
                that are substantially similar to those described above,
                including the right to access, correct, delete, and obtain a
                portable copy of their personal data, and to opt out of certain
                processing activities. To exercise these rights, contact us
                using the information in Section 16.
              </p>
              <p>
                If we deny a rights request, you may appeal that decision by
                replying to our response. We will inform you of any action
                taken on your appeal and the reasons for the decision within
                the period required by applicable law.
              </p>
            </Section>

            <Section id="children" title="11. Children's Privacy">
              <p>
                The Service is not directed to children under the age of 13,
                and we do not knowingly collect personal information from
                children under 13 in violation of the Children&rsquo;s Online
                Privacy Protection Act (COPPA). If we learn that we have
                collected such information, we will promptly delete it. If you
                believe a child has provided us personal information, please
                contact us using the information in Section 16.
              </p>
            </Section>

            <Section id="cookies" title="12. Cookies & Tracking">
              <p>
                The Service uses a small number of strictly necessary cookies
                and similar technologies to keep you signed in, remember
                interface preferences (such as light/dark mode), and protect
                against cross-site request forgery. We do not use third-party
                advertising cookies or cross-site tracking technologies.
              </p>
              <p>
                You may control cookies through your browser settings, but
                disabling strictly necessary cookies will prevent the Service
                from functioning.
              </p>
            </Section>

            <Section id="do-not-track" title="13. Do Not Track">
              <p>
                Some browsers transmit a &ldquo;Do Not Track&rdquo; (DNT)
                signal. Because there is no industry consensus on how to
                interpret DNT, the Service does not respond to DNT signals.
                Regardless of DNT, we do not track you across third-party
                websites or services for advertising purposes.
              </p>
            </Section>

            <Section id="international" title="14. International Users">
              <p>
                The Service is operated from the United States and is intended
                for use within the United States. If you access the Service
                from outside the U.S., your information will be transferred to,
                stored, and processed in the United States, where data
                protection laws may differ from those of your country. By using
                the Service you consent to that transfer.
              </p>
            </Section>

            <Section id="changes" title="15. Changes to This Policy">
              <p>
                We may update this policy from time to time to reflect changes
                in our practices or for legal, operational, or regulatory
                reasons. The &ldquo;Last updated&rdquo; date at the top of this
                page indicates when the most recent revision was published.
                Material changes will be communicated through the Service or
                by email when appropriate. Continued use of the Service after
                an update means you accept the revised policy.
              </p>
            </Section>

            <Section id="contact" title="16. Contact Us">
              <p>
                If you have questions, concerns, or want to exercise any of
                your privacy rights, please contact us:
              </p>
              <div className="not-prose mt-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <p className="text-sm text-slate-700 dark:text-gray-300">
                  <strong className="block text-slate-900 dark:text-white mb-1">
                    Enviromaster
                  </strong>
                  Attn: Privacy Officer
                  <br />
                  Email:{' '}
                  <a
                    href="mailto:privacy@enviromasternva.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    privacy@enviromasternva.com
                  </a>
                  <br />
                  Web:{' '}
                  <a
                    href="https://inventory.enviromasternva.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    inventory.enviromasternva.com
                  </a>
                </p>
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-500 mt-4">
                We will respond to verifiable requests within the time
                periods required by applicable law (typically within 45 days,
                with the option to extend by an additional 45 days when
                reasonably necessary, with notice to you).
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
            <a
              href="mailto:privacy@enviromasternva.com"
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

export default PrivacyPolicy;
