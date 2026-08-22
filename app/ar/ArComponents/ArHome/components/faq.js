"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import faqImg from "@/public/images/image22342.webp"
import PillTitle from "@/app/components/pill-title"

export default function FAQ({ faqData }) {
    const [openItem, setOpenItem] = useState(0)

    const toggleItem = (id) => {
        setOpenItem((prev) => (prev === id ? null : id))
    }

    return (
        // dir on the section, so every child inherits RTL instead of each
        // block opting in separately.
        <section dir="rtl" className="bg-white md:rounded-t-[50px] py-20 relative z-[80]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-wrap md:justify-between items-start lg:gap-0 gap-4">
                    <PillTitle title={'الأسئلة الشائعة'} />

                    <div className="mb-16 text-right">
                        <h2 className="text-3xl md:text-5xl mb-4 text-balance leading-tight">
                            إجابات{" "}
                            <span className="text-primary font-bold">
                                سريعة وواضحة
                                <br className="lg:block hidden" />
                                على أهم تساؤلاتك
                            </span>
                        </h2>
                    </div>
                </div>

                {/* List first, image second: under RTL the first column lands on
                    the right, mirroring the English layout. */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        {faqData.map((item, index) => (
                            <div key={item.id} className="border-b border-gray-200 pb-4">
                                <button
                                    type="button"
                                    onClick={() => toggleItem(item.id)}
                                    aria-expanded={openItem === item.id}
                                    className="w-full flex items-start justify-between gap-4 text-right group cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-gray-400 font-semibold text-lg md:text-xl leading-none mt-1">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <h3
                                            className={`text-base font-medium transition-colors duration-300 ${openItem === item.id
                                                ? "text-sky-600"
                                                : "text-gray-900 group-hover:text-sky-600"
                                                }`}
                                        >
                                            {item.question}
                                        </h3>
                                    </div>

                                    <span className="mt-1 shrink-0">
                                        {openItem === item.id ? (
                                            <Minus className="w-5 h-5 text-sky-600" />
                                        ) : (
                                            <Plus className="w-5 h-5 text-gray-500 group-hover:text-sky-600 transition" />
                                        )}
                                    </span>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openItem === item.id
                                        ? "max-h-[2000px] opacity-100 mt-3"
                                        : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <div
                                        className="text-gray-600 text-right text-sm md:text-base me-9 pe-8 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: item.answer }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center lg:items-start text-center lg:text-right">
                        <div className="relative w-full lg:max-w-[380px] md:max-w-[800px] aspect-[4/5] rounded-2xl overflow-hidden mb-8 shadow-md">
                            <img
                                src={faqImg.src}
                                alt="صورة الأسئلة الشائعة"
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                        </div>

                        <div className="max-w-sm">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                ما زلت تبحث عن إجابات؟
                            </h3>

                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                                فريقنا المتخصص سيرشدك خلال عملية التصميم،
                                ومواصفات المشروع، وتقدير التكاليف خطوة بخطوة.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}