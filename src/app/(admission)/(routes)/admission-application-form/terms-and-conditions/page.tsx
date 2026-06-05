'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Mail, Phone, MapPin, Shield, FileText, Users, GraduationCap } from 'lucide-react';

interface SectionProps {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

const CollapsibleSection: React.FC<SectionProps> = ({ title, children, icon }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 text-left bg-linear-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center justify-between group"
            >
                <div className="flex items-center space-x-3">
                    {icon && <span className="text-blue-600 group-hover:text-blue-700">{icon}</span>}
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">{title}</h3>
                </div>
                {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-gray-600 group-hover:text-blue-700 transition-transform" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-blue-700 transition-transform" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 py-4 bg-white border-t border-gray-100">
                    {children}
                </div>
            )}
        </div>
    );
};

const TermsAndConditionsPage: React.FC = () => {
    const lastUpdated = new Date().toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                                <FileText className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Terms and Conditions
                        </h1>
                        <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
                            Nnnamdi Azikiwe University Business School - Awka, Anambra, Nigeria
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-blue-200">
                            <Calendar className="h-5 w-5" />
                            <span>Last updated: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Introduction */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <Shield className="h-6 w-6 text-blue-600 mr-3" />
                        Agreement Overview
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        By enrolling in, attending, or utilizing any services provided by the Nnamdi Azikiwe University Business School,
                        you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                        These terms constitute a legally binding agreement governed by the laws of the Federal Republic of Nigeria.
                    </p>
                </div>

                {/* Collapsible Sections */}
                <div className="space-y-2">
                    <CollapsibleSection
                        title="Admission and Enrollment"
                        icon={<GraduationCap className="h-5 w-5" />}
                    >
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Admission Requirements</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>All admissions are subject to meeting minimum academic qualifications as prescribed by the National Universities Commission (NUC)</li>
                                    <li>Submission of accurate and complete documentation is mandatory</li>
                                    <li>False or misleading information may result in immediate termination of enrollment without refund</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Enrollment Process</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Enrollment is confirmed only upon payment of prescribed fees and completion of all registration requirements</li>
                                    <li>The School reserves the right to verify all submitted credentials through appropriate channels</li>
                                    <li>Conditional admissions may be subject to additional requirements and timelines</li>
                                </ul>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Fees and Payment Terms"
                        icon={<FileText className="h-5 w-5" />}
                    >
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Tuition and Fees</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>All fees are quoted in Nigerian Naira (₦) unless otherwise specified</li>
                                    <li>Fee structures are subject to annual review and may be adjusted with appropriate notice</li>
                                    <li>Payment of fees does not guarantee academic progression or graduation</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Payment Schedule</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Tuition fees must be paid according to the prescribed payment schedule</li>
                                    <li>Late payment may incur additional charges and result in suspension of academic privileges</li>
                                    <li>Outstanding fees may prevent registration for subsequent semesters</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Refund Policy</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>{`Refunds are processed according to the School's official Refund Policy`}</li>
                                    <li>Administrative and processing fees are generally non-refundable</li>
                                    <li>Refund requests must be submitted in writing with appropriate documentation</li>
                                </ul>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Academic Policies"
                        icon={<Users className="h-5 w-5" />}
                    >
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Curriculum and Programs</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>The School reserves the right to modify curricula, discontinue programs, or change academic requirements with reasonable notice</li>
                                    <li>Program completion requirements are subject to NUC guidelines and institutional standards</li>
                                    <li>Credit transfers are evaluated on a case-by-case basis according to established policies</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Assessment and Grading</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>{`All assessments are conducted according to the School's Academic Assessment Policy`}</li>
                                    <li>Academic integrity is strictly enforced; violations may result in disciplinary action</li>
                                    <li>Grade appeals must follow the established academic appeals process</li>
                                </ul>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Student Conduct and Discipline"
                        icon={<Shield className="h-5 w-5" />}
                    >
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Code of Conduct</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Students are expected to maintain high standards of personal and academic conduct</li>
                                    <li>Behavior that disrupts the educational environment or violates institutional values is prohibited</li>
                                    <li>Students must comply with all federal, state, and local laws while on campus</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Academic Integrity</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Plagiarism, cheating, and other forms of academic dishonesty are strictly prohibited</li>
                                    <li>{`All academic work must represent the student's original effort unless properly cited`}</li>
                                    <li>Violations may result in course failure and disciplinary action</li>
                                </ul>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Privacy and Data Protection"
                        icon={<Shield className="h-5 w-5" />}
                    >
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Personal Information</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>The School collects and maintains student records in accordance with applicable Nigerian data protection laws</li>
                                    <li>Personal information is used for educational, administrative, and regulatory purposes</li>
                                    <li>Students have the right to access and request correction of their personal information</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Educational Records</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Student educational records are maintained according to institutional record-keeping policies</li>
                                    <li>Access to records is restricted to authorized personnel and complies with privacy regulations</li>
                                    <li>Students may request transcripts and certificates according to established procedures</li>
                                </ul>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Limitation of Liability"
                        icon={<FileText className="h-5 w-5" />}
                    >
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Educational Services</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>The School provides educational services to the best of its ability but makes no guarantees regarding employment outcomes</li>
                                    <li>{`The School's liability is limited to the provision of educational services as described in official publications`}</li>
                                    <li>Force majeure events may necessitate program modifications or temporary suspensions</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Jurisdiction</h4>
                                <p className="ml-4">These terms are governed by the laws of the Federal Republic of Nigeria. Any legal disputes will be subject to the jurisdiction of Nigerian courts.</p>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>

                {/* Contact Information */}
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mt-12 border border-blue-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Contact Information</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Users className="h-5 w-5 text-blue-600 mr-2" />
                                Academic Affairs Office
                            </h3>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-blue-600 mr-3 shrink-0" />
                                    <span>Nnamdi Azikiwe University, awka<br />
                                        Anambra, Nigeria</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 text-blue-600 mr-3" />
                                    <span>+234-802-123-4567</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-blue-600 mr-3" />
                                    <span>support.odl@fpno.edu.ng</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                                Student Support Services
                            </h3>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 text-blue-600 mr-3" />
                                    <span>+2347044914032</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-blue-600 mr-3" />
                                    <span>support.odl@fpno.edu.ng</span>
                                </div>
                                <div className="flex items-center">
                                    <GraduationCap className="h-4 w-4 text-blue-600 mr-3" />
                                    <span>www.odl-fpno.qverselearning.org</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acknowledgment */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8">
                    <div className="flex items-start">
                        <div className="shrink-0">
                            <Shield className="h-6 w-6 text-amber-600 mt-1" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Notice</h3>
                            <p className="text-amber-700 leading-relaxed">
                                By signing the enrollment agreement or accessing School services, you acknowledge that you have read,
                                understood, and agree to be bound by these Terms and Conditions. These terms may be updated from time
                                to time, and it is your responsibility to review them periodically.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">
                        © 2024 University of Excellence Business School. All rights reserved.
                    </p>
                    <p className="text-gray-400 mt-2">
                        This document complies with Nigerian educational regulations and institutional best practices.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default TermsAndConditionsPage;