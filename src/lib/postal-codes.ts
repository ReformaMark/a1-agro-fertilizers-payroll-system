import zipCodes from './zip-codes.json'

interface ZipCodeData {
    [key: string]: string | string[]
}

export function normalizeLocation(location: string): string {
    return location
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9\s]/g, "")     // Remove special characters
        .trim()
}

export function findPostalCodeByBarangay(barangayName: string, cityName: string): string {
    const normalizedBarangay = normalizeLocation(barangayName)
    const normalizedCity = normalizeLocation(cityName)
    const data = zipCodes as ZipCodeData

    // First try to find the barangay in arrays
    for (const [code, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            if (value.some(brgy => normalizeLocation(brgy) === normalizedBarangay)) {
                return code
            }
        }
    }

    // Then try single string values
    for (const [code, value] of Object.entries(data)) {
        if (typeof value === 'string' && normalizeLocation(value) === normalizedBarangay) {
            return code
        }
    }

    // If no match found, try to find a default postal code for the city
    for (const [code, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            if (value.some(loc => normalizeLocation(loc).includes(normalizedCity))) {
                return code
            }
        } else if (normalizeLocation(value).includes(normalizedCity)) {
            return code
        }
    }

    return ''
}