import { ArrowUpRight } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const posts = [
  {
    id: 'post-1',
    title: 'Duis sem sem',
    summary:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    label: 'Design',
    readTime: '8 min read',
    author: 'Jane Doe',
    published: '1 Jan 2024',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg',
  },
  {
    id: 'post-2',
    title: 'Gravida vel porttitor eu',
    summary:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    label: 'Design',
    readTime: '8 min read',
    author: 'Jane Doe',
    published: '1 Jan 2024',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg',
  },
];

const Blog5 = () => {
  return (
    <section className="py-32">
      <div className="container flex flex-col gap-8 lg:flex-row lg:gap-16">
        <div className="mb-8 md:mb-14 lg:min-w-[30%]">
          <p className="text-wider mb-4 text-sm font-medium text-muted-foreground">
            Eyebrow
          </p>
          <h2 className="mb-4 w-full text-4xl font-medium md:mb-5 md:text-5xl lg:mb-6 lg:max-w-xs lg:text-6xl">
            Blog
          </h2>
          <p className="md:mb-5 lg:mb-6 lg:max-w-xs">
            Duis sem sem, gravida vel porttitor eu, volutpat ut arcu
          </p>
          <Button className="hidden md:block">View all posts</Button>
        </div>
        <div className="grid gap-x-4 gap-y-8 md:grid-cols-2 lg:gap-x-6 lg:gap-y-12">
          {posts.map((post) => (
            <a key={post.id} href={post.href} className="group flex flex-col">
              <div className="mb-4 flex text-clip rounded-xl md:mb-5">
                <div className="transition duration-300 group-hover:scale-105">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="aspect-3/2 size-full object-cover object-center"
                  />
                </div>
              </div>
              <div className="flex w-fit items-center rounded-full border border-border p-1">
                <Badge>{post.label}</Badge>
                <div className="mx-2 text-xs font-medium">{post.readTime}</div>
              </div>
              <div className="mb-2 flex items-start gap-4 pt-4 md:mb-3 md:pt-4 lg:pt-4">
                <span className="line-clamp-3 flex-1 break-words text-lg font-medium md:text-2xl lg:text-2xl xl:text-3xl">
                  {post.title}
                </span>
                <ArrowUpRight className="size-6 shrink-0" />
              </div>
              <div className="mb-4 line-clamp-2 text-sm text-muted-foreground md:mb-5 md:text-base">
                {post.summary}
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="size-12">
                  <AvatarImage src="https://www.shadcnblocks.com/images/block/avatar-1.webp" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-px">
                  <span className="text-xs font-medium">{post.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {post.published}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center py-2 md:hidden">
          <Button className="w-full sm:w-fit">View all posts</Button>
        </div>
      </div>
    </section>
  );
};

export default Blog5;
