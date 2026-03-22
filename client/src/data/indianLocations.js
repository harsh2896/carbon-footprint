export const INDIAN_STATES_AND_CITIES = {
  'Uttar Pradesh': ['Varanasi', 'Lucknow', 'Kanpur', 'Prayagraj', 'Noida'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  Delhi: ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'],
};

export const DEFAULT_STATE = 'Uttar Pradesh';
export const DEFAULT_CITY = 'Varanasi';

export const getCitiesForState = (state) =>
  INDIAN_STATES_AND_CITIES[state] || INDIAN_STATES_AND_CITIES[DEFAULT_STATE];

export const getDefaultLocation = () => ({
  state: DEFAULT_STATE,
  city: DEFAULT_CITY,
});
