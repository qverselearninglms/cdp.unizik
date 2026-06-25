import {
  Users,
  BadgeInfo,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  FileUser,
} from "lucide-react";

export default function StaffDirectoryPage() {
  const staff = [
    {
      name: "Dr. Chinedu Okafor",
      designation: "Deputy Director",
      unit: "Administration",
      responsibility: "Overall coordination of administrative operations",
      email: "chinedu.okafor@unizik.edu.ng",
      phone: "+234 803 112 4456",
    },
    {
      name: "Mrs. Ifeoma Nwankwo",
      designation: "Admissions Officer",
      unit: "Admissions Unit",
      responsibility: "Manages application and admission processes",
      email: "ifeoma.nwankwo@unizik.edu.ng",
      phone: "+234 802 554 7789",
    },
    {
      name: "Mr. Emeka Uzochukwu",
      designation: "Records Officer",
      unit: "Records & Documentation",
      responsibility: "Maintains student academic records and files",
      email: "emeka.uzochukwu@unizik.edu.ng",
      phone: "+234 805 667 9911",
    },
    {
      name: "Engr. Nnaji Stella",
      designation: "ICT Support Lead",
      unit: "ICT / Help Desk",
      responsibility: "Manages portal, website, and digital systems",
      email: "stella.nnaji@unizik.edu.ng",
      phone: "+234 807 221 3344",
    },
    {
      name: "Mr. Kenechukwu Eze",
      designation: "Finance Officer",
      unit: "Finance & Payments",
      responsibility: "Handles fee verification and payment guidance",
      email: "kene.eze@unizik.edu.ng",
      phone: "+234 809 445 6677",
    },
    {
      name: "Mrs. Adaobi Madu",
      designation: "Student Support Officer",
      unit: "Enquiries Desk",
      responsibility: "Handles student enquiries and complaints",
      email: "adaobi.madu@unizik.edu.ng",
      phone: "+234 801 998 2233",
    },
  ];

  return (
    <main className="bg-background text-foreground py-16">
      <div className="mx-auto max-w-7xl px-6 py-14 space-y-10">

        {/* HEADER */}
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Staff Directory
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Directorate Personnel
          </h1>

          <p className="mt-5 text-muted-foreground leading-8">
            The Staff Directory helps applicants, students, partners, and members of the
            public identify the appropriate officers for specific enquiries and services.
          </p>
        </header>

        {/* TABLE */}
        <section className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Responsibility</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
              </tr>
            </thead>

            <tbody>
              {staff.map((s, idx) => (
                <tr
                  key={s.email}
                  className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 text-muted-foreground">{s.designation}</td>
                  <td className="p-4 text-muted-foreground">{s.unit}</td>
                  <td className="p-4 text-muted-foreground">{s.responsibility}</td>
                  <td className="p-4 text-primary underline cursor-pointer">
                    {s.email}
                  </td>
                  <td className="p-4 text-muted-foreground">{s.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* QUICK INFO STRIP */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-xl p-5">
            <BadgeInfo className="w-5 h-5 mb-2" />
            <p className="font-medium">Response Time</p>
            <p className="text-sm text-muted-foreground mt-2">
              24–72 working hours depending on enquiry type
            </p>
          </div>

          <div className="border rounded-xl p-5">
            <ShieldCheck className="w-5 h-5 mb-2" />
            <p className="font-medium">Verified Contacts</p>
            <p className="text-sm text-muted-foreground mt-2">
              All emails belong to official UNIZIK domains
            </p>
          </div>

          <div className="border rounded-xl p-5">
            <FileUser className="w-5 h-5 mb-2" />
            <p className="font-medium">Escalation Path</p>
            <p className="text-sm text-muted-foreground mt-2">
              Unresolved issues can be escalated to the Director’s Office
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}