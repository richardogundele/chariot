import { MessageSquare, Paintbrush, Rocket } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: MessageSquare,
      step: "1",
      title: "Describe your website",
      description:
        "Tell us about your business, your goals, or what you'd like on your website. Our AI will create a professional site tailored to your needs.",
    },
    {
      icon: Paintbrush,
      step: "2",
      title: "Review & refine",
      description:
        "Review your website and request any changes you'd like. Keep iterating until you're completely satisfied with the result.",
    },
    {
      icon: Rocket,
      step: "3",
      title: "Publish instantly",
      description:
        "When you're ready, publish your website with one click. No technical setup required - we handle everything for you.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Building your website is as simple as having a conversation. Here's how it works:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: "forwards" }}
            >
              <div className="bg-card rounded-2xl p-8 shadow-card border border-border transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 h-full">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-glow">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <step.icon className="h-7 w-7 text-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
