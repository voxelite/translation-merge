# Voxelite Translation Merger

GitHub Action to merge [Voxelite](https://github.com/voxelite)'s translations into single per-language JSON file.
Based on [`voxelite/json-merge@v1`](https://github.com/marketplace/actions/voxelite-json-merger).

Supported language formats:
- language - `en` - 2 lower-case characters
- language variant - `en-US` - 2 lower-case characters followed by `-` and 2 upper-case characters

Language variant requires `-` as the separator, `_` is not valid.
For more information about those language codes, look at [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646) (example can be found [here](https://gist.github.com/msikma/8912e62ed866778ff8cd)).

## Inputs

### `in-directory`

**Required**

Path to your directory containing all direct translation files (like `en.json`) and per-language directories (like `en`).

### `out-directory`

**Required**

Directory to write language files (like `en.json`) into.

## Outputs

### `languages`

All mentioned languages, no matter how many translated keys they have.

Languages with no keys are ignored.

## Example usage

```yaml
- name: block.json merging
  uses: voxelite/json-merge@v1
  with:
    in-file: block.json
    in-directory: block
    out-file: out_block.json
```

For object format (block, item, entity...) look into official documentation.
