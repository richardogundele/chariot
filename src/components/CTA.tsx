import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            Start building for free
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to create your website?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            Join thousands of entrepreneurs, freelancers, and businesses building beautiful websites with AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="xl" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg gap-2"
            >
              Start building now
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-primary-foreground/60 text-sm">
              No credit card required • Free forever plan
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
