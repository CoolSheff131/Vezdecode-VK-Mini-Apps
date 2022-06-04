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
  Switch,
  Avatar,
  SimpleCell,
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

  const [errorFormText, setErrorFormText] = React.useState(null);
  const [locationFormText, setLocationFormText] = React.useState('');
  const [isAddingLocation, setIsAddingLocation] = React.useState(true);
  const [indexOfChangingLocation, setIndexOfChangingLocation] = React.useState(0);

  const [playerNameFormText, setPlayerNameFormText] = React.useState('');
  const [players, setPlayers] = React.useState([]);
  const [isShowPlayersLocation, setIsShowPlayersLocation] = React.useState(false);
  const [errorNumberOfPlayerText, setErrorNumberOfPlayerText] = React.useState('');
  const [isValidNumberOfPlayers, setIsValidNumberOfPlayers] = React.useState(true);

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
      setPlayers((playersPrev) => [
        ...playersPrev,
        { name: playerNameFormText, location: randomPickedLocation },
      ]);
    } else {
      setPickedLocation('Вы шпион');
      setNumberOfSpysToPick(numberOfSpysToPick - 1);
      setPlayers((playersPrev) => [
        ...playersPrev,
        { name: playerNameFormText, location: 'Шпион' },
      ]);
    }
    setPlayerNameFormText('');
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

  const addLocation = () => {
    if (!locationFormText) {
      setErrorFormText('Поле не должно быть пустым');
      return;
    } else {
      setErrorFormText('');
    }
    const isSameLocationName = allLocations.filter((location) => location == locationFormText);
    console.log(isSameLocationName.length > 0);
    if (isSameLocationName.length > 0) {
      setErrorFormText('Такое название локации уже существет!');
    } else {
      setAllLocations([...allLocations, locationFormText]);
      setLocationFormText('');
      setErrorFormText('');
    }
  };

  const startChangeLocation = (locationName) => {
    const index = allLocations.indexOf(locationName);
    setIndexOfChangingLocation(index);
    setLocationFormText(locationName);
    setIsAddingLocation(false);
  };

  const changeLocation = () => {
    const isSameLocationName = allLocations.filter((location) => location == locationFormText);

    if (isSameLocationName.length > 0) {
      setErrorFormText('Такое название локации уже существет!');
    } else {
      const copyArr = [...allLocations];
      copyArr[indexOfChangingLocation] = locationFormText;
      setAllLocations([...copyArr]);
      setLocationFormText('');
      setErrorFormText('');
      setIsAddingLocation(true);
    }
  };

  const cancelChangeLocation = () => {
    setLocationFormText('');
    setErrorFormText('');
    setIsAddingLocation(true);
  };

  const deleteLocation = (locationName) => {
    setAllLocations(allLocations.filter((location) => locationName !== location));
  };

  const checkNumberOfPlayers = React.useCallback(
    (number) => {
      if (!Number.isInteger(number)) {
        return setErrorNumberOfPlayerText('Число игроков должно быть целым');
      }
      if (number < 1) {
        setInputNumberOfPlayers(1);
        return setErrorNumberOfPlayerText('Число игроков должно быть положительным');
      }
      if (number > locationsToDraw.length) {
        setInputNumberOfPlayers(locationsToDraw.length);
        return setErrorNumberOfPlayerText('Число игроков должно быть меньше числа локаций');
      }
      setInputNumberOfPlayers(number);
      setErrorNumberOfPlayerText('');
    },
    [locationsToDraw],
  );

  React.useEffect(() => {
    checkNumberOfPlayers(inputNumberOfPlayers);
  }, [locationsToDraw]);

  const onNumberOfPlayersChange = (e) => {
    const value = +e.target.value;
    checkNumberOfPlayers(value);
  };

  return (
    <Panel id={id}>
      <PanelHeader>Example</PanelHeader>

      <Group>
        <Div>
          {!numberOfPlayers && (
            <>
              <Div>
                <FormItem top="Название локации">
                  <Input
                    type="text"
                    value={locationFormText}
                    onChange={(e) => {
                      setLocationFormText(e.target.value);
                    }}
                    disabled={false}
                  />
                </FormItem>
                <FormItem>
                  {errorFormText}
                  {!isAddingLocation && (
                    <Input
                      onClick={() => cancelChangeLocation()}
                      type="button"
                      defaultValue="Отменить"
                      disabled={false}
                    />
                  )}
                  <Input
                    onClick={() => (isAddingLocation ? addLocation() : changeLocation())}
                    type="button"
                    defaultValue={isAddingLocation ? 'Добавить' : 'Изменить'}
                    disabled={false}
                  />
                </FormItem>
                <h1>Все локации</h1>
                <ul>
                  {allLocations.map((location) => {
                    return (
                      <li
                        key={location}
                        style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{location}</span>
                        <div>
                          <Button mode="secondary" onClick={() => startChangeLocation(location)}>
                            Изменить
                          </Button>
                          <Button mode="secondary" onClick={() => deleteLocation(location)}>
                            Удалить
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Div>
              <h1>Введите количество игроков</h1>
              <FormItem top="Количество игроков">
                <Input
                  type="number"
                  value={inputNumberOfPlayers}
                  onChange={onNumberOfPlayersChange}
                  disabled={false}
                  inputMode="numeric"
                />
              </FormItem>
              {errorNumberOfPlayerText}
              <FormItem top="Подтвердить">
                <Input
                  onClick={() => submitNumberOfPlayers(inputNumberOfPlayers)}
                  type="button"
                  defaultValue="Подтвердить"
                  disabled={errorNumberOfPlayerText}
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
                      <span>Ваша локация:</span>
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
                      <FormItem top="Введите название игрока">
                        <Input
                          type="text"
                          value={playerNameFormText}
                          onChange={(e) => {
                            setPlayerNameFormText(e.target.value);
                          }}
                          disabled={false}
                        />
                      </FormItem>
                      <FormItem top={!playerNameFormText && 'Введите имя!'}>
                        <Input
                          onClick={() => pickLocation()}
                          type="button"
                          defaultValue="Показать мою локацию"
                          disabled={!playerNameFormText}
                        />
                      </FormItem>
                    </>
                  )}
                </>
              )}

              {!numberOfPlayersToPickCard && (
                <>
                  <SimpleCell
                    Component="label"
                    after={
                      <Switch
                        value={isShowPlayersLocation}
                        onChange={(e) => setIsShowPlayersLocation((prev) => !prev)}
                      />
                    }>
                    Показать локации игроков
                  </SimpleCell>

                  <h1>Все игроки:</h1>
                  {players.map((player) => (
                    <div key={player.location}>
                      {player.name}
                      {isShowPlayersLocation && `: ${player.location}`}
                    </div>
                  ))}
                </>
              )}

              {isStarted && (
                <>
                  <h1>Оставшееся время: {seconds} c.</h1>
                </>
              )}
            </>
          )}
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
