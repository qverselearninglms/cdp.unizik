import {
  Mail,
  Phone,
  Clock3,
  MapPinned,
  Landmark,
  GraduationCap,
  ClipboardCheck,
  Wallet,
  FileText,
  MonitorSmartphone,
  ShieldAlert,
  Handshake,
  ArrowUpRight,
} from "lucide-react";

export default function ContactAdministrationPage() {
  const enquiryTypes = [
    {
      title: "Admissions",
      icon: GraduationCap,
      description:
        "Application requirements, admission status and screening enquiries.",
    },
    {
      title: "Registration",
      icon: ClipboardCheck,
      description: "Registration procedures, clearance and student onboarding.",
    },
    {
      title: "Programme Information",
      icon: FileText,
      description: "Available certificate and diploma programmes.",
    },
    {
      title: "Payments",
      icon: Wallet,
      description: "Fee schedules, payment verification and receipts.",
    },
    {
      title: "Records & Documentation",
      icon: Landmark,
      description:
        "Student records, documentation and certification enquiries.",
    },
    {
      title: "ICT Support",
      icon: MonitorSmartphone,
      description:
        "Portal access, online applications and technical assistance.",
    },
    {
      title: "Complaints & Appeals",
      icon: ShieldAlert,
      description: "Administrative complaints and appeals process.",
    },
    {
      title: "Partnerships & Collaborations",
      icon: Handshake,
      description:
        "Institutional partnerships and collaborative opportunities.",
    },
  ];

  return (
    <main className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* HERO */}
        <section className="rounded-3xl border p-8 md:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">
              Contact Administration
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Get in Touch With the Directorate
            </h1>

            <p className="mt-5 text-muted-foreground leading-8">
              For official enquiries relating to admissions, administration,
              programme coordination, student support, records, ICT services,
              and partnerships, please contact the Directorate through its
              approved communication channels.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-5">
              <Mail className="mb-4 h-5 w-5" />
              <p className="font-medium">Email</p>
              <a
                href="mailto:cdp@unizik.edu.ng"
                className="mt-2 block text-primary hover:underline"
              >
                cdp@unizik.edu.ng
              </a>
            </div>

            <div className="rounded-2xl border p-5">
              <Phone className="mb-4 h-5 w-5" />
              <p className="font-medium">Phone</p>
              <a
                href="tel:+2347081598866"
                className="mt-2 block text-primary hover:underline"
              >
                +234 708 159 8866
              </a>
            </div>

            <div className="rounded-2xl border p-5">
              <Clock3 className="mb-4 h-5 w-5" />
              <p className="font-medium">Office Hours</p>
              <p className="mt-2 text-muted-foreground">8:00 AM – 5:00 PM</p>
            </div>
          </div>
        </section>

        {/* ENQUIRY TYPES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold">
              What Can We Help You With?
            </h2>

            <p className="mt-3 text-muted-foreground leading-7">
              To help us respond efficiently, please indicate the nature of your
              enquiry when contacting the Directorate.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {enquiryTypes.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border p-5 transition-all hover:-translate-y-1"
                >
                  <Icon className="h-6 w-6" />

                  <h3 className="mt-4 font-medium">{item.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>

                  <ArrowUpRight className="mt-4 h-4 w-4 opacity-40 group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        </section>

        {/* LOCATION */}
        <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-3xl border p-8">
            <MapPinned className="h-6 w-6" />

            <h2 className="mt-4 text-xl font-semibold">Office Location</h2>

            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>Directorate of Certificate and Diploma Programmes</p>

              <p>Nnamdi Azikiwe University, Awka</p>

              <p>Anambra State, Nigeria</p>

              <div className="pt-2">
                <p className="font-medium text-foreground">Physical Location</p>

                <p className="mt-2">
                  Chisco Building, opposite the Digital Library
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border min-h-[420px]">
            <iframe
              title="Directorate of Certificate and Diploma Programmes Location"
              src="https://www.google.com/maps?q=Nnamdi+Azikiwe+University+Awka&output=embed"
              width="100%"
              height="100%"
              className="min-h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <section className="mt-16 rounded-3xl border p-8 md:p-10">
  <div className="max-w-3xl">
    <h2 className="text-2xl font-semibold">
      Send Us an Enquiry
    </h2>

    <p className="mt-3 text-muted-foreground">
      Complete the form below and a member of the Directorate team
      will respond to your enquiry.
    </p>
  </div>

  <form className="mt-8 space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Full Name
        </label>

        <input
          type="text"
          className="w-full rounded-xl border bg-background px-4 py-3"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email Address
        </label>

        <input
          type="email"
          className="w-full rounded-xl border bg-background px-4 py-3"
          placeholder="you@example.com"
        />
      </div>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Phone Number
        </label>

        <input
          type="tel"
          className="w-full rounded-xl border bg-background px-4 py-3"
          placeholder="+234..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Enquiry Category
        </label>

        <select className="w-full rounded-xl border bg-background px-4 py-3">
          <option>Admissions</option>
          <option>Registration</option>
          <option>Programme Information</option>
          <option>Payments</option>
          <option>Records & Documentation</option>
          <option>ICT Support</option>
          <option>Complaints & Appeals</option>
          <option>Partnerships & Collaborations</option>
        </select>
      </div>
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Subject
      </label>

      <input
        type="text"
        className="w-full rounded-xl border bg-background px-4 py-3"
        placeholder="Subject of your enquiry"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Message
      </label>

      <textarea
        rows={6}
        className="w-full rounded-xl border bg-background px-4 py-3 resize-none"
        placeholder="Provide details of your enquiry..."
      />
    </div>

    <div className="flex justify-end">
      <button
        type="submit"
        className="rounded-xl px-6 py-3 font-medium bg-primary text-primary-foreground"
      >
        Submit Enquiry
      </button>
    </div>
  </form>
</section>

        {/* RESPONSE TIME */}
        <section className="mt-16 rounded-3xl border p-8">
          <h2 className="text-2xl font-semibold">Expected Response Time</h2>

          <p className="mt-4 leading-8 text-muted-foreground">
            The Directorate is committed to responding to enquiries as promptly
            as possible within official working days and hours.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-5">
              <p className="font-medium">General Enquiries</p>
              <p className="mt-2 text-muted-foreground">Within 24–48 hours</p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="font-medium">Admissions Issues</p>
              <p className="mt-2 text-muted-foreground">
                Within 2–3 working days
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="font-medium">Technical Support</p>
              <p className="mt-2 text-muted-foreground">Within 24 hours</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
