# Cloudflare Delete Deployments Action

[![units-test](https://github.com/go-fjords/cloudflare-delete-deployments-action/actions/workflows/test.yml/badge.svg)](https://github.com/go-fjords/cloudflare-delete-deployments-action/actions/workflows/test.yml)
[![CodeQL](https://github.com/go-fjords/cloudflare-delete-deployments-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/go-fjords/cloudflare-delete-deployments-action/actions/workflows/codeql-analysis.yml)
[![Check dist/](https://github.com/go-fjords/cloudflare-delete-deployments-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/go-fjords/cloudflare-delete-deployments-action/actions/workflows/check-dist.yml)

## Using the Action

### Inputs

| Name | Description | Required |
| --- | --- | --- |
| `token` | The Cloudflare API token to use for authentication. | Yes |
| `project` | The Cloudflare project to delete deployments from. | Yes |
| `account` | The Cloudflare account to delete deployments from. | Yes |
| `branch` | The branch to delete deployments from. | Yes |
#### Token

Use the worker template as a base when generating the token in the Cloudflare dashboard.

### Example usage

```yaml
uses: go-fjords/cloudflare-delete-deployments-action@main
with:
  token: ${{ secrets.CLOUDFLARE_TOKEN }}
  project: <your-project-name>
  account: <your-account-name>
  branch: <your-branch-name>
```

## Development

Install the dependencies:

```bash
npm install
```

Run the tests :heavy_check_mark:

```bash
$ npm test
> jest

Browserslist: caniuse-lite is outdated. Please run:
  npx browserslist@latest --update-db
  Why you should do it regularly: https://github.com/browserslist/browserslist#browsers-data-updating
Running Cloudflare Deployments Delete Action
Fetching deployments for project undefined and branch undefined
::group::Fetching deployments
Fetching page 1 of deployments
::endgroup::
Found 1 deployments in total
Deleting 0 deployments matching branch undefined
::group::Deleted Deployments
::endgroup::
Finished Cloudflare Deployments Delete Action
 PASS  ./main.test.js
  ✓ test main (3 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.416 s, estimated 1 s
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml.
Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.
Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)