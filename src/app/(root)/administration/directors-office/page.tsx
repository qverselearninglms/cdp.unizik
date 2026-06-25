import Image from "next/image";
import {
  Mail,
  Phone,
  Clock,
  Building2,
  ScrollText,
  Landmark,
  Target,
  ShieldCheck,
  Lightbulb,
  Users,
  Handshake,
  Briefcase,
  BookOpen,
  Award,
  FlaskConical,
  University,
} from "lucide-react";

export default function DirectorsOfficePage() {
  const responsibilities = [
    "Implementation of the mandate of the Directorate",
    "Coordination of certificate and diploma programmes",
    "Liaison with faculties, departments, and external partners",
    "Policy direction and operational supervision",
    "Quality assurance and institutional compliance",
    "Student-centred service delivery and programme development",
  ];

  const mandates = [
    "Providing strategic direction for the growth and repositioning of the Directorate",
    "Supervising all administrative and operational units of the Directorate",
    "Facilitating collaboration with academic units and relevant University offices",
    "Promoting programme development in line with societal and industry needs",
    "Ensuring effective service delivery to applicants, students, and partners",
    "Representing the Directorate in institutional and external engagements",
  ];

  const priorities = [
    { icon: Target, title: "Expanding Access", desc: "Expanding access to relevant certificate and diploma programmes." },
    { icon: ShieldCheck, title: "Quality Assurance", desc: "Ensuring compliance with University standards." },
    { icon: Briefcase, title: "Efficiency", desc: "Strengthening administrative responsiveness." },
    { icon: Lightbulb, title: "Innovation", desc: "Driving innovation in programme delivery." },
    { icon: Handshake, title: "Partnerships", desc: "Promoting strategic collaborations." },
    { icon: Users, title: "Engagement", desc: "Improving stakeholder relations and visibility." },
  ];

  return (
    <main className="bg-background text-foreground py-16">
      <div className="mx-auto max-w-7xl px-6 py-14 grid lg:grid-cols-[320px_1fr] gap-12">

        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-10 h-fit space-y-6">
          <div className="rounded-2xl border overflow-hidden">
            <Image
              src="/avatars/avatar-man.jpg"
              alt="Director"
              width={800}
              height={800}
              className="w-full  object-cover"
            />
          </div>

          <div>
            <h1 className="text-lg font-semibold">
              Prof. Kenneth Gerald Ngwoke
            </h1>
            <p className="text-sm text-muted-foreground">
              Director, Certificate & Diploma Programmes
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> cdp@unizik.edu.ng
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> +2347081598866
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> 8:00 AM – 5:00 PM
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="space-y-16">

          {/* HEADER */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Director’s Office
            </p>

            <h2 className="mt-3 text-3xl font-semibold">
              Welcome Message
            </h2>

            <div className="mt-6 space-y-5 text-muted-foreground leading-8 max-w-3xl">
              <p>
                Welcome to the Directorate of Certificate and Diploma Programmes,
                Nnamdi Azikiwe University, Awka.
              </p>

              <p>
                It is my pleasure to welcome you to a Directorate committed to
                expanding access to quality education, professional development,
                and lifelong learning through well-structured programmes.
              </p>

              <p>
                At Nnamdi Azikiwe University, we recognise the need for flexible,
                relevant and practical learning pathways that empower individuals
                and strengthen institutions.
              </p>

              <p>
                The Directorate provides credible academic and professional programmes
                responding to emerging societal, industrial and public service needs.
              </p>

              <p>
                We are committed to excellence, transparency, innovation and service,
                working with faculties, departments and industry partners.
              </p>

              <p>
                I invite all prospective applicants, students and partners to engage with us
                in advancing human capital development.
              </p>

              <p>Thank you for visiting.</p>

              <div className="pt-4 text-foreground">
                <p className="font-medium">Professor Kenneth Ngwoke</p>
                <p className="text-sm text-muted-foreground">
                  Director, Directorate of Certificate and Diploma Programmes
                </p>
              </div>
            </div>
          </div>

          {/* OFFICE */}
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <ScrollText className="w-5 h-5" />
              Office of the Director
            </h3>

            <p className="mt-4 text-muted-foreground max-w-3xl leading-8">
              The Office of the Director provides overall leadership and is responsible
              for strategic planning, supervision and administration of all Directorate activities.
            </p>

            <ul className="mt-6 space-y-3 text-muted-foreground text-sm">
              {responsibilities.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>

          {/* MANDATE */}
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              Mandate
            </h3>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              {mandates.map((m) => (
                <p key={m}>• {m}</p>
              ))}
            </div>
          </div>

          {/* PRIORITIES */}
          <div>
            <h3 className="text-xl font-semibold">Leadership Priorities</h3>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              {priorities.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="border rounded-xl p-5">
                    <Icon className="w-5 h-5 mb-3" />
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FULL PROFILE — RESTORED PROPERLY */}
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Profile of Professor Kenneth Gerald Ngwoke
            </h3>

            <p className="mt-4 text-sm text-muted-foreground">
              Director, Directorate of Certificate and Diploma Programmes, Nnamdi Azikiwe University, Awka
            </p>

            <div className="mt-8 space-y-5 text-muted-foreground leading-8 max-w-4xl">
              <p>
                Professor Kenneth Gerald Ngwoke is a distinguished pharmaceutical scientist,
                academic, and institutional leader with over two decades of experience spanning
                pharmaceutical analysis, natural product medicinal chemistry, academic development,
                public health logistics, and industry-oriented capacity building.
              </p>

              <p>
                He serves as a Professor at Nnamdi Azikiwe University, Awka, where he has built
                a strong reputation for scholarship, innovation, programme development, and
                strategic institutional service.
              </p>

              <p>
                He holds a Ph.D. in Multidisciplinary Pharmaceutical Sciences from Queen’s University Belfast,
                with research interests in analytical chemistry, microbiology, and molecular biology.
                He is also a graduate of the University of Nigeria and Loughborough University.
              </p>

              <p>
                Professor Ngwoke has attracted competitive research and development support from
                AFD, TETFund, TWAS/DFG, and the World Bank. His scholarly contributions include
                patents, book chapters, and peer-reviewed publications in pharmaceutical sciences
                and antimicrobial research.
              </p>

              <p>
                Beyond academia, he has served as consultant and trainer for GAVI, USAID,
                ARC_ESM, and HELP Logistics across West Africa. He has also earned certifications
                from MIT and ISCEA in systems thinking and supply chain management.
              </p>

              <p>
                He is Managing Editor of the Journal of Current Biomedical Research and Founder/CEO
                of Skillachi Nigeria Limited, a consultancy focused on pharmaceutical analysis,
                systems strengthening and career development.
              </p>

              <p>
                His work reflects a commitment to excellence, relevance, innovation and service
                in higher education and national development.
              </p>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}