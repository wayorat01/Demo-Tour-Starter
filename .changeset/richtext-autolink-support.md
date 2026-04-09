---
'payblocks': minor
---

Add autolink support and link style override to RichText serializer

- Added `autolink` case to handle Lexical's automatically detected links (e.g., email addresses, URLs)
- Extended `OverrideStyle` type to include `'a'` for customizing link styles via `overrideStyle={{ a: 'custom-class' }}`
