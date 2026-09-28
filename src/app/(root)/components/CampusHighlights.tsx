import { CAMPUSHIGHLIGHTS } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export default function CampusHighlights() {
    return (
        <section
            id="campus_highlight"
            className="relative flex min-h-[85vh] w-full items-center overflow-hidden bg-gradient-to-b from-white to-slate-100 px-4 py-16 dark:from-[#050d1e] dark:to-[#091226] sm:px-6"
        >
            <div className="absolute -left-24 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -right-24 -bottom-16 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="w-full max-w-7xl mx-auto text-center">
                <div className="text-center mb-12">
                    <p className="mb-3 text-sm uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                        Discover Campus
                    </p>
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Campus Highlights</h2>
                    <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                        Experience what makes our university special through our state-of-the-art facilities and vibrant community.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {CAMPUSHIGHLIGHTS.map((ch, index) => (
                        <div key={index} className="group relative h-64 w-auto overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/10">
                            <Image
                                src={ch.imageUrl}
                                fill
                                alt={ch.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-black/70 to-transparent flex items-end p-4">
                                <h3 className="text-white font-bold text-lg">{ch.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="#"
                        className="inline-flex items-center justify-center rounded-full border border-white/15 bg-gradient-to-r from-[#eb3f57] via-[#963bcb] to-[#0d58cb] px-7 py-3 font-medium text-white shadow-[0_12px_36px_rgba(218,72,100,0.43)] transition-all hover:scale-[1.02]"
                    >
                        Take a Virtual Tour
                    </Link>
                </div>
            </div>
        </section>
    );
}