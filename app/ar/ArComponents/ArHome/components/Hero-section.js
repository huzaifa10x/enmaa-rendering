import React from 'react'
import Navbar from '@/app/Navbar'

export default function HeroSection({ title, desc, bg }) {
    return (
        <>
            <Navbar />
            <section className='relative h-[25rem]'>
                <img
                    src={bg.src}
                    alt=''
                    aria-hidden='true'
                    loading='eager'
                    className='absolute inset-0 h-full w-full object-cover brightness-[0.7]'
                />

                {/* Overlay must not swallow clicks on the content above it. */}
                <div className='pointer-events-none absolute inset-0 bg-black/40' />

                <div className='relative z-10 flex w-full flex-wrap items-center h-full text-white'>
                    <div className='max-w-7xl mx-auto flex flex-wrap px-4 items-center md:gap-10 gap-5'>
                        <h1
                            className='md:text-6xl text-5xl font-bold'
                            dangerouslySetInnerHTML={{ __html: title }}
                        />

                        <div dir='rtl' className='max-w-xl !font-sans tracking-normal md:!tracking-tight'>
                            {desc}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}