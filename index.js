// @ts-check
const core = require('@actions/core')
const { main } = require('./main')

// Input parameters needed to identify the deployments to delete
const project = core.getInput('project')
const account = core.getInput('account')
const branch = core.getInput('branch')

// Sensitive input parameters to authenticate with the API
const token = core.getInput('token')
core.setSecret(token) // Ensure Cloudflare token does not leak into logs

try {
  main(project, account, branch, token)
} catch (error) {
  core.setFailed(error.message)
}
