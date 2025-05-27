import { CheckCircle2, Globe, Lock, Star, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

const Hero57 = () => {
  return (
    <section className="py-32">
      <div className="container relative">
        <div className="absolute inset-0 -z-10 mx-auto size-full max-w-3xl bg-[linear-gradient(to_right,hsl(from_var(--muted)_h_s_l)_1px,transparent_1px),linear-gradient(to_bottom,hsl(from_var(--muted)_h_s_l)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_50%_100%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        <h1 className="relative mx-auto mb-8 max-w-3xl flex-wrap text-center text-4xl font-semibold md:mb-10 md:text-6xl md:leading-snug">
          <span>
            Create Winning
            <span className="ml-1 opacity-50">Proposals</span> 10X Faster with
            <Globe className="mx-2 mb-1 inline-block h-auto w-8 md:mx-4 md:mb-3 md:w-14" />
            AI
          </span>
          <div className="underline-offset-3 absolute -left-20 -top-10 hidden w-fit -rotate-12 gap-1 border-b border-dashed border-muted-foreground text-sm font-normal text-muted-foreground lg:flex">
            <Zap className="h-auto w-3" />
            Fast
          </div>
          <div className="underline-offset-3 absolute -left-24 top-14 hidden w-fit -rotate-12 gap-1 border-b border-dashed border-muted-foreground text-sm font-normal text-muted-foreground lg:flex">
            <Lock className="h-auto w-3" />
            Secure
          </div>
          <div className="underline-offset-3 absolute -right-24 -top-10 hidden w-fit rotate-12 gap-1 border-b border-dashed border-muted-foreground text-sm font-normal text-muted-foreground lg:flex">
            Professional
            <Star className="h-auto w-3" />
          </div>
          <div className="underline-offset-3 absolute -right-28 top-14 hidden w-fit rotate-12 gap-1 border-b border-dashed border-muted-foreground text-sm font-normal text-muted-foreground lg:flex">
            Optimized
            <CheckCircle2 className="h-auto w-3" />
          </div>
        </h1>
        <p className="mx-auto mb-10 max-w-screen-md text-center font-medium text-muted-foreground md:text-xl">
          Penna let you build high-converting, website-style proposals with AI,
          helping you win better customers without wasting time
        </p>
        <div className="flex flex-col items-center justify-center gap-3 pb-12 pt-3">
          <Button size="lg">Start free 14-day trial</Button>
          <div className="text-sm text-muted-foreground md:text-balance">
            Powered by GPT-4
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero57;
