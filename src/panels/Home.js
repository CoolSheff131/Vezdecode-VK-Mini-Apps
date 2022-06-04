import React from 'react';
import PropTypes from 'prop-types';
import bridge from '@vkontakte/vk-bridge';
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
  const [seconds, setSeconds] = React.useState(0);
  const [isStarted, setIsStarted] = React.useState(false);
  const [timerId, setTimerId] = React.useState(null);

  React.useEffect(() => {
    if (isStarted) {
      let timerId = setInterval(() => {
        if (seconds > 0) {
          setSeconds((secondsPrev) => secondsPrev - 1);
        }
      }, 1000);
      setTimerId(timerId);
    }
  }, [isStarted]);

  React.useEffect(() => {
    if (seconds == 0) {
      clearTimeout(timerId);
    }
    if (seconds < 5) {
      bridge.send('VKWebAppFlashSetLevel', { level: 1 });
    }
  }, [seconds]);

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
    if (numberOfPlayersToPickCard - 1 === 0) {
      setIsStarted(true);
    }
    setNumberOfPlayersToPickCard(numberOfPlayersToPickCard - 1);
    setIsPickingLocation(true);
  };

  const submitNumberOfPlayers = (numberOfPlayers) => {
    setNumberOfPlayers(numberOfPlayers);
    setNumberOfPlayersToPickCard(numberOfPlayers);
    setSeconds(60 * numberOfPlayers);
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
        <Div>
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

              {isStarted && (
                <>
                  <h1>Оставшееся время: {seconds} c.</h1>
                </>
              )}
            </>
          )}

          {allLocations.map((location) => {
            return <h1 key={location}>{location}</h1>;
          })}
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
