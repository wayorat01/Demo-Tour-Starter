import { ArrowRight, Clock, MapPin, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utilities/cn';

const jobs = [
  {
    title: 'Senior Software Engineer',
    location: 'Remote',
    city: 'Vancouver, BC',
    type: 'Full-time',
    link: '#',
  },
  {
    title: 'Product Manager',
    location: 'Remote',
    city: 'Vienna, Austria',
    type: 'Full-time',
    link: '#',
  },
];

const Careers2 = () => {
  return (
    <section className="py-32">
      <div className="container px-1">
        <div className="border-x border-dashed">
          <div className="relative flex flex-col gap-6 border-b border-dashed px-4 py-10 sm:items-center md:pb-20">
            <div className="absolute inset-0 -z-10 size-full bg-[linear-gradient(to_right,hsl(from_var(--muted)_h_s_l)_1px,transparent_1px),linear-gradient(to_bottom,hsl(from_var(--muted)_h_s_l)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_50%_100%_at_50%_50%,transparent_60%,#000_100%)]"></div>
            <Badge variant="outline" className="w-fit">
              Job openings
            </Badge>
            <h1 className="text-2xl font-bold md:text-4xl">Openings at Acme</h1>
            <p className="text-muted-foreground">
              Don&apos;t see a role for you?
              <a href="#" className="ml-1 underline">
                Reach out anyways.
              </a>
            </p>
          </div>
          <div>
            {jobs.map((job) => (
              <div
                key={job.title}
                className="grid items-center gap-6 border-b border-dashed px-6 py-10 lg:grid-cols-4"
              >
                <h2 className="text-lg">{job.title}</h2>
                <div className="col-span-2 flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:gap-8 lg:justify-center">
                  <div className="flex gap-2">
                    <Clock className="h-auto w-4" />
                    {job.type}
                  </div>
                  <div className="flex gap-2">
                    <MapPin className="h-auto w-4" />
                    {job.city}
                  </div>
                  <div className="flex gap-2">
                    <Target className="h-auto w-4" />
                    {job.location}
                  </div>
                </div>
                <a
                  href={job.link}
                  className={cn(buttonVariants(), 'w-fit gap-1 lg:ml-auto')}
                >
                  Apply
                  <ArrowRight className="h-auto w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers2;
