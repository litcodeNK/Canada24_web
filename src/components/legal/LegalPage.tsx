import { AppShell } from '@/components/layout/AppShell';

export function LegalPage({
  title,
  effectiveDate,
  intro,
  children,
}: {
  title: string;
  effectiveDate: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#1a1a1a] dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6">
          Effective {effectiveDate}
        </p>
        <p className="text-[15px] leading-relaxed text-gray-700 dark:text-[#CCC] mb-8">
          {intro}
        </p>
        <div className="flex flex-col gap-8">
          {children}
        </div>
      </div>
    </AppShell>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-sans font-bold text-lg text-[#1a1a1a] dark:text-white mb-2 pb-2 border-b border-gray-300 dark:border-[#2A2A2A]">
        {title}
      </h2>
      <div className="text-[14.5px] leading-relaxed text-gray-700 dark:text-[#CCC] flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}
