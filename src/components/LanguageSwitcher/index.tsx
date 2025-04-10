import localization, { locales, localeLabels } from "@/localization.config";
import { Check, Globe, Icon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from "@/utilities";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { CMSLink } from "../Link";

export const LanguageSwitcher: React.FC<{ publicContext: PublicContextProps, size?: 'default' | 'sm' | 'lg' | 'icon' | 'clear' }> = ({ publicContext, size = 'default' }) => {
  const { cleanSlugs, locale: currentLocale } = publicContext;
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem className="text-muted-foreground hover:bg-card hover:text-accent-foreground rounded-md">
          <NavigationMenuTrigger className={cn(
            size === 'sm' && "h-9 rounded-md px-3 text-sm font-medium",
            size === 'lg' && "h-11 rounded-md px-8",
            size === 'icon' && "h-10 w-10",
            size === 'clear' && "h-auto px-0 py-0"
          )}>
            <Globe className={cn("mr-2", size === 'sm' ? "h-4 w-4" : "h-4")} />
            {localeLabels[currentLocale]}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="p-3">
              {locales.map((locale) => {
                const langPrefix = locale === localization.defaultLocale ? "" : `/${locale}`;
                const href = (cleanSlugs?.[0] === "home" ? langPrefix : `${langPrefix}/${cleanSlugs?.join('/')}`) || "/";
                if (currentLocale === locale) {
                  return (
                    <span key={locale} className="w-[85px] mb-1 p-2 text-accent-foreground bg-card rounded-md flex items-center justify-start">
                      {localeLabels[locale]} <Check className="w-4 h-4 ml-2" />
                    </span>
                  )
                } else {
                  return (
                    <Link key={locale} href={href} lang={locale} className="w-[85px] mb-1 p-2 hover:text-accent-foreground hover:bg-card rounded-md flex items-center justify-start">
                      {localeLabels[locale]}
                    </Link>
                  )
                }
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export const LanguageSwitcherMobile: React.FC<{ publicContext: PublicContextProps }> = ({ publicContext }) => {
  const { cleanSlugs, locale: currentLocale } = publicContext;
  return (
    <AccordionItem value="language-switcher" className="border-b-0">
      <AccordionTrigger className="py-0 font-medium hover:no-underline">
        <span className='inline-flex items-center justify-start'>
          <Globe className={"h-4 -ml-1"} />
          {localeLabels[currentLocale]}
        </span>
      </AccordionTrigger>
      <AccordionContent className="mt-2">
        {locales.map((locale) => {
          const langPrefix = locale === localization.defaultLocale ? "" : `/${locale}`;
          const href = (cleanSlugs?.[0] === "home" ? langPrefix : `${langPrefix}/${cleanSlugs?.join('/')}`) || "/";
          if (currentLocale === locale) {
            return (
              <span key={locale} className="text-sm font-semibold flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                {localeLabels[locale]} <Check className="w-4 h-4 ml-2" />
              </span>
            )
          } else {
            return (
              <Link key={locale} href={href} lang={locale} className="text-sm font-semibold flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                {localeLabels[locale]}
              </Link>
            )
          }
        })}
      </AccordionContent>
    </AccordionItem>
  );
};
