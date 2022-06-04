import React from 'react';
import PropTypes from 'prop-types';

import {
  Panel,
  PanelHeader,
  Header,
  Button,
  Group,
  Cell,
  Div,
  Input,
  FormItem,
  Avatar,
} from '@vkontakte/vkui';

const Home = ({ id, go, fetchedUser }) => {
  const [allLocations, setAllLocations] = React.useState([
    'Орбитальная станция',
    'Вечеринка в клубе',
    'войско крестоносцев',
    'больница',
    'больница1',
    'больница2',
    'больница3',
    'больница4',
    'больница5',
    'больница6',
    'больница7',
  ]);
  const [locationsToDraw, setLocationsToDraw] = React.useState(allLocations);
  const [isPickingLocation, setIsPickingLocation] = React.useState(true);
  const [pickedLocation, setPickedLocation] = React.useState();
  const [numberOfPlayers, setNumberOfPlayers] = React.useState(0);
  const [numberOfPlayersToPickCard, setNumberOfPlayersToPickCard] = React.useState(0);
  const [inputNumberOfPlayers, setInputNumberOfPlayers] = React.useState(1);
  const [numberOfSpys, setNumberOfSpys] = React.useState(1);
  const [numberOfSpysToPick, setNumberOfSpysToPick] = React.useState(1);

  const isDrawSpy = () => {
    if (numberOfSpysToPick === 0) {
      return false;
    } else {
      const probToPickSpy = numberOfSpys / numberOfPlayersToPickCard;
      const prob = Math.random();
      if (prob < probToPickSpy) {
        return true;
      } else {
        return false;
      }
    }
  };

  const pickLocation = () => {
    if (!isDrawSpy()) {
      const randomPickedLocation =
        locationsToDraw[Math.floor(Math.random() * locationsToDraw.length)];
      setPickedLocation(randomPickedLocation);
      setLocationsToDraw(locationsToDraw.filter((location) => randomPickedLocation !== location));
    } else {
      setPickedLocation('Вы шпион');
      setNumberOfSpysToPick(numberOfSpysToPick - 1);
    }
    setIsPickingLocation(false);
  };

  const submitLocation = () => {
    setNumberOfPlayersToPickCard(numberOfPlayersToPickCard - 1);
    setIsPickingLocation(true);
  };

  const submitNumberOfPlayers = (numberOfPlayers) => {
    setNumberOfPlayers(numberOfPlayers);
    setNumberOfPlayersToPickCard(numberOfPlayers);
    if (numberOfPlayers > 6) {
      setNumberOfSpys(2);
      setNumberOfSpysToPick(2);
    } else {
      setNumberOfSpys(1);
      setNumberOfSpysToPick(1);
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader>Example</PanelHeader>
      {fetchedUser && (
        <Group header={<Header mode="secondary">User Data Fetched with VK Bridge</Header>}>
          <Cell
            before={fetchedUser.photo_200 ? <Avatar src={fetchedUser.photo_200} /> : null}
            description={fetchedUser.city && fetchedUser.city.title ? fetchedUser.city.title : ''}>
            {`${fetchedUser.first_name} ${fetchedUser.last_name}`}
          </Cell>
        </Group>
      )}

      <Group header={<Header mode="secondary">Локации</Header>}>
        {!numberOfPlayers && (
          <>
            <h1>Введите количество игроков</h1>
            <FormItem top="Количество игроков">
              <Input
                type="number"
                value={inputNumberOfPlayers}
                onChange={(e) => {
                  if (Number.isInteger(+e.target.value)) {
                    setInputNumberOfPlayers(e.target.value);
                  }
                }}
                disabled={false}
                inputMode="numeric"
              />
            </FormItem>
            <FormItem top="Подтвердить">
              <Input
                onClick={() => submitNumberOfPlayers(inputNumberOfPlayers)}
                type="button"
                defaultValue="Подтвердить"
                disabled={false}
              />
            </FormItem>
          </>
        )}

        {numberOfPlayers && (
          <>
            <h1>Осталось игроков для выдачи карт {numberOfPlayersToPickCard} </h1>
            {numberOfPlayersToPickCard && (
              <>
                {!isPickingLocation && (
                  <>
                    <h2>Ваша локация</h2>
                    <h1>{pickedLocation}</h1>
                    <FormItem top="Передайте другому игроку телефон">
                      <Input
                        onClick={() => submitLocation()}
                        type="button"
                        defaultValue="Подтвердить"
                        disabled={false}
                      />
                    </FormItem>
                  </>
                )}
                {isPickingLocation && (
                  <>
                    <FormItem top="Локация">
                      <Input
                        onClick={() => pickLocation()}
                        type="button"
                        defaultValue="Показать мою локацию"
                        disabled={false}
                      />
                    </FormItem>
                  </>
                )}
              </>
            )}

            {!numberOfPlayersToPickCard && (
              <>
                <h1>Все игроки взяли карту</h1>
              </>
            )}
          </>
        )}

        {allLocations.map((location) => {
          return <h1 key={location}>{location}</h1>;
        })}

        <Div>
          <Button stretched size="l" mode="secondary" onClick={go} data-to="persik">
            Show me the Persik, please
          </Button>
        </Div>
      </Group>
    </Panel>
  );
};

Home.propTypes = {
  id: PropTypes.string.isRequired,
  go: PropTypes.func.isRequired,
  fetchedUser: PropTypes.shape({
    photo_200: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    city: PropTypes.shape({
      title: PropTypes.string,
    }),
  }),
};

export default Home;
