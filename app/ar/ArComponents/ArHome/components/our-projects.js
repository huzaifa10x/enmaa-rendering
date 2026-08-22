"use client"
import { useState } from "react"
import image418 from "@/public/images/418.webp"
import image590 from "@/public/images/590.webp"
import image1717 from "@/public/images/1717.webp"
import image416 from "@/public/images/416.webp"
import image1703 from "@/public/images/image1703.webp"
import bgProp from "@/public/images/bg-prop.webp"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import PillTitle from "@/app/components/pill-title"

const items = [
    {
        id: 3,
        type: "image",
        src: image418,
        title: "مستودع صناعي",
        description: `
    <div>
        <div>شركة الفيل للتجارة ذ.م.م – فرع دبي</div>
        <div>سيح شعيب 4، دبي</div>
        <div>إجمالي مواقف السيارات المقترحة 11</div>
        <div>مستودع صناعي (أرضي + ميزانين)</div>
        <div>المساحة المبنية 4912.14 م²</div>
    </div>`
    },
    {
        id: 4,
        type: "image",
        src: image590,
        title: "حضانة",
        description: `
    <div>
        <div>الشارقة – الحمرية الشرقية</div>
        <div>إجمالي مواقف السيارات المقترحة 20</div>
        <div>مشروع حضانة مقترح – طابق أرضي فقط <br/> + غرفة حارس + مبنى خدمات + سور</div>
        <div>المساحة المبنية 2004.19 م²</div>
    </div>`
    },
    {
        id: 5,
        type: "image",
        src: image1703,
        title: "برج – تجاري <br/> مكاتب / سكني",
        description: `
    <div>
        <div>الشارقة – الخان</div>
        <div>إجمالي مواقف السيارات المقترحة 526</div>
        <div>مبنى برج (قبو + أرضي + 5 مواقف + طابق صحي + طابقين خدمات <br/> + 48 طابق)</div>
        <div>المساحة المبنية 4211.67 م²</div>
    </div>`
    },
    {
        id: 6,
        type: "image",
        src: image1717,
        title: "مبنى – تجاري <br/> مكاتب / سكني",
        description: `
    <div>
        <div>الشارقة – مويلح التجارية</div>
        <div>مبنى (أرضي + 4 طوابق + 50% من الطابق الخامس + السطح)</div>
        <div>المساحة المبنية 415.53 م²</div>
    </div>`
    },
    {
        id: 7,
        type: "image",
        src: image416,
        title: "مدرسة + حضانة",
        description: `
    <div>
        <div>المدرسة الفرنسية الدولية الخاصة</div>
        <div>مدرسة (قبو + أرضي + طابقين + سطح) + حضانة</div>
        <div>الهبية السادسة، دبي</div>
        <div>المساحة المبنية 1490.00 م²</div>
    </div>`
    }
]

