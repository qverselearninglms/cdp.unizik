import {
  LayoutGrid,
  ClipboardCheck,
  GraduationCap,
  Database,
  FileBarChart,
  Banknote,
  MonitorSmartphone,
  Headphones,
  ShieldCheck,
} from "lucide-react";

export default function UnitsAndFunctionsPage() {
  return (
    <main className="bg-background text-foreground py-16">
      <div className="mx-auto max-w-7xl px-6 py-14 space-y-16">

        {/* HEADER */}
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            Units & Functions
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Service Delivery Framework
          </h1>

          <p className="mt-5 text-muted-foreground leading-8">
            For efficient operation, the Directorate functions through specialised
            service units and desks that support admissions, programme coordination,
            record keeping, student support, examinations, payments, and communication.
          </p>
        </header>

        {/* PROGRAMME COORDINATION */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Programme Coordination Unit
          </h2>

          <p className="text-muted-foreground leading-8 max-w-3xl">
            Coordinates all approved certificate and diploma programmes in collaboration
            with relevant academic units.
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              "Coordinating programme schedules and delivery",
              "Liaising with departments and faculties",
              "Monitoring programme implementation",
              "Supporting programme review and improvement",
              "Ensuring alignment with academic standards",
            ].map((f) => (
              <div key={f} className="border rounded-xl p-5 bg-muted/20">
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* ADMISSIONS */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Admissions Unit
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              "Providing information on available programmes",
              "Guiding applicants on admission requirements",
              "Managing application processes",
              "Responding to admission enquiries",
              "Supporting screening and documentation",
            ].map((f) => (
              <div key={f} className="border rounded-xl p-5">
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* RECORDS */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            Records & Documentation Unit
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              "Maintaining admission and registration records",
              "Managing student files and documentation",
              "Tracking progression and completion data",
              "Preparing certification records",
              "Ensuring proper information retrieval",
            ].map((f) => (
              <div key={f} className="border rounded-xl p-5 bg-muted/20">
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* EXAMS */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            Examinations & Results Unit
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              "Supporting examination logistics",
              "Coordinating examination documentation",
              "Result collation and processing support",
              "Maintaining examination records",
              "Communicating approved results",
            ].map((f) => (
              <div key={f} className="border rounded-xl p-5">
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* FINANCE */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Finance & Payments Desk
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              "Providing information on approved fees",
              "Guiding payment procedures",
              "Supporting payment verification",
              "Liaising with the Bursary",
            ].map((f) => (
              <div key={f} className="border rounded-xl p-5 bg-muted/20">
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* ICT */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MonitorSmartphone className="w-5 h-5" />
            ICT / Help Desk
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              "Supporting online application systems",
              "Portal and website assistance",
              "Maintaining digital communication channels",
              "Managing internal information systems",
              "Disseminating online updates",
            ].map((f) => (
              <div key={f} className="border rounded-xl p-5">
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* SUPPORT DESK */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Headphones className="w-5 h-5" />
            Enquiries & Student Support Desk
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              "Handling general enquiries",
              "Guiding users to relevant units",
              "Managing administrative complaints",
              "Providing procedural information",
              "Supporting communication flow",
            ].map((f) => (
              <div key={f} className="border rounded-xl p-5 bg-muted/20">
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* QUALITY ASSURANCE */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Quality Assurance & Compliance
          </h2>

          <p className="text-muted-foreground leading-8 max-w-3xl">
            This function operates across all units to ensure compliance with University
            regulations, approved standards, and continuous improvement in service delivery.
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              "Ensuring adherence to operational procedures",
              "Supporting internal quality monitoring",
              "Enforcing institutional compliance standards",
              "Driving continuous service improvement",
            ].map((f) => (
              <div key={f} className="border rounded-xl p-5">
                {f}
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}