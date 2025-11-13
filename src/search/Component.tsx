'use client'

import * as React from 'react'
import { FileText, Loader2, Search } from 'lucide-react'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button, ButtonProps } from '@/components/ui/button'
import { useSearch } from '@/utilities/useSearch'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

export function SearchButton({
  className = '',
  variant = 'ghost',
}: {
  className?: string
  variant?: ButtonProps['variant']
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [isMobile, setIsMobile] = React.useState(false)
  const router = useRouter()

  const debouncedValue = useDebounce(value, 300)
  const { results, cachedResults, initialResults, isLoading } = useSearch(debouncedValue, open)

  // Detect mobile view
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check for keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
        setValue('')
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open])

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setValue('')
    }
  }, [open])

  // Handle selection of a result
  const handleSelect = (url: string) => {
    router.push(url)
    setOpen(false)
    setValue('')
  }

  // Combine cached and API results, showing cached first
  // Show initial results when no query, cached when available, or search results
  const displayResults = React.useMemo(() => {
    if (!debouncedValue) {
      return initialResults
    }
    if (cachedResults.length > 0 && results.length === 0 && !isLoading) {
      return cachedResults
    }
    return results
  }, [cachedResults, results, initialResults, isLoading, debouncedValue])

  const SearchList = () => {
    return (
      <>
        <div className="flex items-center border-b px-3 py-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="What are you searching for?"
            className="border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="ml-2 h-7 rounded border px-2 text-xs"
          >
            Esc
          </Button>
        </div>
        <CommandList className="!h-[400px] !max-h-[400px]">
          {isLoading && displayResults.length === 0 && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              <span className="text-muted-foreground ml-2 text-sm">Searching...</span>
            </div>
          )}

          {!isLoading && displayResults.length === 0 && debouncedValue && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {!debouncedValue && displayResults.length === 0 && !isLoading && (
            <CommandEmpty>Start typing to search...</CommandEmpty>
          )}

          {displayResults.length > 0 && (
            <CommandGroup
              heading={
                !debouncedValue
                  ? 'Recent Items'
                  : cachedResults.length > 0 && results.length === 0
                    ? 'Recent Results'
                    : `Found ${displayResults.length} result${displayResults.length !== 1 ? 's' : ''}`
              }
            >
              {displayResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.id}
                  onSelect={() => handleSelect(result.url)}
                  className="flex items-start gap-3"
                >
                  <FileText className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="truncate text-sm font-medium">{result.title}</div>
                    {result.description && (
                      <div className="text-muted-foreground line-clamp-2 text-xs">
                        {result.description}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-muted-foreground text-xs capitalize">
                        {result.type}
                      </span>
                      {result.categories && result.categories.length > 0 && (
                        <>
                          <span className="text-muted-foreground text-xs">•</span>
                          <span className="text-muted-foreground text-xs">
                            {result.categories.map((cat) => cat.title).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </>
    )
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={`text-muted-foreground hover:text-foreground mx-2 px-3 transition-colors ${className}`}
        variant={variant}
      >
        <p className="flex items-center gap-2">
          <Search className="h-4 w-4 rotate-90" />
          <span className="hidden text-sm lg:block">Search</span>
        </p>
      </Button>
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="flex h-[80vh] flex-col overflow-hidden p-0 [&>button]:hidden"
          >
            <VisuallyHidden>
              <SheetTitle>Search</SheetTitle>
            </VisuallyHidden>
            <Command className="flex h-full flex-col overflow-hidden">
              <SearchList />
            </Command>
          </SheetContent>
        </Sheet>
      ) : (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <SearchList />
        </CommandDialog>
      )}
    </>
  )
}
