import React from 'react';
import Link from 'next/link';
import { SITE_TITLE } from '@/config';
import { FOOTER_SECTIONS } from '@/lib/constants';

export const Footer: React.FC = () => {
    return (
        <footer className="relative overflow-hidden bg-gradient-to-r from-[#081632] via-[#0d274f] to-[#132f5f] py-16 text-white dark:from-[#040814] dark:via-[#08172f] dark:to-[#0f2450]">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-500/14 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-300/12 blur-3xl" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
                    {/* University Info */}
                    <div>
                        <h3 className="text-xl font-semibold mb-5">{SITE_TITLE}</h3>
                        <p className="text-gray-300 leading-relaxed">
                            Leading business education institution in Nigeria, committed to developing
                            ethical leaders and innovative thinkers for the global economy.
                        </p>
                    </div>

                    {/* Footer Sections */}
                    {FOOTER_SECTIONS.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xl font-semibold mb-5">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-300 hover:text-white transition-colors duration-200 no-underline"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-semibold mb-5">Contact Info</h3>
                        <ul className="space-y-3 text-gray-300">
                            <li>📍Awka, Anambra State, Nigeria</li>
                            <li>🏢 Unizik E-Learning System</li>
                            <li>📞 +234 (0) 48 550 940</li>
                            <li>✉️ info@unizik.edu.ng</li>
                            <li>🌐 https://cdp.unizik.edu.ng</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/15 pt-8 text-center text-blue-100/70">
                    <p>&copy; 2024 {SITE_TITLE}. All rights reserved. | Privacy Policy | Terms of Service</p>
                </div>
            </div>
        </footer>
    );
};