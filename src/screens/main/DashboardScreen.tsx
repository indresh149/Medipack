import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Calendar} from 'react-native-big-calendar';
import {Colors} from '../../../constants/colours';
import {fetchParcelsByStatusAndDueDate} from '../../../database/DatabseOperations';

const DashboardScreen = () => {
  const getDatesOfMonth = (year: number, month: number): string[] => {
    const dates = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      dates.push(date.toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const [events, setEvents] = useState<any[]>([]);
  const [currentMonthToDisplay, setCurrentMonthToDisplay] = useState(
    new Date().toLocaleString('default', {month: 'long'}),
  );
  const [currentYearToDisplay, setCurrentYearToDisplay] = useState(
    new Date().getFullYear(),
  );

  const fetchParcelsForMonth = async (year: number, month: number) => {
    const dates = getDatesOfMonth(year, month);
    const allEvents: any = [];

    for (const date of dates) {
      const scanInInParcels = await fetchParcelsByStatusAndDueDate(2, date);
      const scanOutParcels = await fetchParcelsByStatusAndDueDate(3, date);

      const parcelCountScanIn = scanInInParcels.length;
      const parcelCountScanOut = scanOutParcels.length;

      if (parcelCountScanIn > 0 || parcelCountScanOut > 0) {
        allEvents.push({
          start: new Date(date),
          end: new Date(date),
          parcelCountScanIn,
          parcelCountScanOut,
        });
      }
    }

    setEvents(allEvents);
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    fetchParcelsForMonth(currentYear, currentMonth);
  }, []);

  return (
    <>
      <Text style={styles.text}>
        {currentMonthToDisplay} {currentYearToDisplay}
      </Text>

      <Calendar
        mode="month"
        onPressEvent={event => console.log(event)}
        events={events}
        renderEvent={event => (
          <View>
            {event.parcelCountScanIn > 0 && (
              <View style={styles.pendingScanIn}>
                <Text style={styles.textWhite}>
                  {'Pending Scan In: '}
                  {event.parcelCountScanIn}
                </Text>
              </View>
            )}
            {event.parcelCountScanOut > 0 && (
              <View style={styles.pendingScanOut}>
                <Text style={styles.textWhite}>
                  {'Pending Scan Out: '}
                  {event.parcelCountScanOut}
                </Text>
              </View>
            )}
          </View>
        )}
        onSwipeEnd={(date: Date) => {
          const year = date.getFullYear();
          const month = date.getMonth();
          setCurrentMonthToDisplay(
            date.toLocaleString('default', {month: 'long'}),
          );
          setCurrentYearToDisplay(date.getFullYear());
          fetchParcelsForMonth(year, month);
        }}
        showAdjacentMonths={true}
        showVerticalScrollIndicator={true}
        height={600}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  pendingScanIn: {
    backgroundColor: Colors.yellow,
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.blue,
    marginBottom: 5,
  },
  pendingScanOut: {
    backgroundColor: Colors.blue,
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  textWhite: {
    color: 'white',
  },
});

export default DashboardScreen;
