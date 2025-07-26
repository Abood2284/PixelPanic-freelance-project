import { CheckCircle } from "lucide-react";

const uspData = [
  {
    title: "Doorstep in 60 min",
    description: "We reach before your chai cools.",
  },
  {
    title: "Transparent Pricing",
    description: "No hidden taxes, no ‘diagnostic’ shock.",
  },
  {
    title: "Data Safety First",
    description: "Your photos stay yours—ISO 27001 processes.",
  },
  {
    title: "Buy Now, Pay Later",
    description: "UPI, cards, or pay next month.",
  },
];

export default function UspTiles() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {uspData.map((item, idx) => (
            <article
              key={item.title}
              className="group text-center p-6 rounded-xl border bg-card hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pp-lime">
                <CheckCircle className="h-7 w-7 text-pp-navy" />
              </div>
              <h3 className="font-display font-semibold text-lg text-pp-navy mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-pp-slate">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
