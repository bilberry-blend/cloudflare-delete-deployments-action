const main = require('./main')

jest.mock('@actions/http-client', () => ({
  HttpClient: jest.fn().mockImplementation(() => ({
    getJson: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        statusCode: 200,
        headers: {},
        result: mockDeploymentsResponse,
      })
    }),
    del: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        readBody: jest.fn().mockImplementation(() => {
          console.log('readBody')
          return Promise.resolve(
            JSON.stringify({
              success: true,
              errors: [],
            })
          )
        }),
      })
    }),
  })),
}))

// Mock deployments response
const mockDeploymentsResponse = {
  success: true,
  errors: [],
  messages: [],
  result: [
    {
      id: 'f64788e9-fccd-4d4a-a28a-cb84f88f6',
      short_id: 'f64788e9',
      project_id: '7b162ea7-7367-4d67-bcde-1160995d5',
      project_name: 'ninjakittens',
      environment: 'preview',
      url: 'https://f64788e9.ninjakittens.pages.dev',
      created_on: '2021-03-09T00:55:03.923456Z',
      modified_on: '2021-03-09T00:58:59.045655',
      aliases: ['https://branchname.projectname.pages.dev'],
      is_skipped: true,
      latest_stage: {
        name: 'deploy',
        started_on: '2021-03-09T00:55:03.923456Z',
        ended_on: '2021-03-09T00:58:59.045655',
        status: 'success',
      },
      env_vars: {
        BUILD_VERSION: {
          value: '3.3',
        },
        ENV: {
          value: 'STAGING',
        },
      },
      deployment_trigger: {
        type: 'github:push',
        metadata: {
          branch: 'foo',
          commit_hash: 'ad9ccd918a81025731e10e40267e11273a263421',
          commit_message: 'Update index.html',
        },
      },
      stages: [
        {
          name: 'queued',
          started_on: '2021-06-03T15:38:15.608194Z',
          ended_on: '2021-06-03T15:39:03.134378Z',
          status: 'active',
        },
        {
          name: 'initialize',
          started_on: null,
          ended_on: null,
          status: 'idle',
        },
        {
          name: 'clone_repo',
          started_on: null,
          ended_on: null,
          status: 'idle',
        },
        {
          name: 'build',
          started_on: null,
          ended_on: null,
          status: 'idle',
        },
        {
          name: 'deploy',
          started_on: null,
          ended_on: null,
          status: 'idle',
        },
      ],
      build_config: {
        build_command: 'npm run build',
        destination_dir: 'build',
        root_dir: '/',
        web_analytics_tag: 'cee1c73f6e4743d0b5e6bb1a0bcaabcc',
        web_analytics_token: '021e1057c18547eca7b79f2516f06o7x',
      },
      source: {
        type: 'github',
        config: {
          owner: 'cloudflare',
          repo_name: 'ninjakittens',
          production_branch: 'main',
          pr_comments_enabled: true,
          production_deployments_enabled: true,
          preview_deployment_setting: 'custom',
          preview_branch_includes: ['release/*', 'production', 'main'],
          preview_branch_excludes: ['dependabot/*', 'dev', '*/ignore'],
        },
      },
    },
    {
      id: 'f64788e9-fccd-4d4a-a28a-cb84f88f6',
      short_id: 'f64788e9',
      project_id: '7b162ea7-7367-4d67-bcde-1160995d5',
      project_name: 'ninjakittens',
      environment: 'preview',
      url: 'https://f64788e9.ninjakittens.pages.dev',
      created_on: '2021-03-09T00:45:03.923456Z',
      modified_on: '2021-03-09T00:58:59.045655',
      aliases: ['https://branchname.projectname.pages.dev'],
      is_skipped: true,
      latest_stage: {
        name: 'deploy',
        started_on: '2021-03-09T00:55:03.923456Z',
        ended_on: '2021-03-09T00:58:59.045655',
        status: 'success',
      },
      env_vars: {
        BUILD_VERSION: {
          value: '3.3',
        },
        ENV: {
          value: 'STAGING',
        },
      },
      deployment_trigger: {
        type: 'github:push',
        metadata: {
          branch: 'foo',
          commit_hash: 'ad9ccd918a81025731e10e40267e11273a263421',
          commit_message: 'Update index.html',
        },
      },
      stages: [
        {
          name: 'queued',
          started_on: '2021-06-03T15:38:15.608194Z',
          ended_on: '2021-06-03T15:39:03.134378Z',
          status: 'active',
        },
        {
          name: 'initialize',
          started_on: null,
          ended_on: null,
          status: 'idle',
        },
        {
          name: 'clone_repo',
          started_on: null,
          ended_on: null,
          status: 'idle',
        },
        {
          name: 'build',
          started_on: null,
          ended_on: null,
          status: 'idle',
        },
        {
          name: 'deploy',
          started_on: null,
          ended_on: null,
          status: 'idle',
        },
      ],
      build_config: {
        build_command: 'npm run build',
        destination_dir: 'build',
        root_dir: '/',
        web_analytics_tag: 'cee1c73f6e4743d0b5e6bb1a0bcaabcc',
        web_analytics_token: '021e1057c18547eca7b79f2516f06o7x',
      },
      source: {
        type: 'github',
        config: {
          owner: 'cloudflare',
          repo_name: 'ninjakittens',
          production_branch: 'main',
          pr_comments_enabled: true,
          production_deployments_enabled: true,
          preview_deployment_setting: 'custom',
          preview_branch_includes: ['release/*', 'production', 'main'],
          preview_branch_excludes: ['dependabot/*', 'dev', '*/ignore'],
        },
      },
    },
  ],
  result_info: {
    page: 1,
    per_page: 100,
    count: 1,
    total_count: 1,
  },
}

test('test main', async () => {
  const task = main.main('ninjakittens', 'cloudflare', 'foo', '', 'example-token')
  expect(task).resolves.toBe(1)
})

test('test main with since', async () => {
  const task = main.main('ninjakittens', 'cloudflare', 'foo', '2021-03-09T00:30:03.923456Z', 'example-token')
  expect(task).resolves.toBe(1)
})
