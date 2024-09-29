// types.ts

export type Parcel = {
  syncId: string;
  parcelId: number;
  title: string;
  firstName: string;
  surname: string;
  dispatchRef: string;
  barcode: string;
  dueDate: string;
  cellphone: string;
  idNumber: string;
  dateOfBirth: string;
  gender: string;
  consignmentNo: string;
  scanInDatetime: string;
  passcode: string;
  scanInByUserId: number;
  loggedInDatetime: string;
  scanOutDatetime: string;
  scanOutByUserId: number;
  parcelStatusId: number;
  deviceId: number;
  facilityId: number;
  dirtyFlag: number;
  parcelStatus: boolean;
};

export interface SmsData {
  syncId: string;
  parcelId: number;
  cellphone: string;
  smsCreatedDateTime: string; // Use a string or Date object depending on how you're passing the date
  deviceId: number;
  facilityId: number;
  smsTypeId: number;
  dirtyFlag: number;
}


