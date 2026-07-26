import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Canada247 collects, uses, and protects your information.',
};

const EFFECTIVE_DATE = 'July 26, 2026';
const CONTACT_EMAIL = 'info@canada247.com';

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate={EFFECTIVE_DATE}
      intro={`Canada247 ("Canada247", "we", "us", or "our") operates the Canada247 website (canada247.news) and the Canada247 mobile application (together, the "Service"). This Privacy Policy explains what information we collect, how we use it, and the choices you have.`}
    >
      <LegalSection title="1. Information We Collect">
        <p>
          <strong className="text-[#1a1a1a] dark:text-white">Account information.</strong> When you sign in, we
          collect your email address and use a one-time verification code (OTP) to confirm it — we never store a
          password. You may optionally add a display name, a short bio, and a profile photo.
        </p>
        <p>
          <strong className="text-[#1a1a1a] dark:text-white">Content you submit.</strong> Community news posts you
          create (headline, body text, category, and any image), comments, likes/dislikes, reposts, and saved
          articles.
        </p>
        <p>
          <strong className="text-[#1a1a1a] dark:text-white">Preferences.</strong> The Canadian region(s) you
          follow, and which news alert categories you&apos;ve enabled.
        </p>
        <p>
          <strong className="text-[#1a1a1a] dark:text-white">Notification data.</strong> If you enable push
          notifications, we store a device push token and platform (iOS/Android) so we can deliver alerts to your
          device.
        </p>
        <p>
          <strong className="text-[#1a1a1a] dark:text-white">Automatically collected data.</strong> Like most
          online services, our servers log standard technical information such as IP address and device/browser
          type for security and troubleshooting.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>
          We use the information above to: authenticate your account; show you news relevant to the regions and
          categories you follow; let you save, react to, comment on, and post content; deliver the notifications
          you&apos;ve opted into; moderate community-submitted posts before they&apos;re published; and maintain
          and improve the Service.
        </p>
      </LegalSection>

      <LegalSection title="3. How We Share Information">
        <p>We do not sell your personal information. We share data only with:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>
            Service providers that help us operate the Service (e.g., Expo&apos;s push notification service, which
            relays notification content to your device using the push token you registered; our
            hosting/infrastructure providers).
          </li>
          <li>Legal authorities, if required to comply with a law, regulation, or valid legal process.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Data Retention">
        <p>
          We keep your account information for as long as your account is active. If you ask us to delete your
          account, we delete or anonymize your personal data within a reasonable time, except where we&apos;re
          required to retain it for legal reasons.
        </p>
      </LegalSection>

      <LegalSection title="5. Your Rights &amp; Choices">
        <p>
          You can review or update your display name, bio, and avatar from your profile. You can turn individual
          notification categories on or off, or disable notifications entirely, at any time. To request access to,
          correction of, or deletion of your personal data, email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-canadaRed hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="6. Children's Privacy">
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect personal information
          from children under 13. If you believe a child has provided us with personal information, contact us and
          we will remove it.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We use reasonable technical and organizational measures to protect your information. No method of
          transmission or storage is 100% secure, so we can&apos;t guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies &amp; Local Storage">
        <p>
          Our website uses browser local storage to remember your preferences (such as dark mode and saved region
          selections) and to keep you signed in. We do not currently use third-party advertising or tracking
          cookies.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. If we make material changes, we&apos;ll update the
          effective date above.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact Us">
        <p>
          Questions about this policy? Email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-canadaRed hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
