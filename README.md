# Delete publishConfig Directory

Delete publishConfig Directory is a tool for use in conjunction with [Changesets] and [Clean Publish].

When using the two of them together, [Clean Publish] doesn't delete the `directory` field from the `publishConfig`
field in your package's package.json. This causes [Changesets] to try and navigate two directories down from the root
of your package, causing a failure to publish.

Delete publishConfig Directory prevents this by deleting the extra field from your cleaned package.json.

## Install

Install it via your NodeJS package manager of choice:

```shell
$ pnpm install -D delete-publishconfig-directory
```

## Usage

Following the recipe from Clean Publish's [Usage with pnpm workspaces], update your package.json to include:

```json
{
  "publishConfig": {
    "directory": "package"
  },
  "scripts": {
    "prepublishOnly": "rm -rf ./package && clean-publish && delete-publishconfig-directory",
    "postpublish": "rm -rf ./package"
  }
}
```

## 📝 License

Copyright © 2023 Richard Harrah.<br />
This project is [MIT](https://github.com/ToppleTheNun/delete-publishconfig-directory/blob/main/LICENSE) licensed.

[Changesets]: https://github.com/changesets/changesets
[Clean Publish]: https://github.com/shashkovdanil/clean-publish/
[Usage with pnpm workspaces]: https://github.com/shashkovdanil/clean-publish#usage-with-pnpm-workspaces
