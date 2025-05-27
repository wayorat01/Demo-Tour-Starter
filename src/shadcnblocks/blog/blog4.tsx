import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const posts = [
  {
    id: 'post-1',
    title: 'Duis sem sem, gravida vel porttitor eu, volutpat ut arcu',
    summary:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    label: 'Ut varius dolor turpis',
    author: 'Jane Doe',
    published: '1 Jan 2024',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg',
  },
  {
    id: 'post-2',
    title: 'Duis sem sem, gravida vel porttitor eu, volutpat ut arcu',
    summary:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    label: 'Ut varius dolor turpis',
    author: 'Jane Doe',
    published: '1 Jan 2024',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg',
  },
  {
    id: 'post-3',
    title: 'Duis sem sem, gravida vel porttitor eu, volutpat ut arcu',
    summary:
      'Pellentesque eget quam ligula. Sed felis ante, consequat nec ultrices ut, ornare quis metus. Vivamus sit amet tortor vel enim sollicitudin hendrerit.',
    label: 'Ut varius dolor turpis',
    author: 'Jane Doe',
    published: '1 Jan 2024',
    href: '#',
    image: 'https://www.shadcnblocks.com/images/block/placeholder-dark-1.svg',
  },
];

const Blog4 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mb-8 md:mb-14 lg:mb-16">
          <div className="flex items-start justify-between gap-8">
            <div>
              <p className="text-wider mb-4 text-sm font-medium text-muted-foreground">
                Eyebrow
              </p>
              <h2 className="mb-4 w-full text-4xl font-medium md:mb-5 md:text-5xl lg:mb-6 lg:text-6xl">
                Blog
              </h2>
            </div>
            <Button className="hidden md:block">View all posts</Button>
          </div>
          <p>Duis sem sem, gravida vel porttitor eu, volutpat ut arcu</p>
        </div>
        <div className="grid gap-x-4 gap-y-8 md:grid-cols-2 lg:gap-x-6 lg:gap-y-12 2xl:grid-cols-3">
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

              <div>
                <Badge>{post.label}</Badge>
              </div>
              <div className="mb-2 line-clamp-3 break-words pt-4 text-lg font-medium md:mb-3 md:pt-4 md:text-2xl lg:pt-4 lg:text-3xl">
                {post.title}
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

export default Blog4;
