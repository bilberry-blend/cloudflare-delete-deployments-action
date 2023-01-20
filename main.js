const core = require('@actions/core')
const http = require('@actions/http-client')

/** @typedef {import('./typings/dependencies').Response} ListDependencies */
/** @typedef {import('@actions/http-client/lib/interfaces').TypedResponse<ListDependencies>} ListDependenciesResponse */
/** @typedef {import('./typings/delete-dependencies').Response} DeleteDependencies */

const apiUrl = 'https://api.cloudflare.com/client/v4'
const httpClient = new http.HttpClient('Cloudflare Pages Deployments Delete Action')

/**
 *  Return a promise that resolves after the delay
 *
 * @param {number} delay
 */
const wait = delay => new Promise(resolve => setTimeout(resolve, delay))

/**
 * Fetch list of Cloudflare deployments
 *
 * @param {string} project
 * @param {string} account
 * @param {Date} since
 * @param {string} token
 */
const getDeployments = async (project, account, since, token) => {
  core.startGroup('Fetching deployments')

  /** @type {import('./typings/dependencies').Response['result']} */
  const deployments = []

  let page = 1
  let lastResult
  let resultInfo
  let hasNextPage
  let dateSinceNotReached

  do {
    core.info(
      `Fetching page ${page} / ${
        resultInfo ? Math.ceil(resultInfo.total_count / resultInfo.per_page) : '?'
      } of deployments`
    )
    /** @type {ListDependenciesResponse} */

    const res = await httpClient.getJson(
      `${apiUrl}/accounts/${account}/pages/projects/${project}/deployments?page=${page}&sort_by=created_on&sort_order=desc`,
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
    const nextResults = res.result.result
    lastResult = nextResults[nextResults.length - 1]

    deployments.push(...nextResults)
    hasNextPage = page++ < Math.ceil(resultInfo.total_count / resultInfo.per_page)
    dateSinceNotReached = new Date(lastResult.created_on).getTime() >= since.getTime()
    await wait(250) // Api rate limit is 1200req/5min <--> 4req/s
  } while (hasNextPage && dateSinceNotReached)

  core.endGroup()
  return deployments
}

/**
 * @param {import('./typings/dependencies').Deployment} deployment
 */
const deleteDeployment = async (project, account, token, force, deployment) => {
  const res = await httpClient.del(
    `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}/deployments/${deployment.id}${
      force ? '?force=true' : ''
    }`,
    {
      authorization: `Bearer ${token}`,
    }
  )

  /** @type {DeleteDependencies} */
  const body = JSON.parse(await res.readBody())

  await wait(250) // Api rate limit is 1200req/5min <--> 4req/s

  if (!body.success) {
    throw new Error(body.errors.map(e => e.message).join('\n'))
  }

  // Returns null, but value is not used anyway
  return null
}

/**
 *  Transform a date string to a Date object
 *
 * @param {string} input
 */
const sinceDate = input => {
  if (input === '') return new Date(0)

  const date = new Date(input)

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid since date: ${input}`)
  }

  return date
}

const parseNumber = input => {
  core.info('Keep value: ' + input)
  const number = Number.parseInt(input, 10)
  if (isNaN(number)) {
    throw new Error(`Invalid keep value: ${input}`)
  }

  return number
}

const main = async ({ project, account, branch, since, token, deploymentTriggerType, keep }) => {
  core.info('🏃‍♀️ Running Cloudflare Deployments Delete Action')

  const sinceSafe = sinceDate(since)
  const keepNumber = parseNumber(keep)

  core.info(`Fetching deployments for project ${project} since ${sinceSafe.toISOString()}`)

  /** @type {import('./typings/dependencies').Response['result']} */
  const deployments = await getDeployments(project, account, sinceSafe, token)

  core.info(`Found ${deployments.length} deployments in total`)

  // Filter deployments by branch name
  const branchDeployments = deployments
    .filter(d => new Date(d.created_on).getTime() >= sinceSafe.getTime())
    .filter(d => deploymentTriggerType === '' || d.deployment_trigger.type === deploymentTriggerType)
    .filter(d => d.deployment_trigger.metadata.branch === branch)
    .slice(keepNumber)

  core.info(`🪓 Deleting ${branchDeployments.length} deployments matching branch ${branch}`)

  core.startGroup('Deleted Deployments')
  // Delete all deployments for the branch
  let deleted = 0
  for (let i = 0; i < branchDeployments.length; i++) {
    try {
      await deleteDeployment(project, account, token, keepNumber === 0, branchDeployments[i])
      deleted = deleted + 1
      core.info(`🟢 Deleted deployment ${branchDeployments[i].id}`)
    } catch (e) {
      core.error(`🔴 Failed to delete deployment ${branchDeployments[i].id}`)
    }
  }
  core.endGroup()

  core.info('🎉 Finished Cloudflare Deployments Delete Action')

  // Used mainly for testing purposes
  return deleted
}

exports.main = main
