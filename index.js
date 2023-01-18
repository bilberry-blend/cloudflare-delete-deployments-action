// @ts-check
const core = require('@actions/core')
const { main } = require('./main')

// Input parameters needed to identify the deployments to delete
const project = core.getInput('project')
const account = core.getInput('account')
const branch = core.getInput('branch')
const since = core.getInput('since', { required: false })
const deploymentTriggerType = core.getInput('deployment_trigger', { required: false })
const keep = core.getInput('keep', { required: false })

// Sensitive input parameters to authenticate with the API
const token = core.getInput('token')
core.setSecret(token) // Ensure Cloudflare token does not leak into logs

try {
  main({ project, account, branch, since, token, deploymentTriggerType, keep })
} catch (error) {
  core.setFailed(error.message)
}
