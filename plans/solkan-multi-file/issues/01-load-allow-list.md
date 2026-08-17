## TLDR

New `loadAllowList(paths)` helper that reads one or more JSON files and returns a concatenated `string[]`.

## What to build

Create `lib/loadAllowList.js` exporting `loadAllowList(paths)`:

- `paths` is an array of file paths
- Read each file with `readJson` from firost
- Validate each file's content is an array using `_.isArray` from golgoth
- Throw with a clear message identifying the offending file if validation fails
- Concatenate all arrays left-to-right and return the flat `string[]`

## Behavioral Tests

**Single file**
- returns the array from a single file

**Multiple files**
- concatenates arrays from two files in order

**Missing file**
- throws when a file does not exist

**Invalid shape**
- throws when a file contains an object instead of an array

## Acceptance criteria

- [ ] `loadAllowList([path])` returns the array from that file
- [ ] `loadAllowList([path1, path2])` returns `[...file1, ...file2]`
- [ ] `loadAllowList([missing])` throws with the file path in the message
- [ ] `loadAllowList([objectFile])` throws with a shape error
- [ ] Uses `_.isArray` from golgoth for validation
