import {
  Network,
  Building2,
  Users,
  UserCog,
  ClipboardList,
  FileText,
  Banknote,
  Monitor,
  Headphones,
  GitBranch,
} from "lucide-react";

export default function AdministrativeStructurePage() {
  return (
    <main className="bg-background text-foreground py-16">
      <div className="mx-auto max-w-7xl px-6 py-14 space-y-16">

        {/* HEADER */}
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Administrative Structure
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Organisational Framework
          </h1>

          <p className="mt-5 text-muted-foreground leading-8">
            The Directorate operates through a coordinated administrative system
            designed to ensure accountability, operational efficiency, and smooth
            service delivery. The structure supports leadership, programme administration,
            learner support, and inter-unit coordination.
          </p>
        </header>

        {/* ADMINISTRATIVE COMPOSITION */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Administrative Composition
          </h2>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              "Director",
              "Deputy Director / Assistant Director",
              "Programme Coordinators",
              "Administrative Officer / Secretary",
              "Admissions Officers",
              "Records Officers",
              "Finance / Accounts Support Staff",
              "ICT and Website Support Personnel",
              "Student Support and Enquiries Personnel",
            ].map((item) => (
              <div key={item} className="border rounded-xl p-5 bg-muted/20">
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* GOVERNANCE */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Network className="w-5 h-5" />
            Governance & Reporting Relationships
          </h2>

          <div className="mt-8 space-y-4 text-muted-foreground leading-7">
            <p>• Vice-Chancellor and Central University Management</p>
            <p>• Registry</p>
            <p>• Bursary</p>
            <p>• ICT Unit</p>
            <p>• Faculties and Departments running programmes</p>
            <p>• Academic Planning Unit</p>
            <p>• Student Affairs and support services</p>
            <p>• External partners and professional bodies</p>
          </div>
        </section>

        {/* ORGANISATIONAL ARRANGEMENT */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Organisational Arrangement
          </h2>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-6">
              <UserCog className="w-5 h-5 mb-3" />
              <p className="font-medium">Leadership Layer</p>
              <p className="mt-2 text-sm text-muted-foreground leading-7">
                The Director provides overall leadership and strategic oversight
                of all Directorate operations.
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <ClipboardList className="w-5 h-5 mb-3" />
              <p className="font-medium">Programme Coordination</p>
              <p className="mt-2 text-sm text-muted-foreground leading-7">
                Coordinators supervise programme-level activities and academic delivery.
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <FileText className="w-5 h-5 mb-3" />
              <p className="font-medium">Administrative Operations</p>
              <p className="mt-2 text-sm text-muted-foreground leading-7">
                Administrative officers manage documentation, records, and daily operations.
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <Monitor className="w-5 h-5 mb-3" />
              <p className="font-medium">Specialised Units</p>
              <p className="mt-2 text-sm text-muted-foreground leading-7">
                ICT, admissions, finance, and records units handle specialised services.
              </p>
            </div>

            <div className="border rounded-xl p-6 md:col-span-2">
              <Headphones className="w-5 h-5 mb-3" />
              <p className="font-medium">Support Services</p>
              <p className="mt-2 text-sm text-muted-foreground leading-7">
                Support staff manage enquiries, communication, student assistance,
                and operational logistics.
              </p>
            </div>
          </div>
        </section>

       
       {/* ORGANOGRAM */}
<section>
  <h2 className="text-xl font-semibold flex items-center gap-2">
    <GitBranch className="w-5 h-5" />
    Organogram
  </h2>

  <div className="mt-10 flex flex-col items-center space-y-10">

    {/* DIRECTOR */}
    <div className="relative flex flex-col items-center">

      <div className="rounded-2xl border px-6 py-4 bg-background shadow-sm text-center">
        <p className="font-semibold">Director</p>
        <p className="text-xs text-muted-foreground">
          Overall Leadership & Strategic Oversight
        </p>
      </div>

      {/* vertical line down */}
      <svg className="h-10 w-2">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="40"
          stroke="currentColor"
          className="text-border"
          strokeWidth="1"
        />
      </svg>
    </div>

    {/* SECOND LEVEL CONNECTOR */}
    <div className="relative w-full flex justify-center">

      {/* horizontal line */}
      <svg className="absolute top-0 w-full h-6">
        <line
          x1="10%"
          y1="10"
          x2="90%"
          y2="10"
          stroke="currentColor"
          className="text-border"
          strokeWidth="2"
        />
      </svg>

      <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl">

        {[
          {
            title: "Deputy / Assistant Director",
            desc: "Operational coordination & oversight",
          },
          {
            title: "Programme Coordinators",
            desc: "Academic programme management",
          },
          {
            title: "Administrative Officer",
            desc: "Documentation & daily administration",
          },
        ].map((item) => (
          <div key={item.title} className="relative flex flex-col items-center">

            {/* vertical connector */}
            <svg className="h-6 w-2">
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="24"
                stroke="currentColor"
                className="text-border"
                strokeWidth="2"
              />
            </svg>

            {/* node */}
            <div className="rounded-2xl border px-5 py-4 bg-muted/30 text-center w-full">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.desc}
              </p>
            </div>

            {/* line to next level */}
            <svg className="h-6 w-2">
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="24"
                stroke="currentColor"
                className="text-border"
                strokeWidth="2"
              />
            </svg>

          </div>
        ))}
      </div>
    </div>

    {/* THIRD LEVEL */}
    <div className="relative w-full flex justify-center">

      {/* top connector line */}
      <svg className="absolute top-0 w-full h-6">
        <line
          x1="5%"
          y1="10"
          x2="95%"
          y2="10"
          stroke="currentColor"
          className="text-border"
          strokeWidth="2"
        />
      </svg>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 w-full max-w-6xl">

        {[
          "Admissions Unit",
          "Records Unit",
          "ICT / Help Desk",
          "Finance Unit",
          "Examinations Unit",
          "Student Support Desk",
        ].map((unit) => (
          <div
            key={unit}
            className="relative flex flex-col items-center"
          >
            {/* vertical connector */}
            <svg className="h-6 w-2">
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="24"
                stroke="currentColor"
                className="text-border"
                strokeWidth="2"
              />
            </svg>

            <div className="rounded-xl border bg-background px-4 py-3 text-center text-sm w-full">
              {unit}
            </div>
          </div>
        ))}

      </div>
    </div>

  </div>
</section>

      </div>
    </main>
  );
}