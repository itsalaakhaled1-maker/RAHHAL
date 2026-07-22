export const metadata = {
  title: "سياسة الاسترداد | رحال",
  description: "سياسة الاسترداد وإرجاع الأموال لموقع رحال - مخطط الرحلات الذكي",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-card-lg border border-gray-100 dark:border-gray-700 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white mb-2">
          سياسة الاسترداد
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          <strong>تاريخ السريان:</strong> 22 يوليو 2026 | <strong>آخر تحديث:</strong> 22 يوليو 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">1. مقدمة</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              نسعى في شركة حكيم لتقديم أفضل تجربة ممكنة لمستخدمي رحال. نفهم أن خطط السفر قد تتغير، لذلك وضعنا هذه السياسة لتوضيح شروط وإجراءات استرداد الأموال. بشراءك لأي اشتراك مدفوع، فإنك توافق على بنود هذه السياسة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">2. فترة التجربة المجانية</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              نقدم <strong>فترة تجربة مجانية لمدة 7 أيام</strong> للخطط السنوية و <strong>3 أيام</strong> للخطط الشهرية. خلال هذه الفترة:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
              <li>يمكنك استكشاف جميع الميزات المتاحة في خطتك (بحث رحلات، فنادق، خطط يومية).</li>
              <li>لن يتم خصم أي رسوم من حسابك.</li>
              <li>يمكنك إلغاء الاشتراك في أي وقت خلال فترة التجربة بدون أي تكلفة.</li>
              <li>عند انتهاء فترة التجربة، يتم تحويلك تلقائياً للخطة المدفوعة ما لم تقم بالإلغاء.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">3. شروط الاسترداد</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              يحق لك طلب استرداد كامل المبلغ في الحالات التالية:
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-green-800 dark:text-green-400 mb-2">✅ يتم الموافقة على الاسترداد:</h3>
              <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300">
                <li>طلب الاسترداد خلال <strong>14 يوماً</strong> من تاريخ الشراء (للاشتراكات الشهرية والسنوية).</li>
                <li>وجود خلل تقني من جانبنا يمنعك من استخدام الخدمة لأكثر من 48 ساعة متواصلة.</li>
                <li>تم خصم رسوم مكررة بالخطأ.</li>
                <li>لم تستخدم الخدمة بشكل جوهري (أقل من 3 خطط سفر مُنشأة).</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
              <h3 className="font-bold text-red-800 dark:text-red-400 mb-2">❌ لا يتم الاسترداد في الحالات التالية:</h3>
              <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                <li>مرور أكثر من 14 يوماً على تاريخ الشراء.</li>
                <li>استخدامك لأكثر من 50% من الميزات المتاحة في خطتك.</li>
                <li>إنشاء أكثر من 10 خطط سفر عبر النظام.</li>
                <li>الإلغاء بعد انتهاء فترة التجربة المجانية للخطط الشهرية.</li>
                <li>انتهاك شروط الاستخدام أو استخدام الخدمة لأغراض غير قانونية.</li>
                <li>الاشتراكات المُشتراة عبر عروض خصم أو كوبونات ترويجية (ما عدا العيوب التقنية).</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">4. كيفية طلب الاسترداد</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              لطلب استرداد، اتبع الخطوات التالية:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>أرسل طلب استرداد إلى <strong>support@hakim.tech</strong> من البريد المسجل في حسابك.</li>
              <li>اكتب في الموضوع: &quot;طلب استرداد رحال — [رقم الطلب أو البريد الإلكتروني]&quot;.</li>
              <li>اذكر سبب طلب الاسترداد بإيجاز.</li>
              <li>أرفق إيصال الدفع أو رقم المعاملة (إن وجد).</li>
              <li>سيتم مراجعة طلبك خلال <strong>3-5 أيام عمل</strong>.</li>
              <li>سيتم إشعارك بالقرار عبر البريد الإلكتروني.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">5. مدة استعادة الأموال</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              بمجرد الموافقة على طلب الاسترداد:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
              <li><strong>بطاقات الائتمانية:</strong> 5-10 أيام عمل (حسب سياسة البنك).</li>
              <li><strong>Apple Pay / Google Pay:</strong> 3-7 أيام عمل.</li>
              <li><strong>PayPal:</strong> 3-5 أيام عمل.</li>
              <li><strong>التحويل البنكي:</strong> 7-14 يوم عمل.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
              قد تختلف المدة حسب وسيلة الدفع والبنك المصدر. نحن غير مسؤولين عن التأخيرات من جانب البنوك أو بوابات الدفع.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">6. الاسترداد الجزئي</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              في بعض الحالات، قد يتم الاسترداد الجزئي:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
              <li>إذا استخدمت جزءاً من الخدمة بنسبة معقولة (أقل من 50%).</li>
              <li>إذا كان الاشتراك السنوي تم إلغاؤه بعد 3 أشهر — يتم استرداد المبلغ المتبقي من السنة.</li>
              <li>في حالات العروض الخاصة، يتم احتساب الاسترداد بناءً على السعر الفعلي المدفوع.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">7. تغيير الخطة</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              يمكنك ترقية أو تخفيض خطتك في أي وقت:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
              <li><strong>الترقية:</strong> يتم احتساب الفرق وإضافة الأيام المتبقية من خطتك الحالية.</li>
              <li><strong>التخفيض:</strong> يتم تطبيق الخطة الجديدة من الدورة القادمة. لا يتم استرداد الفرق.</li>
              <li>لا يوجد رسوم إضافية على تغيير الخطة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">8. الاستثناءات الخاصة</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              قد نمنح استرداداً استثنائياً خارج الشروط المذكورة في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
              <li>وفاة المشترك (يتطلب وثائق رسمية).</li>
              <li>إعاقة دائمة تمنع استخدام الخدمة (يتطلب تقرير طبي).</li>
              <li>ظروف قهرية (حرب، كوارث طبيعية، إغلاقات حكومية تمنع السفر).</li>
              <li>قرار إداري استثنائي بناءً على مراجعة فردية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">9. إلغاء الاشتراك التلقائي</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              يمكنك إلغاء التجديد التلقائي في أي وقت عبر إعدادات الحساب. عند الإلغاء:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
              <li>يظل اشتراكك نشطاً حتى نهاية الفترة المدفوعة.</li>
              <li>لن يتم خصم أي رسوم إضافية.</li>
              <li>يمكنك استعادة الاشتراك في أي وقت قبل انتهاء الفترة.</li>
              <li>لا يتم استرداد الرسوم المدفوعة مسبقاً للفترة الحالية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">10. التواصل معنا</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              لأي استفسار حول سياسة الاسترداد:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 space-y-2 border border-gray-100 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300"><strong>البريد الإلكتروني:</strong> support@hakim.tech</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>وقت الاستجابة:</strong> 24-48 ساعة عمل</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>الشركة:</strong> سمارت حكيم للتكنولوجيا (Smart Hakim Technology)</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>الرخصة:</strong> 1639246 — دائرة الاقتصاد والسياحة بدبي</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}