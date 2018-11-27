import { graphql } from 'react-relay'

import { commit } from '../../relay'
import { contact } from '../../utils'

const ContactRemoveMutation = graphql`
  mutation ContactRemoveMutation(
    $id: ID!
    $displayName: String!
    $displayStatus: String!
    $overrideDisplayName: String!
    $overrideDisplayStatus: String!
  ) {
    ContactRemove(
      id: $id
      displayName: $displayName
      displayStatus: $displayStatus
      overrideDisplayName: $overrideDisplayName
      overrideDisplayStatus: $overrideDisplayStatus
    ) {
      id
      createdAt
      updatedAt
      deletedAt
      sigchain
      status
      devices {
        id
        createdAt
        updatedAt
        deletedAt
        name
        status
        apiVersion
        contactId
      }
      displayName
      displayStatus
      overrideDisplayName
      overrideDisplayStatus
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    ContactRemoveMutation,
    'ContactRemove',
    {
      ...contact.default,
      ...input,
    },
    {
      updater: (store, data) =>
        context.updaters.contactList.forEach(updater =>
          updater(store, data.ContactRemove, true)
        ),
      ...configs,
    }
  )
