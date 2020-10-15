import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Moment from 'react-moment'
import {
  LabelIcon
} from '../icons'

function Sidebar ({ app, conversation }) {
  const participant = conversation.mainParticipant
  if(!participant)
    return null
  return (
    <div className="xl:border-r xl:border-gray-200 bg-white">
      <div className="px-2 py-16">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-8">
            <div className="space-y-8 sm:space-y-0 sm:flex sm:justify-between sm:items-center xl:block xl:space-y-8">
              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-12 w-12">
                  <img className="h-12 w-12 rounded-full"
                    src={participant.avatarUrl}
                    alt=""
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm leading-5 font-medium text-gray-900">
                    {participant.displayName} </div>
                  <a href="#" className="group flex items-center space-x-2.5">
                    <div className="text-sm leading-5 text-gray-500 group-hover:text-gray-900 font-medium">
                      {participant.email}
                    </div>
                  </a>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:space-x-3 sm:flex-row xl:flex-col xl:space-x-0 xl:space-y-3">
                <span className="inline-flex rounded-md shadow-sm">
                  <Link
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                    to={`/apps/${app.key}/users/${participant.id}`}>
                    show profile
                  </Link>
                </span>
              </div>
            </div>
            {/* Meta info */}
            <div className="flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
              <div className="flex items-center space-x-2">
                <span aria-label="Running" className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="h-2 w-2 bg-green-400 rounded-full" />
                </span>
                <span className="text-sm text-gray-500 leading-5 font-medium">
                  {conversation.state}
                </span>
              </div>

              { conversation.tagList.length > 0 && 
                <div className="flex items-center space-x-2">
                  <LabelIcon className="h-5 w-5 text-gray-400"/>
                  <span className="text-sm text-gray-500 leading-5 font-medium">
                    {conversation.tagList.map((tag) => `#${tag}`).join(', ')}
                  </span>
                </div>
              }

              <dl className="space-y-2 divide-y divide-gray-200">

                {conversation.latestUserVisibleCommentAt && <div className="space-y-2 pt-2">
                  <dt className="text-sm leading-5 font-medium text-gray-500">
                  {
                    I18n.t("conversation.sidebar.latest_user_visible_comment_at")
                  }
                  </dt>
                  <dd className="mt-1 text-sm leading-5 text-gray-900">
                    { conversation.latestUserVisibleCommentAt && 
                      <Moment fromNow ago>
                      { Date.parse(conversation.latestUserVisibleCommentAt) }
                    </Moment>
                    }
                  </dd>
                </div>}

                {conversation.firstAgentReply && <div className="space-y-2 pt-2">
                  <dt className="text-sm leading-5 font-medium text-gray-500">
                  {
                    I18n.t("conversation.sidebar.first_agent_reply")
                  }
                  </dt>
                  <dd className="mt-1 text-sm leading-5 text-gray-900">
                    { conversation.firstAgentReply &&
                      <Moment fromNow ago>
                      { Date.parse(conversation.firstAgentReply) }
                    </Moment>
                    }
                  </dd>
                </div>}

                {conversation.createdAt && <div className="space-y-2 pt-2">
                  <dt className="text-sm leading-5 font-medium text-gray-500">
                    {
                      I18n.t('conversation.sidebar.created_at')
                    }
                  </dt>
                  <dd className="mt-1 text-sm leading-5 text-gray-900">
                    { conversation.createdAt &&
                      <Moment fromNow ago>
                      { Date.parse(conversation.createdAt) }
                    </Moment>
                    }
                  </dd>
                </div>}


                {conversation.assignee && 
                  <div className="space-y-2 pt-2">
                    <dt className="text-sm leading-5 font-medium text-gray-500">
                      {I18n.t('conversation.sidebar.assignee')}
                    </dt>
                    <dd className="mt-1 text-sm leading-5 text-gray-900">
                      <a href="#" className="relative group flex items-center space-x-2.5">
                        <img className="rounded-full flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-gray-500"
                          src={conversation.assignee.avatarUrl}>
                        </img>
                        <div className="text-sm leading-5 text-gray-500 group-hover:text-gray-900 font-medium truncate">
                          {conversation.assignee && conversation.assignee.email}
                        </div>
                      </a>
                    </dd>
                  </div>
                }
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  const { auth, app, conversation, current_user, drawer } = state
  const { messages, loading } = conversation
  const { jwt } = auth

  return {
    conversation,
    current_user,
    messages,
    app,
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(Sidebar))
