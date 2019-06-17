import { Text, TouchableOpacity, View } from 'react-native'
import React, { PureComponent } from 'react'
import moment from 'moment'

import { FilterModal, PickerFilter } from '@berty/component/Filters'
import {
  Flex,
  Header,
  Screen,
  SearchBar,
  Icon,
  Text as LibText,
} from '@berty/component'
import { Pagination, RelayContext } from '@berty/relay'
import { borderBottom, marginLeft, padding } from '@berty/common/styles'
import { colors } from '@berty/common/constants'
import { fragments } from '@berty/graphql'
import * as enums from '@berty/common/enums.gen'
import Button from '@berty/component/Button'
import { withRelayContext } from '@berty/relay/context'

const Item = fragments.Event(({ data, navigation }) => (
  <TouchableOpacity
    onPress={() => {
      navigation.navigate('devtools/eventdetails', { details: data })
    }}
    style={[
      {
        backgroundColor: colors.white,
        height: 72,
      },
      padding,
      borderBottom,
    ]}
  >
    <Flex.Cols align='center'>
      <Flex.Rows size={7} align='stretch' justify='center' style={[marginLeft]}>
        <Text
          ellipsizeMode='tail'
          numberOfLines={1}
          className='textEllipsis'
          style={{ color: colors.black }}
        >
          {data.ackedAt !== null ? (
            <Icon name={'check-circle'} color={colors.green} />
          ) : (
            <Icon name={'arrow-up-circle'} color={colors.red} />
          )}{' '}
          {
            {
              0: <Icon name={'check-circle'} color={colors.red} />,
              1: <Icon name={'phone-incoming'} color={colors.orange} />,
              2: <Icon name={'phone-outgoing'} color={colors.purple} />,
            }[data.direction]
          }{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {enums.ValueBertyEntityKindInputKind[data.kind]}
          </Text>
          {' (' + data.kind + ')'}
        </Text>
        <Text
          ellipsizeMode='tail'
          numberOfLines={1}
          className='textEllipsis'
          style={{ color: colors.blackGrey, fontSize: 12 }}
        >
          <Text style={{ fontWeight: 'bold' }}>ID</Text>
          {' ' + data.id}
        </Text>
        <Text
          ellipsizeMode='tail'
          numberOfLines={1}
          className='textEllipsis'
          style={{ color: colors.blackGrey, fontSize: 12 }}
        >
          <Text style={{ fontWeight: 'bold' }}>Created</Text>
          {` ${moment(data.createdAt).fromNow()} ${data.createdAt}`}
        </Text>
        <Text
          ellipsizeMode='tail'
          numberOfLines={1}
          className='textEllipsis'
          style={{ color: colors.blackGrey, fontSize: 12 }}
        >
          <Text style={{ fontWeight: 'bold' }}>Acked</Text>
          {data.ackedAt
            ? ` ${moment(data.ackedAt).fromNow()} ${data.ackedAt}`
            : ' never'}
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  </TouchableOpacity>
))

class EventList extends PureComponent {
  state = {
    search: '',
  }

  searchHandler = search => this.setState({ search })

  filter = EventList => {
    const { search } = this.state
    if (search === '') {
      return EventList
    } else {
      return EventList.filter(
        entry =>
          entry.id.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
          entry.kind.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
          entry.createdAt.toLowerCase().indexOf(search.toLowerCase()) > -1
      )
    }
  }

  componentWillMount () {
    this.props.navigation.setParams({
      filters: {
        onlyWithoutAckedAt: 0,
      },
    })
  }

  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <Header
          navigation={navigation}
          title='List events'
          titleIcon='list'
          backBtn
        />
      ),
    }
  }

  render () {
    const {
      navigation,
      context: { queries },
    } = this.props
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <Pagination
          query={queries.EventList.graphql}
          variables={{
            ...queries.EventList.defaultVariables,
            ...navigation.getParam('filters'),
          }}
          fragment={fragments.EventList}
          alias='EventList'
          renderItem={props => <Item {...props} navigation={navigation} />}
          ListHeaderComponent={
            <View style={padding}>
              <SearchBar onChangeText={search => this.searchHandler(search)}>
                <LibText
                  size={0}
                  height={34}
                  icon='filter'
                  padding
                  middle
                  large
                  onPress={() =>
                    navigation.navigate('modal/devtools/event/list/filters', {
                      defaultData: navigation.getParam('filters'),
                      onSave: filters => navigation.setParams({ filters }),
                    })
                  }
                />
              </SearchBar>
            </View>
          }
        />
      </Screen>
    )
  }
}

class EventListFilterModalWithContext extends PureComponent {
  static contextType = RelayContext
  render () {
    const { navigation } = this.props
    return (
      <FilterModal
        title={'Filter events'}
        navigation={navigation}
        defaultData={navigation.getParam('defaultData')}
      >
        <PickerFilter
          name='onlyWithoutAckedAt'
          choices={[
            { value: 0, label: 'All values' },
            { value: 1, label: 'AckedAt is not defined' },
            { value: 2, label: 'AckedAt is defined' },
          ]}
        />
        <Button
          onPress={() =>
            this.props.context.mutations.debugRequeueAll({
              t: true,
            })
          }
          icon={'radio'}
          style={{ textAlign: 'left' }}
        >
          Requeue all non acked
        </Button>
      </FilterModal>
    )
  }
}

export const EventListFilterModal = withRelayContext(
  EventListFilterModalWithContext
)
export default withRelayContext(EventList)