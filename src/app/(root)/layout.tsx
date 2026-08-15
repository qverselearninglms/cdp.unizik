import React, { ReactNode } from 'react'
import HomeFloatingControls from './components/HomeFloatingControls'

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <main className='root'>
            <div className="root-container">
                <div className="wrapper">
                    <HomeFloatingControls />
                    {children}
                </div>
            </div>
        </main>
    )
}

export default Layout