export default function OurProjects() {
    // Single source of truth. The previous version kept `index` and
    // `currentSlide` in sync by hand and prev() could produce -1.
    const [index, setIndex] = useState(0)

    const next = () => setIndex((prev) => (prev + 1) % items.length)
    const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length)

    const getPositionClass = (i) => {
        const diff = (i - index + items.length) % items.length

        switch (diff) {
            case 0: // main (center)
                return "z-30 lg:scale-125 md:scale-75 scale-50 opacity-100 drop-shadow-2xl shadow-2xl translate-x-0"
            case 1: // right
                return "z-20 lg:scale-100 md:scale-50 scale-30 opacity-100 brightness-50 translate-x-[13rem] md:translate-x-[21rem] lg:translate-x-[38rem]"
            case 2: // far right
                return "z-10 lg:scale-0 md:scale-40 scale-0 opacity-80 brightness-50 translate-x-[6rem] md:translate-x-[20rem] lg:translate-x-[48rem]"
            case items.length - 1: // left
                return "z-20 lg:scale-100 md:scale-50 scale-30 opacity-100 brightness-50 -translate-x-[13rem] md:-translate-x-[21rem] lg:-translate-x-[38rem]"
            case items.length - 2: // far left
                return "z-10 lg:scale-0 md:scale-40 scale-0 opacity-80 brightness-50 -translate-x-[6rem] md:-translate-x-[20rem] lg:-translate-x-[48rem]"
            default:
                return "opacity-0 lg:scale-50 md:scale-30 pointer-events-none"
        }
    }

    return (
        <section
            dir="rtl"
            className="relative w-full flex flex-col py-10 overflow-hidden items-center justify-center rounded-t-[50px] z-[60] bg-neutral-200 -mt-10"
        >
            {/* Decorative watermark: must sit behind everything and ignore
                pointer events, otherwise it blocks the heading and buttons. */}
            <img
                src={bgProp.src}
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
            />

            <div className="relative z-10 flex flex-wrap md:justify-between w-full max-w-7xl items-start lg:gap-0 gap-4 px-6">
                <PillTitle title="مشاريعنا" />

                <div className="md:mb-16 max-w-[500px]">
                    <h2 className="text-4xl md:text-5xl mb-4 text-balance text-right">
                        مشاريع <span className="text-primary font-bold">إبداعية</span> تعكس
                        <br />
                        أسلوبنا
                    </h2>
                </div>
            </div>

            {/* Carousel container */}
            <div className="relative z-10 w-full max-w-[40em] md:h-[25em] h-[15em] flex items-center justify-center">
                <ul className="relative w-full h-full flex items-center justify-center">
                    {items.map((item, i) => (
                        <li
                            key={item.id}
                            className={`absolute transition-all duration-500 ease-in-out w-[500px] max-w-[90vw] h-[281px] rounded-lg overflow-hidden bg-gray-800 transform ${getPositionClass(i)}`}
                        >
                            <img
                                src={item.src.src}
                                alt={item.title.replace(/<[^>]*>/g, " ")}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover object-center"
                            />

                            {/* Caption sits ON the card, not below it. */}
                            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pb-3 pt-10 text-white text-right">
                                <div
                                    className="text-sm font-bold leading-tight mb-1"
                                    dangerouslySetInnerHTML={{ __html: item.title }}
                                />
                                <div
                                    className="text-[10px] leading-snug opacity-90 [&_div]:leading-snug"
                                    dangerouslySetInnerHTML={{ __html: item.description }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Buttons */}
            <div className="relative z-20 flex flex-wrap items-center md:justify-between justify-center md:mt-38 gap-9 w-full max-w-7xl px-6">
                <div className="flex items-center gap-4 lg-mt-0 mt-5">
                    {/* In RTL the "previous" affordance points right. */}
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="المشروع السابق"
                        className="text-black lg:px-6 lg:py-2 px-3 border border-neutral-400 rounded-full hover:bg-neutral-400 transition cursor-pointer"
                    >
                        <ArrowRight className="lg:w-10 w-3" />
                    </button>

                    <Link
                        href="/ar/our-projects/"
                        className="bg-neutral-800 text-xs text-white text-nowrap lg:px-6 px-3 border border-neutral-400 py-1 lg:py-2 rounded-full hover:bg-black transition"
                    >
                        استكشاف الكل
                    </Link>

                    <button
                        type="button"
                        onClick={next}
                        aria-label="المشروع التالي"
                        className="text-black lg:px-6 lg:py-2 px-3 border border-neutral-400 rounded-full hover:bg-neutral-400 transition cursor-pointer"
                    >
                        <ArrowLeft className="lg:w-10 w-3" />
                    </button>
                </div>

                {/* Progress Bar - fills from the right in RTL */}
                <div className="max-w-6xl flex items-center justify-end">
                    <div className="flex items-center gap-4 text-black text-4xl">
                        <div className="w-50 h-1 bg-white relative">
                            <div
                                className="absolute right-0 top-0 h-full bg-black transition-all duration-500 ease-out"
                                style={{ width: `${((index + 1) / items.length) * 100}%` }}
                            />
                        </div>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}