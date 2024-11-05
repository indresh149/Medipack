import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {Calendar} from 'react-native-big-calendar';
import {Colors} from '../../../constants/colours';
import {fetchParcelsByStatusAndDueDate} from '../../../database/DatabseOperations';
import { RFPercentage } from 'react-native-responsive-fontsize';

const {height, width} = Dimensions.get('window');
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
        height={height * 0.8}
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
    color: Colors.black,
  },
  pendingScanIn: {
    backgroundColor: Colors.yellow,
    padding: height * 0.002,
    borderRadius:  RFPercentage(.2),
    borderWidth: 1,
    borderColor: Colors.blue,
    marginBottom: height * 0.004,
  },
  pendingScanOut: {
    padding: height * 0.002,
    backgroundColor: Colors.blue,
    marginBottom: height * 0.01,
    borderRadius:  RFPercentage(.2),
    borderWidth: 1,
    borderColor: Colors.black,
  },
  textWhite: {
    fontSize: RFPercentage(1.1),
    color: 'white',
  },
});

export default DashboardScreen;
