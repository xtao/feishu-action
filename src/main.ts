import * as core from '@actions/core'
import got from 'got'

interface Message {
  title: string
  run_id: string
  run_number: string
  action_url: string
  job_status: string
  event_name: string
  committer: string
  compare_url: string
  repository: string
}

async function postMessage(): Promise<string> {
  const title: string = core.getInput('title')
  const run_id: string = core.getInput('run_id')
  const run_number: string = core.getInput('run_number')
  const action_url: string = core.getInput('action_url')
  const job_status: string = core.getInput('job_status')
  const event_name: string = core.getInput('event_name')
  const committer: string = core.getInput('committer')
  const compare_url: string = core.getInput('compare_url')
  const repository: string = core.getInput('repository')
  return await post({
    title,
    run_id,
    run_number,
    action_url,
    job_status,
    event_name,
    committer,
    compare_url,
    repository
  })
}

async function post(body: Message): Promise<string> {
  const url: string = core.getInput('url')
  const rsp = await got.post(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true,
          enable_forward: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: `Current State: ${body.job_status}\nTrigger: ${body.committer} ${body.event_name}`,
              tag: 'lark_md'
            }
          },
          {
            actions: [
              {
                tag: 'button',
                text: {
                  content: 'Code Review',
                  tag: 'lark_md'
                },
                url: body.compare_url,
                type: 'default',
                value: {}
              },
              {
                tag: 'button',
                text: {
                  content: 'Build Details',
                  tag: 'lark_md'
                },
                url: body.action_url,
                type: 'default',
                value: {}
              }
            ],
            tag: 'action'
          }
        ],
        header: {
          title: {
            content: `${body.repository} Action Notification`,
            tag: 'plain_text'
          }
        }
      }
    })
  })

  core.debug(rsp.body)
  return rsp.body
}

async function run(): Promise<void> {
  try {
    await postMessage()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
