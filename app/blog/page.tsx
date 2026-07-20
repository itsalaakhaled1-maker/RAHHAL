import { Metadata } from "next";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "المدونة | الرحّال",
  description: "نصائح سفر، دليل الوجهات، وأفضل الممارسات للمسافرين",
};

const posts = [
  {
    title: "10 نصائح ذهبية لرحلة مثالية إلى نيويورك",
    excerpt: "اكتشف أفضل الأوقات للزيارة، المطاعم المحلية، والأماكن السرية التي لا يعرفها السياح...",
    date: "15 يوليو 2026",
    readTime: "5 دقائق",
    tag: "نصائح السفر",
  },
  {
    title: "دليلك الكامل للسفر بميزانية محدودة",
    excerpt: "كيف تخطط لرحلة أحلامك دون إنفاق ثروة؟ إليك الاستراتيجيات العملية...",
    date: "10 يوليو 2026",
    readTime: "7 دقائق",
    tag: "الميزانية",
  },
  {
    title: "أفضل 5 وجهات عائلية لصيف 2026",
    excerpt: "وجهات آمنة وممتعة للعائلات مع أنشطة تناسب جميع الأعمار...",
    date: "5 يوليو 2026",
    readTime: "4 دقائق",
    tag: "عائلي",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📝 المدونة</h1>
          <p className="text-gray-500">نصائح، دليل الوجهات، وإلهام لرحلتك القادمة</p>
        </div>

        <div className="space-y-6">
          {posts.map((post, index) => (
            <article
              key={index}
              className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-card-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-ocean/10 text-ocean text-xs font-bold rounded-full">
                  {post.tag}
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h2>
              <p className="text-gray-500 mb-4 leading-relaxed">{post.excerpt}</p>
              <button className="text-ocean font-bold text-sm flex items-center gap-1 hover:underline">
                اقرأ المزيد
                <ArrowLeft className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}