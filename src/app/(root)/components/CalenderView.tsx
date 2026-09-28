import React from 'react'
import Announcements from './Announcements'
import UpcomingEvents from './UpcomingEvents'

const CalenderView = () => {
    return (
        <section
            id="calender_view"
            className="relative flex min-h-[85vh] w-full items-center overflow-hidden bg-gradient-to-b from-slate-100 to-white px-4 py-16 dark:from-[#050d1e] dark:to-[#070f22] sm:px-6"
        >
            <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
            <div className="w-full max-w-7xl mx-auto text-center">
                <div className="mb-12 text-center sm:mb-16">
                    <p className="mb-3 text-sm uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                        Academic Schedule
                    </p>
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                        Calender Events
                    </h2>
                    <p className="mx-auto max-w-3xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                        Pick a glance at your academic schedule
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <Announcements />
                    </div>
                    <div>
                        <UpcomingEvents />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CalenderView