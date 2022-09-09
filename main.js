const core = require('@actions/core')
const http = require('@actions/http-client')

/** @typedef {import('./typings/dependencies').Response} ListDependencies */
/** @typedef {import('@actions/http-client/lib/interfaces').TypedResponse<ListDependencies>} ListDependenciesResponse */
/** @typedef {import('./typings/delete-dependencies').Response} DeleteDependencies */

const apiUrl = 'https://api.cloudflare.com/client/v4'
const httpClient = new http.HttpClient('Cloudflare Pages Deployments Delete Action')

// Fetch list of Cloudflare deployments
const getDeployments = async (project, account, branch, token) => {
  core.startGroup('Fetching deployments')

  /** @type {import('./typings/dependencies').Response['result']} */
  const deployments = []

  let page = 1
  let resultInfo

  do {
    core.info(`Fetching page ${page} of deployments`)
    /** @type {ListDependenciesResponse} */
    const res = await httpClient.getJson(
      `${apiUrl}/accounts/${account}/pages/projects/${project}/deployments?page=${page}`,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!res.result) {
      throw new Error('Could not fetch deployments')
    }

    if (!res.result.success) {
      throw new Error(res.result.errors.map(e => e.message).join('\n'))
    }

    resultInfo = res.result.result_info

    deployments.push(...res.result.result)
  } while (page++ < Math.ceil(resultInfo.total_count / resultInfo.per_page))

  core.endGroup()
  return deployments
}

/**
 * @param {import('./typings/dependencies').Deployment} deployment
 */
const deleteDeployment = async (project, account, token, deployment) => {
  const res = await httpClient.del(
    `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}/deployments/${deployment.id}`,
    {
      authorization: `Bearer ${token}`,
    }
  )

  /** @type {DeleteDependencies} */
  const body = JSON.parse(await res.readBody())

  if (!body.success) {
    throw new Error(body.errors.map(e => e.message).join('\n'))
  }

  // Returns null, but value is not used anyway
  return null
}

const main = async (project, account, branch, token) => {
  core.info('🏃‍♀️ Running Cloudflare Deployments Delete Action')

  core.info(`Fetching deployments for project ${project} and branch ${branch}`)

  /** @type {import('./typings/dependencies').Response['result']} */
  const deployments = await getDeployments(project, account, branch, token)

  core.info(`Found ${deployments.length} deployments in total`)

  // Filter deployments by branch name
  const branchDeployments = deployments
    .filter(d => d.deployment_trigger.type === 'github:push')
    .filter(d => d.deployment_trigger.metadata.branch === branch)
    .slice(1)

  core.info(`🪓 Deleting ${branchDeployments.length} deployments matching branch ${branch}`)

  // Delete all deployments for the branch
  const deleted = await Promise.allSettled(branchDeployments.map(d => deleteDeployment(project, account, token, d)))

  core.startGroup('Deleted Deployments')

  // Log the results of the deletion, index should match
  deleted.forEach((d, i) => {
    if (d.status === 'fulfilled') {
      core.info(`🟢 Deleted deployment ${branchDeployments[i].id}`)
    } else {
      core.error(`🔴 Failed to delete deployment ${branchDeployments[i].id}`)
    }
  })
  core.endGroup()

  core.info('🎉 Finished Cloudflare Deployments Delete Action')
}

exports.main = main
