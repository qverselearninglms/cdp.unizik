import {
  CheckCircle2,
  ShieldCheck,
  Clock3,
  FileText,
  MessageSquareQuote,
  Users,
  HandHeart,
  Scale,
  ThumbsUp,
} from "lucide-react";

export default function ServiceCharterPage() {
  const commitments = [
    {
      title: "Professionalism",
      icon: ShieldCheck,
      desc: "We deliver services with professionalism and institutional integrity.",
    },
    {
      title: "Timely Response",
      icon: Clock3,
      desc: "We ensure prompt responses to enquiries within official timelines.",
    },
    {
      title: "Transparency",
      icon: Scale,
      desc: "We maintain clear, open, and accountable administrative processes.",
    },
    {
      title: "Accurate Records",
      icon: FileText,
      desc: "We ensure proper documentation and secure record keeping.",
    },
    {
      title: "Effective Communication",
      icon: MessageSquareQuote,
      desc: "We maintain clear communication with all stakeholders.",
    },
    {
      title: "Fairness",
      icon: ThumbsUp,
      desc: "We treat all applicants and students equitably and respectfully.",
    },
  ];

  return (
    <main className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-6 py-14 space-y-16">

        {/* HEADER */}
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Service Commitment
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Service Charter
          </h1>

          <p className="mt-5 text-muted-foreground leading-8">
            The Directorate of Certificate and Diploma Programmes is committed
            to providing efficient, transparent, courteous, and professional
            administrative services to all stakeholders.
          </p>
        </header>

        {/* CORE COMMITMENTS */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {commitments.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border p-6 hover:-translate-y-1 transition"
              >
                <Icon className="h-6 w-6" />

                <h3 className="mt-4 font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground leading-6">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* EXPECTATIONS GRID */}
        <section className="grid gap-8 lg:grid-cols-2">

          {/* WHAT YOU CAN EXPECT */}
          <div className="rounded-3xl border p-8">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              What You Can Expect from Us
            </h2>

            <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
              <li>Clear information on programmes and procedures</li>
              <li>Respectful and courteous treatment at all times</li>
              <li>Guidance through admissions and registration processes</li>
              <li>Prompt attention to genuine administrative concerns</li>
              <li>Confidential handling of records and personal data</li>
              <li>Commitment to institutional standards and quality service</li>
            </ul>
          </div>

          {/* WHAT WE EXPECT */}
          <div className="rounded-3xl border p-8">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              What We Expect from You
            </h2>

            <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
              <li>Provide accurate and complete information</li>
              <li>Follow approved procedures and timelines</li>
              <li>Treat staff and other users with respect</li>
              <li>Retain payment and registration evidence</li>
              <li>Comply with University and Directorate regulations</li>
            </ul>
          </div>

        </section>

        {/* FEEDBACK SECTION */}
        <section className="rounded-3xl border p-8 md:p-10">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold">
              Feedback and Complaints
            </h2>

            <p className="mt-4 text-muted-foreground leading-8">
              We welcome feedback that can help us improve our services.
              Complaints and suggestions should be submitted through approved
              communication channels for appropriate review and action.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <HandHeart className="h-5 w-5" />
            Your feedback helps improve service delivery and responsiveness.
          </div>
        </section>

      </div>
    </main>
  );
}