## TLDR

New `loadRewriteMap(paths)` helper that reads one or more JSON files and returns a merged `Map`.

## What to build

Create `lib/loadRewriteMap.js` exporting `loadRewriteMap(paths)`:

- `paths` is an array of file paths
- Read each file with `readJson` from firost
- Validate each file's content is a plain object using `_.isPlainObject` from golgoth
- Throw with a clear message identifying the offending file if validation fails
- Spread-merge all objects left-to-right (later files override earlier keys)
- Convert the merged object to a `Map` via `new Map(Object.entries(merged))` and return it

## Behavioral Tests

**Single file**
- returns a Map from a single file

**Multiple files**
- merges two files, later keys override earlier

**Missing file**
- throws when a file does not exist

**Invalid shape**
- throws when a file contains an array instead of an object
- throws when a file contains null

## Acceptance criteria

- [ ] `loadRewriteMap([path])` returns a Map from that file
- [ ] `loadRewriteMap([path1, path2])` returns merged Map where path2 keys override path1
- [ ] `loadRewriteMap([missing])` throws with the file path in the message
- [ ] `loadRewriteMap([arrayFile])` throws with a shape error
- [ ] Uses `_.isPlainObject` from golgoth for validation
