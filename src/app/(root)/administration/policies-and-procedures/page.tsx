import {
  ScrollText,
  GraduationCap,
  ClipboardList,
  Banknote,
  FileCheck,
  FileText,
  HelpCircle,
  BookOpen,
  Link2,
} from "lucide-react";

export default function PoliciesAndProceduresPage() {
  const faqs = [
    {
      q: "How do I apply for a certificate or diploma programme?",
      a: "Applications are completed online via the official portal. Applicants must fill the form, upload credentials, and pay the application fee before submission."
    },
    {
      q: "Can I pay school fees in installments?",
      a: "Yes. Selected programmes allow installment payments subject to approval and deadlines issued by the Directorate."
    },
    {
      q: "How long does admission processing take?",
      a: "Admission decisions are typically communicated within 2–4 weeks after application closure."
    },
    {
      q: "How do I check my admission status?",
      a: "Applicants can log into the application portal or receive notifications via registered email and SMS."
    },
    {
      q: "Can I defer my admission?",
      a: "Deferment is allowed only with valid reasons and must be approved by the Directorate in line with University policy."
    }
  ];

  return (
    <main className="bg-background text-foreground py-16">
      <div className="mx-auto max-w-5xl px-6 py-14 space-y-16">

        {/* HEADER */}
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <ScrollText className="w-4 h-4" />
            Policies & Procedures
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Operational Guidelines
          </h1>

          <p className="mt-5 text-muted-foreground leading-8">
            To ensure transparency, order, and consistency in operations, the Directorate
            provides clear guidance on major administrative processes.
          </p>
        </header>

        {/* ADMISSION */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Admission Procedure
          </h2>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
            <li>Visit the official application portal and review programmes</li>
            <li>Complete the online application form</li>
            <li>Upload required academic credentials</li>
            <li>Pay application fee via approved channels</li>
            <li>Submit application before deadline</li>
          </ul>
        </section>

        {/* REGISTRATION */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Registration Procedure
          </h2>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
            <li>Accept admission offer</li>
            <li>Complete clearance and documentation</li>
            <li>Pay tuition through official channels</li>
            <li>Register approved courses online</li>
            <li>Print registration slip for verification</li>
          </ul>
        </section>

        {/* PAYMENT */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Payment Procedure
          </h2>

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground leading-7">
            <li>Confirm correct fees before payment</li>
            <li>Use only official University payment platforms</li>
            <li>Retain all payment receipts</li>
            <li>Report payment issues immediately</li>
          </ul>
        </section>

        {/* EXAMINATION */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Examination Procedure
          </h2>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
            <li>Register all required courses</li>
            <li>Maintain required attendance levels</li>
            <li>Follow examination timetable strictly</li>
            <li>Observe all exam rules and regulations</li>
            <li>Avoid examination misconduct</li>
          </ul>
        </section>

        {/* RESULTS */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Result Processing
          </h2>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
            <li>Results are released after academic board approval</li>
            <li>Processing timeline: 4–6 weeks after exams</li>
            <li>Queries must be submitted within 7 days of release</li>
            <li>All results are published on the official portal</li>
          </ul>
        </section>

        {/* CERTIFICATION */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Certificate Processing
          </h2>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
            <li>Verification of academic completion</li>
            <li>Clearance from all relevant units</li>
            <li>Processing fee confirmation</li>
            <li>Issuance of certificates within approved timelines</li>
          </ul>
        </section>

        {/* COMPLAINTS */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Complaints & Appeals
          </h2>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
            <li>Submit complaints via official email or office channel</li>
            <li>Include full details and supporting documents</li>
            <li>Allow 3–5 working days for response</li>
            <li>Appeals must be submitted within 14 days</li>
          </ul>
        </section>

        {/* RESOURCES */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Downloadable Resources
          </h2>

          <div className="mt-6 space-y-3 text-sm">
            <a className="block text-primary underline hover:opacity-80" href="/forms/application.pdf">
              Application Form (PDF)
            </a>

            <a className="block text-primary underline hover:opacity-80" href="/forms/registration-guide.pdf">
              Registration Guide (PDF)
            </a>

            <a className="block text-primary underline hover:opacity-80" href="/handbook/student-handbook-2026.pdf">
              Student Handbook (2026 Edition)
            </a>

            <a className="block text-primary underline hover:opacity-80" href="/regulations/unizik-academic-regulations.pdf">
              UNIZIK Academic Regulations
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="border rounded-xl p-5">
                <p className="font-medium">{item.q}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-7">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}