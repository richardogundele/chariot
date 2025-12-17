import { Zap, Globe, Palette, Shield, Smartphone, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning fast",
      description: "Generate complete websites in minutes, not days. Our AI understands your vision instantly.",
    },
    {
      icon: Globe,
      title: "Custom domains",
      description: "Connect your own domain or use ours. SSL certificates and hosting included for free.",
    },
    {
      icon: Palette,
      title: "Beautiful designs",
      description: "Professional, modern templates that are fully customizable to match your brand.",
    },
    {
      icon: Smartphone,
      title: "Mobile responsive",
      description: "Every website looks perfect on any device - phones, tablets, and desktops.",
    },
    {
      icon: Shield,
      title: "Secure & reliable",
      description: "Enterprise-grade security with 99.9% uptime. Your site is always online.",
    },
    {
      icon: BarChart3,
      title: "Built-in analytics",
      description: "Track visitors, page views, and conversions with simple, actionable insights.",
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Powerful features that help you build, launch, and grow your online presence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-card-hover hover:border-accent/30 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                <feature.icon className="h-6 w-6 text-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
