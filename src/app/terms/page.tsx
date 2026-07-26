import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of Canada247.',
};

const EFFECTIVE_DATE = 'July 26, 2026';
const CONTACT_EMAIL = 'info@canada247.com';

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      effectiveDate={EFFECTIVE_DATE}
      intro={`Please read these Terms of Service ("Terms") carefully before using the Canada247 website or mobile application (together, the "Service"), operated by Canada247 ("we", "us", "our").`}
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By creating an account or using the Service, you agree to be bound by these Terms. If you don&apos;t
          agree, please don&apos;t use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. The Service">
        <p>
          Canada247 aggregates and publishes news content across Canadian regions and categories, and lets
          registered users save articles, react to and comment on stories, and submit their own community news
          posts.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts">
        <p>
          You must provide a valid email address to create an account. We use a one-time code sent to that address
          to verify sign-in — you&apos;re responsible for keeping access to that email secure. You must be at
          least 13 years old to create an account.
        </p>
      </LegalSection>

      <LegalSection title="4. User-Generated Content">
        <p>
          When you submit a community post, comment, or other content, you retain ownership of it, but you grant
          Canada247 a non-exclusive, worldwide, royalty-free license to host, display, and distribute it as part of
          the Service. Community posts are reviewed before they&apos;re published and may be approved, rejected, or
          removed at our discretion — including after publication, if they&apos;re later found to violate these
          Terms.
        </p>
        <p>
          You agree not to submit content that is illegal, defamatory, harassing, hateful, sexually explicit,
          infringes someone else&apos;s intellectual property or privacy rights, or is deliberately false or
          misleading.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>use the Service for any unlawful purpose;</li>
          <li>attempt to gain unauthorized access to any part of the Service;</li>
          <li>interfere with or disrupt the Service&apos;s operation;</li>
          <li>scrape or harvest data from the Service beyond normal personal use; or</li>
          <li>impersonate another person or entity.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Third-Party News Content">
        <p>
          Much of the news shown in the Service is aggregated from third-party publishers and sources. Canada247
          does not independently verify the accuracy of third-party content and is not responsible for it. Rights
          to that content remain with its original publishers.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <p>
          The Canada247 name, logo, and app/website design are owned by Canada247. Except for content you submit or
          third-party news content, you may not copy, modify, or redistribute any part of the Service without our
          permission.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind,
          express or implied, including that it will be accurate, uninterrupted, or error-free.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Canada247 is not liable for any indirect, incidental, or
          consequential damages arising from your use of the Service.
        </p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          We may suspend or terminate your account if you violate these Terms. You may stop using the Service, or
          request account deletion, at any time by contacting us.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Continuing to use the Service after changes take effect
          means you accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing Law">
        <p>
          These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable
          therein.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact Us">
        <p>
          Questions about these Terms? Email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-canadaRed hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
