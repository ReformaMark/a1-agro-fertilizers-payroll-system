const API_BASE_URL = 'https://psgc.gitlab.io/api'

export interface Region {
    code: string;
    name: string;
    regionName: string;
}

export interface Province {
    code: string;
    name: string;
    regionCode: string;
}

export interface City {
    code: string;
    name: string;
    provinceCode: string;
    postalCode: string;
}

export interface Barangay {
    code: string;
    name: string;
    cityCode: string;
}

export async function fetchRegions(): Promise<Region[]> {
    const response = await fetch(`${API_BASE_URL}/regions`)
    const data = await response.json()
    return data.sort((a: Region, b: Region) => a.name.localeCompare(b.name))
}

export async function fetchProvinces(regionCode: string): Promise<Province[]> {
    const response = await fetch(`${API_BASE_URL}/regions/${regionCode}/provinces`)
    const data = await response.json()
    return data.sort((a: Province, b: Province) => a.name.localeCompare(b.name))
}

export async function fetchCities(regionCode: string): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/regions/${regionCode}/cities-municipalities`)
    const data = await response.json()
    return data.sort((a: City, b: City) => a.name.localeCompare(b.name))
}

export async function fetchBarangays(cityCode: string): Promise<Barangay[]> {
    const response = await fetch(`${API_BASE_URL}/cities-municipalities/${cityCode}/barangays`)
    const data = await response.json()
    return data.sort((a: Barangay, b: Barangay) => a.name.localeCompare(b.name))
}