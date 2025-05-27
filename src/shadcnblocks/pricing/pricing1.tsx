import { Check } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const freeFeatures = [
  'Live Collaboration',
  '1 GB Storage',
  '2 Projects',
  'Basic Support',
  'Limited Customization',
  'Limited Integration',
  'Limited API Access',
];

const proFeatures = [
  '2 Team Members',
  '10 GB Storage',
  '10 Projects',
  'Priority Support',
  'Full Customization',
  'Full Integration',
  'Full API Access',
];

const premiumFeatures = [
  '5 Team Members',
  '50 GB Storage',
  '50 Projects',
  'Dedicated Support',
  'Advanced Customization',
  'Analytics',
  'Reports',
];

const entrepriseFeatures = [
  '10+ Team Members',
  '100+ GB Storage',
  '100+ Projects',
  'Dedicated Account Manager',
  'Custom Features',
  'Custom Support',
  'Custom Integration',
];

const Pricing1 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto mb-20 max-w-screen-lg text-center">
          <h2 className="mb-3 text-pretty text-4xl font-bold lg:text-6xl">
            Pricing
          </h2>
          <p className="text-muted-foreground lg:text-xl">
            Check out our affordable pricing plans below and choose the one that
            suits you best. If you need a custom plan, please contact us.
          </p>
        </div>
        <div className="mx-auto grid max-w-screen-sm rounded-md border text-center lg:max-w-none lg:grid-cols-4 lg:border-x-0 lg:border-y">
          <p className="px-6 pb-2 pt-6 text-3xl font-semibold lg:order-1">
            Free
          </p>
          <p className="text-balance px-6 text-muted-foreground lg:order-5">
            For personal use only with limited features and support
          </p>
          <div className="p-6 lg:order-9">
            <div className="mb-4 flex justify-center">
              <span className="text-lg font-semibold">$</span>
              <span className="text-6xl font-semibold">0</span>
            </div>
          </div>
          <div className="p-6 lg:order-13">
            <Button variant="outline" className="w-full">
              Get Started
            </Button>
          </div>
          <div className="border-b p-6 text-left lg:order-17 lg:border-b-0 lg:border-t">
            <div className="hidden lg:block">
              <p className="mb-2 text-lg font-semibold">Features</p>
              <ul className="mb-4 space-y-4">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Accordion type="single" collapsible className="lg:hidden">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger>See what&apos;s included</AccordionTrigger>
                <AccordionContent>
                  <ul className="mb-4 space-y-4">
                    {freeFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <a href="#" className="hover:underline">
              Learn more
            </a>
          </div>
          <p className="bg-muted px-6 pb-2 pt-6 text-3xl font-semibold lg:order-2">
            Pro
          </p>
          <p className="text-balance bg-muted px-6 text-muted-foreground lg:order-6">
            For small businesses with all the features and support
          </p>
          <div className="bg-muted p-6 lg:order-10">
            <div className="mb-4 flex justify-center">
              <span className="text-lg font-semibold">$</span>
              <span className="text-6xl font-semibold">29</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Per user, per month billed annually <br />
              $34 billed monthly
            </p>
          </div>
          <div className="bg-muted p-6 lg:order-13">
            <Button className="w-full">Try for free</Button>
            <p className="mt-4 text-muted-foreground">
              or
              <a href="#" className="ml-1 text-primary hover:underline">
                purchase now
              </a>
            </p>
          </div>
          <div className="border-b bg-muted p-6 text-left lg:order-18 lg:border-b-0 lg:border-t">
            <div className="hidden lg:block">
              <p className="mb-2 text-lg font-semibold">
                Everything in Free, and:
              </p>
              <ul className="mb-4 space-y-4">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Accordion type="single" collapsible className="lg:hidden">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger>See what&apos;s included</AccordionTrigger>
                <AccordionContent>
                  <ul className="mb-4 space-y-4">
                    {proFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <a href="#" className="hover:underline">
              Learn more
            </a>
          </div>
          <p className="px-6 pb-2 pt-6 text-3xl font-semibold lg:order-3">
            Premium
          </p>
          <p className="text-balance px-6 text-muted-foreground lg:order-7">
            For teams and organizations with advanced features and support
          </p>
          <div className="p-6 lg:order-11">
            <div className="mb-4 flex justify-center">
              <span className="text-lg font-semibold">$</span>
              <span className="text-6xl font-semibold">59</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Per user, per month billed annually <br />
              $69 billed monthly
            </p>
          </div>
          <div className="p-6 lg:order-14">
            <Button variant="outline" className="w-full">
              Try for free
            </Button>
            <p className="mt-4 text-muted-foreground">
              or
              <a href="#" className="ml-1 text-primary hover:underline">
                purchase now
              </a>
            </p>
          </div>
          <div className="border-b p-6 text-left lg:order-19 lg:border-b-0 lg:border-t">
            <div className="hidden lg:block">
              <p className="mb-2 text-lg font-semibold">
                Everything in Pro, and:
              </p>
              <ul className="mb-4 space-y-4">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Accordion type="single" collapsible className="lg:hidden">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger>See what&apos;s included</AccordionTrigger>
                <AccordionContent>
                  <ul className="mb-4 space-y-4">
                    {premiumFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <a href="#" className="hover:underline">
              Learn more
            </a>
          </div>
          <p className="px-6 pb-2 pt-6 text-3xl font-semibold lg:order-4">
            Entreprise
          </p>
          <p className="text-balance px-6 text-muted-foreground lg:order-8">
            For large companies with custom features and support and a dedicated
            account manager
          </p>
          <div className="lg:order-12"></div>
          <div className="p-6 lg:order-15">
            <Button variant="outline" className="w-full">
              Contact sales
            </Button>
          </div>
          <div className="p-6 text-left lg:order-20 lg:border-t">
            <div className="hidden lg:block">
              <p className="mb-2 text-lg font-semibold">
                Everything in Premium, and:
              </p>
              <ul className="mb-4 space-y-4">
                {entrepriseFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Accordion type="single" collapsible className="lg:hidden">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger>See what&apos;s included</AccordionTrigger>
                <AccordionContent>
                  <ul className="mb-4 space-y-4">
                    {entrepriseFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <a href="#" className="hover:underline">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing1;
