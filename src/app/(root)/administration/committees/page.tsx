import {
  Users,
  ShieldCheck,
  ClipboardList,
  FileSearch,
  Banknote,
  GraduationCap,
  Settings2,
  CalendarDays,
} from "lucide-react";

export default function CommitteesPage() {
  const committees = [
    {
      title: "Admissions Committee",
      icon: GraduationCap,
      description:
        "Oversees admissions processes, screening standards, and admission recommendations.",
    },
    {
      title: "Examinations Committee",
      icon: ClipboardList,
      description:
        "Manages examination administration, review of issues, and academic assessment processes.",
    },
    {
      title: "Quality Assurance Committee",
      icon: ShieldCheck,
      description:
        "Ensures compliance with standards and promotes continuous service improvement.",
    },
    {
      title: "Programme Review Committee",
      icon: FileSearch,
      description:
        "Evaluates programmes and recommends improvements and new academic offerings.",
    },
    {
      title: "Finance & Planning Committee",
      icon: Banknote,
      description:
        "Handles budgeting, planning, and financial strategy for Directorate operations.",
    },
    {
      title: "Student Support Committee",
      icon: Users,
      description:
        "Addresses student welfare, support services, and administrative responsiveness.",
    },
  ];

  return (
    <main className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-6 py-14 space-y-16">

        {/* HEADER */}
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Governance Structure
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Directorate Committees
          </h1>

          <p className="mt-5 text-muted-foreground leading-8">
            The Directorate establishes committees to support administration,
            academic coordination, quality assurance, and operational planning.
          </p>
        </header>

        {/* COMMITTEE CARDS */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {committees.map((c) => {
            const Icon = c.icon;

            return (
              <div
                key={c.title}
                className="rounded-2xl border p-6 hover:-translate-y-1 transition"
              >
                <Icon className="h-6 w-6" />

                <h3 className="mt-4 font-semibold">
                  {c.title}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground leading-6">
                  {c.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* DETAILED GOVERNANCE SECTION */}
        <section className="space-y-10">

          {/* COMPOSITION */}
          <div className="rounded-3xl border p-8">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Composition
            </h2>

            <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
              <li>Director (Chairman of all committees)</li>
              <li>Deputy Director / Assistant Director</li>
              <li>Programme Coordinators</li>
              <li>Administrative Officer (Secretary)</li>
              <li>Unit Heads (Admissions, ICT, Records, Finance)</li>
              <li>Co-opted academic staff where necessary</li>
            </ul>
          </div>

          {/* TERMS OF REFERENCE */}
          <div className="rounded-3xl border p-8">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Terms of Reference
            </h2>

            <ul className="mt-6 space-y-3 text-sm text-muted-foreground leading-7">
              <li>Provide advisory input on committee-specific matters</li>
              <li>Ensure alignment with University policies and standards</li>
              <li>Support decision-making through structured recommendations</li>
              <li>Monitor implementation of approved directives</li>
              <li>Promote accountability and transparency in operations</li>
            </ul>
          </div>

          {/* MEETING SCHEDULE */}
          <div className="rounded-3xl border p-8">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Meeting Schedule
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border p-5">
                <p className="font-medium">Ordinary Meetings</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once every month
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="font-medium">Emergency Meetings</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  As required
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="font-medium">Annual Review</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  End of academic session
                </p>
              </div>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}