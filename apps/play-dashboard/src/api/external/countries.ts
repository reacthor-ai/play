type CountryData = {
  name: string;
  iso2: string;
  long: number;
  lat: number;
}

type ApiResponse = {
  error: boolean;
  msg: string;
  data: CountryData[];
}

export const getExternalApiCountries = async (): Promise<string[]> => {
  const response = await fetch('https://countriesnow.space/api/v0.1/countries/positions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'force-cache',
    next: {revalidate: 3600}
  });
  const data: ApiResponse = await response.json();
  return data.data.map(country => country.name);
};