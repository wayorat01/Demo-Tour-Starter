'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { CarouselApi } from '@/components/ui/carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const data = [
  {
    id: 'item-1',
    title: 'ornare quis metus',
    description:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-1.svg',
  },
  {
    id: 'item-2',
    title: 'Sed felis anteu',
    description:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, Sed felis ante. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-2.svg',
  },
  {
    id: 'item-3',
    title: 'Volutpat ut arcu',
    description:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-3.svg',
  },
  {
    id: 'item-4',
    title: 'Gravida vel porttitor eu',
    description:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-4.svg',
  },
  {
    id: 'item-5',
    title: 'Duis sem sem',
    description:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-5.svg',
  },
];

const Gallery5 = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selection, setSelection] = useState(0);
  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    carouselApi.scrollTo(selection);
  }, [carouselApi, selection]);
  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setSelection(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on('select', updateSelection);
    return () => {
      carouselApi.off('select', updateSelection);
    };
  }, [carouselApi]);
  return (
    <section className="py-32">
      <div className="container mb-14 flex flex-col gap-16 lg:mb-16 lg:px-16">
        <div className="lg:max-w-lg">
          <h2 className="mb-3 text-xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
            Feature name
          </h2>
          <p className="mb-8 text-muted-foreground lg:text-lg">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig
            doloremque mollitia fugiat omnis! Porro facilis quo animi
            consequatur. Explicabo.
          </p>
          <a
            href="#"
            className="group flex items-center text-xs font-medium md:text-base lg:text-lg"
          >
            Book a demo{' '}
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="flex shrink-0 justify-center gap-2 md:hidden">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              carouselApi?.scrollPrev();
            }}
            disabled={!canScrollPrev}
            className="disabled:pointer-events-auto"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              carouselApi?.scrollNext();
            }}
            disabled={!canScrollNext}
            className="disabled:pointer-events-auto"
          >
            <ArrowRight className="size-5" />
          </Button>
        </div>
        <div className="hidden items-center justify-center space-x-4 space-y-4 text-center md:flex md:flex-wrap">
          <ToggleGroup
            type="single"
            variant="outline"
            size="lg"
            className="flex-wrap gap-4"
            value={data[selection].id}
            onValueChange={(newValue) => {
              if (newValue) {
                setSelection(data.findIndex((item) => item.id === newValue));
              }
            }}
          >
            {data.map((item) => (
              <ToggleGroupItem key={item.id} value={item.id}>
                {item.title}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              '(max-width: 768px)': {
                dragFree: true,
              },
            },
          }}
        >
          <CarouselContent className="ml-[calc(theme(container.padding)-40px)] mr-[calc(theme(container.padding))] lg:ml-[calc(200px-40px)] lg:mr-[200px] 2xl:ml-[calc(50vw-700px+200px-40px)] 2xl:mr-[calc(50vw-700px+200px)]">
            {data.map((item) => (
              <CarouselItem key={item.id} className="pl-[40px]">
                <a href={item.href} className="group rounded-xl">
                  <div className="flex flex-col text-clip rounded-xl border border-border md:col-span-2 md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
                    <div className="md:min-h-96 lg:min-h-112 xl:min-h-128">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="aspect-video size-full object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-col justify-center px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
                      <h3 className="mb-3 text-lg font-semibold md:mb-4 md:text-2xl lg:mb-6">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground lg:text-lg">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default Gallery5;
